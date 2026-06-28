package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image"
	"golang.org/x/image/draw"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/deepteams/webp"
	"github.com/google/uuid"
	_ "golang.org/x/image/webp"
)

// ProcessThumbnailJob processes PDF, Video, or Image files downloaded from R2,
// generates a WebP thumbnail, uploads it to R2, and registers the URL with the backend database.
func ProcessThumbnailJob(ctx context.Context, r2 *R2Client, job MediaJob) {
	if r2 == nil {
		log.Printf("[ThumbnailWorker] Skipping processing for file %s: R2 client is nil", job.FileID)
		return
	}

	// 1. Clean object key and download file
	objectKey := extractObjectKey(job.S3URL, r2.PublicBase)
	tempDir, err := os.MkdirTemp("", "optix-thumbnail-")
	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to create temp directory: %v", err)
		return
	}
	defer os.RemoveAll(tempDir)

	localInputPath := filepath.Join(tempDir, job.FileName)
	log.Printf("[ThumbnailWorker] Downloading R2 key %s to %s", objectKey, localInputPath)

	err = r2.DownloadFile(ctx, objectKey, localInputPath)
	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to download file from R2: %v", err)
		return
	}

	// 2. Determine file type by extension
	ext := strings.ToLower(filepath.Ext(job.FileName))
	var tempImagePath string
	var isWebP bool

	switch {
	case ext == ".pdf":
		tempImagePath, err = extractPdfThumbnail(ctx, localInputPath, tempDir)
	case ext == ".mp4" || ext == ".mkv" || ext == ".mov" || ext == ".webm":
		tempImagePath, err = extractVideoThumbnail(ctx, localInputPath, tempDir)
	case ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp" || ext == ".gif":
		tempImagePath, err = extractImageThumbnail(localInputPath, tempDir)
		isWebP = true // image processor outputs WebP directly
	default:
		log.Printf("[ThumbnailWorker] Unsupported file extension %s for file %s", ext, job.FileID)
		return
	}

	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to extract thumbnail for file %s: %v", job.FileID, err)
		return
	}

	// 3. Compress output to WebP if not already WebP
	var webpTempPath string
	if !isWebP {
		webpTempPath = filepath.Join(tempDir, "thumbnail.webp")
		err = convertToWebp(tempImagePath, webpTempPath)
		if err != nil {
			log.Printf("[ThumbnailWorker] Failed to compress image to WebP: %v", err)
			return
		}
	} else {
		webpTempPath = tempImagePath
	}

	// 4. Upload to Cloudflare R2
	folderIDStr := job.FolderID
	if folderIDStr == "" {
		folderIDStr = "root"
	}
	thumbUUID := uuid.New().String()
	thumbObjectKey := fmt.Sprintf("%s/%s/extracted/thumbnails/%s.webp", job.OwnerID, folderIDStr, thumbUUID)

	log.Printf("[ThumbnailWorker] Uploading WebP thumbnail to R2: %s", thumbObjectKey)
	publicURL, err := r2.UploadFile(ctx, thumbObjectKey, webpTempPath, "image/webp")
	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to upload WebP thumbnail to R2: %v", err)
		return
	}

	// 5. Register thumbnail URL with NestJS database backend
	log.Printf("[ThumbnailWorker] Successfully created thumbnail for file %s. Registering: %s", job.FileID, publicURL)
	registerThumbnailCallback(job.FileID, publicURL)
}

// extractPdfThumbnail renders the first page of a PDF to a PNG file using pdftoppm.
func extractPdfThumbnail(ctx context.Context, inputPath, tempDir string) (string, error) {
	pdftoppmPath := findExecutable("pdftoppm")
	outPrefix := filepath.Join(tempDir, "pdf_page")

	// pdftoppm -png -f 1 -l 1 -scale-to-x 150 -scale-to-y -1 -singlefile input output_prefix
	cmdArgs := []string{
		"-png",
		"-f", "1",
		"-l", "1",
		"-scale-to-x", "150",
		"-scale-to-y", "-1",
		"-singlefile",
		inputPath,
		outPrefix,
	}

	log.Printf("[ThumbnailWorker] Running pdftoppm: %s %v", pdftoppmPath, cmdArgs)
	cmd := exec.CommandContext(ctx, pdftoppmPath, cmdArgs...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("pdftoppm failed: %v, stderr: %s", err, stderr.String())
	}

	// With -singlefile and -png, output filename is exactly outPrefix.png
	outputPath := outPrefix + ".png"
	if _, err := os.Stat(outputPath); err != nil {
		return "", fmt.Errorf("rendered PDF thumbnail output file not found: %s", outputPath)
	}

	return outputPath, nil
}

// extractVideoThumbnail extracts a frame at 00:00:01 and resizes it using ffmpeg.
func extractVideoThumbnail(ctx context.Context, inputPath, tempDir string) (string, error) {
	ffmpegPath := findExecutable("ffmpeg")
	outputPath := filepath.Join(tempDir, "video_frame.png")

	// ffmpeg -ss 00:00:01 -i input -vframes 1 -vf scale=150:-1 -y output
	cmdArgs := []string{
		"-ss", "00:00:01",
		"-i", inputPath,
		"-vframes", "1",
		"-vf", "scale=150:-1",
		"-y",
		outputPath,
	}

	log.Printf("[ThumbnailWorker] Running ffmpeg frame extract: %s %v", ffmpegPath, cmdArgs)
	cmd := exec.CommandContext(ctx, ffmpegPath, cmdArgs...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("ffmpeg thumbnail extraction failed: %v, stderr: %s", err, stderr.String())
	}

	return outputPath, nil
}

// extractImageThumbnail decodes the input image, resizes it to 150px width, and encodes it directly to WebP.
func extractImageThumbnail(inputPath, tempDir string) (string, error) {
	file, err := os.Open(inputPath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 1. Decode original image
	img, _, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %v", err)
	}

	// 2. Resize to 150px width maintaining aspect ratio
	resized := resizeImage(img, 150)

	// 3. Save as WebP
	outputPath := filepath.Join(tempDir, "image_thumb.webp")
	outFile, err := os.Create(outputPath)
	if err != nil {
		return "", err
	}
	defer outFile.Close()

	err = webp.Encode(outFile, resized, &webp.EncoderOptions{
		Quality:  80,
		Lossless: false,
		Method:   4,
	})
	if err != nil {
		return "", fmt.Errorf("failed to encode resized WebP: %v", err)
	}

	return outputPath, nil
}

// resizeImage downscales an image to maxWidth using bilinear interpolation.
func resizeImage(img image.Image, maxWidth int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width <= maxWidth {
		return img
	}

	newWidth := maxWidth
	newHeight := (height * maxWidth) / width

	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))
	draw.BiLinear.Scale(dst, dst.Bounds(), img, bounds, draw.Over, nil)
	return dst
}

// convertToWebp reads a source image and encodes it to WebP lossy compression at 80% quality.
func convertToWebp(srcPath, dstPath string) error {
	srcFile, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	img, _, err := image.Decode(srcFile)
	if err != nil {
		return fmt.Errorf("decode error during WebP conversion: %v", err)
	}

	dstFile, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	err = webp.Encode(dstFile, img, &webp.EncoderOptions{
		Quality:  80,
		Lossless: false,
		Method:   4,
	})
	if err != nil {
		return fmt.Errorf("encode error during WebP conversion: %v", err)
	}

	return nil
}

type RegisterThumbnailPayload struct {
	FileID       string `json:"fileId"`
	ThumbnailURL string `json:"thumbnailUrl"`
}

// registerThumbnailCallback triggers a post callback back to NestJS to save the database reference.
func registerThumbnailCallback(fileID string, thumbnailUrl string) {
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:5000"
	}
	secret := os.Getenv("OPTIX_SECRET")
	if secret == "" {
		secret = "optix-super-secret-key"
	}

	payload := RegisterThumbnailPayload{
		FileID:       fileID,
		ThumbnailURL: thumbnailUrl,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to marshal callback payload: %v", err)
		return
	}

	callbackURL := fmt.Sprintf("%s/api/optix/register-thumbnail", backendURL)
	req, err := http.NewRequest("POST", callbackURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		log.Printf("[ThumbnailWorker] Failed to build callback request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Optix-Secret", secret)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[ThumbnailWorker] Callback request failed: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		log.Printf("[ThumbnailWorker] Callback server returned status %d: %s", resp.StatusCode, string(respBody))
	} else {
		log.Printf("[ThumbnailWorker] Callback successful for file %s", fileID)
	}
}
