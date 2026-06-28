package utils

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type MediaJob struct {
	FileID   string `json:"fileId"`
	S3URL    string `json:"s3Url"`
	FileName string `json:"fileName"`
	OwnerID  string `json:"ownerId"`
	FolderID string `json:"folderId"`
}

type SubtitleTrack struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Language string `json:"language"`
	S3URL    string `json:"s3Url"`
}

type AudioTrack struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Language string `json:"language"`
	S3URL    string `json:"s3Url"`
}

type RegisterTracksPayload struct {
	FileID      string          `json:"fileId"`
	Status      string          `json:"status"` // "completed" or "failed"
	Subtitles   []SubtitleTrack `json:"subtitles"`
	AudioTracks []AudioTrack    `json:"audioTracks"`
}

type FFProbeOutput struct {
	Streams []FFStream `json:"streams"`
}

type FFStream struct {
	Index     int               `json:"index"`
	CodecType string            `json:"codec_type"`
	CodecName string            `json:"codec_name"`
	Tags      map[string]string `json:"tags"`
}

// StartWorkerPool connects to Redis, starts listening to the media tasks list,
// and processes jobs using a Go goroutine worker pool.
func StartWorkerPool(ctx context.Context, redisURL string, concurrency int) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("[MediaWorker] Invalid Redis URL: %v", err)
	}

	// Redis Cloud free tier uses self-signed TLS certs on *.redis.io.
	// redis.ParseURL sets opts.TLSConfig when scheme is rediss://, but
	// strict cert verification will fail against their self-signed cert.
	// InsecureSkipVerify disables hostname/cert chain checks only — the
	// connection is still encrypted end-to-end.
	if strings.HasPrefix(redisURL, "rediss://") {
		if opts.TLSConfig == nil {
			opts.TLSConfig = &tls.Config{}
		}
		opts.TLSConfig.InsecureSkipVerify = true
	}

	rdb := redis.NewClient(opts)
	// Test connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[MediaWorker] Warning: Redis connection failed: %v", err)
	} else {
		log.Println("[MediaWorker] Connected to Redis successfully")
	}

	r2Client, err := NewR2Client()
	if err != nil {
		log.Printf("[MediaWorker] Warning: R2 client initialization failed: %v", err)
	} else {
		log.Println("[MediaWorker] R2 client initialized successfully")
	}

	jobsChan := make(chan MediaJob, 100)
	thumbJobsChan := make(chan MediaJob, 100)

	// Spawn workers
	for i := 1; i <= concurrency; i++ {
		go func(workerID int) {
			log.Printf("[MediaWorker] Spawned worker goroutine %d", workerID)
			for {
				select {
				case <-ctx.Done():
					return
				case job := <-jobsChan:
					log.Printf("[MediaWorker] Worker %d started processing file %s", workerID, job.FileID)
					processJob(ctx, r2Client, job)
					log.Printf("[MediaWorker] Worker %d finished processing file %s", workerID, job.FileID)
				}
			}
		}(i)
	}

	// Spawn thumbnail workers (lightweight task queue, double concurrency)
	for i := 1; i <= concurrency*2; i++ {
		go func(workerID int) {
			log.Printf("[ThumbnailWorker] Spawned worker goroutine %d", workerID)
			for {
				select {
				case <-ctx.Done():
					return
				case job := <-thumbJobsChan:
					log.Printf("[ThumbnailWorker] Worker %d started processing file %s", workerID, job.FileID)
					ProcessThumbnailJob(ctx, r2Client, job)
					log.Printf("[ThumbnailWorker] Worker %d finished processing file %s", workerID, job.FileID)
				}
			}
		}(i)
	}

	// Main queue poller loop
	go func() {
		queueKey := "aset:media_tasks"
		log.Printf("[MediaWorker] Starting queue poller on queue: %s", queueKey)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				// Blocking pop from the list (BLPop)
				// 0 timeout means block indefinitely until a job is pushed
				results, err := rdb.BLPop(ctx, 0, queueKey).Result()
				if err != nil {
					if err == context.Canceled {
						return
					}
					log.Printf("[MediaWorker] Redis BLPop error: %v, sleeping for 2s...", err)
					time.Sleep(2 * time.Second)
					continue
				}

				if len(results) < 2 {
					continue
				}

				jobJSON := results[1]
				var job MediaJob
				if err := json.Unmarshal([]byte(jobJSON), &job); err != nil {
					log.Printf("[MediaWorker] Failed to parse job payload: %v", err)
					continue
				}

				log.Printf("[MediaWorker] Received queue job for file %s", job.FileID)
				jobsChan <- job
			}
		}
	}()

	// Thumbnail queue poller loop
	go func() {
		queueKey := "aset:thumbnail_tasks"
		log.Printf("[ThumbnailWorker] Starting queue poller on queue: %s", queueKey)
		for {
			select {
			case <-ctx.Done():
				return
			default:
				results, err := rdb.BLPop(ctx, 0, queueKey).Result()
				if err != nil {
					if err == context.Canceled {
						return
					}
					log.Printf("[ThumbnailWorker] Redis BLPop error: %v, sleeping for 2s...", err)
					time.Sleep(2 * time.Second)
					continue
				}

				if len(results) < 2 {
					continue
				}

				jobJSON := results[1]
				var job MediaJob
				if err := json.Unmarshal([]byte(jobJSON), &job); err != nil {
					log.Printf("[ThumbnailWorker] Failed to parse job payload: %v", err)
					continue
				}

				log.Printf("[ThumbnailWorker] Received thumbnail job for file %s", job.FileID)
				thumbJobsChan <- job
			}
		}
	}()
}

// findExecutable resolves the command path, prioritizing system commands
func findExecutable(name string) string {
	if path, err := exec.LookPath(name); err == nil {
		return path
	}
	return name
}

// extractObjectKey cleanses the s3Url to retrieve the raw object key
func extractObjectKey(s3URL, publicBase string) string {
	if publicBase != "" && strings.HasPrefix(s3URL, publicBase) {
		key := strings.TrimPrefix(s3URL, publicBase)
		return strings.TrimPrefix(key, "/")
	}

	if strings.HasPrefix(s3URL, "http://") || strings.HasPrefix(s3URL, "https://") {
		if idx := strings.Index(s3URL, ".r2.cloudflarestorage.com/"); idx != -1 {
			parts := strings.SplitN(s3URL[idx+26:], "?", 2)
			return parts[0]
		}
		if idx := strings.Index(s3URL, "://"); idx != -1 {
			rest := s3URL[idx+3:]
			if pathIdx := strings.Index(rest, "/"); pathIdx != -1 {
				parts := strings.SplitN(rest[pathIdx+1:], "?", 2)
				return parts[0]
			}
		}
	}
	return s3URL
}

func processJob(ctx context.Context, r2 *R2Client, job MediaJob) {
	if r2 == nil {
		log.Printf("[MediaWorker] Skipping processing for file %s: R2 client is nil", job.FileID)
		sendCallback(job.FileID, "failed", nil, nil)
		return
	}

	// 1. Resolve R2 key and download file
	objectKey := extractObjectKey(job.S3URL, r2.PublicBase)
	tempDir, err := os.MkdirTemp("", "optix-extractor-")
	if err != nil {
		log.Printf("[MediaWorker] Failed to create temp directory: %v", err)
		sendCallback(job.FileID, "failed", nil, nil)
		return
	}
	defer os.RemoveAll(tempDir)

	localInputPath := filepath.Join(tempDir, job.FileName)
	log.Printf("[MediaWorker] Downloading R2 key %s to %s", objectKey, localInputPath)
	
	err = r2.DownloadFile(ctx, objectKey, localInputPath)
	if err != nil {
		log.Printf("[MediaWorker] Failed to download file from R2: %v", err)
		sendCallback(job.FileID, "failed", nil, nil)
		return
	}

	// 2. Resolve ffmpeg & ffprobe paths
	ffmpegPath := findExecutable("ffmpeg")
	ffprobePath := findExecutable("ffprobe")

	// 3. Probe file tracks using ffprobe
	cmdArgs := []string{
		"-v", "error",
		"-show_entries", "stream=index,codec_type,codec_name:stream_tags=language,title",
		"-of", "json",
		localInputPath,
	}
	
	log.Printf("[MediaWorker] Running ffprobe: %s %v", ffprobePath, cmdArgs)
	probeCmd := exec.CommandContext(ctx, ffprobePath, cmdArgs...)
	var stdoutBuf, stderrBuf bytes.Buffer
	probeCmd.Stdout = &stdoutBuf
	probeCmd.Stderr = &stderrBuf

	if err := probeCmd.Run(); err != nil {
		log.Printf("[MediaWorker] ffprobe failed: %v, stderr: %s", err, stderrBuf.String())
		sendCallback(job.FileID, "failed", nil, nil)
		return
	}

	var probeOut FFProbeOutput
	if err := json.Unmarshal(stdoutBuf.Bytes(), &probeOut); err != nil {
		log.Printf("[MediaWorker] Failed to parse ffprobe output: %v", err)
		sendCallback(job.FileID, "failed", nil, nil)
		return
	}

	subtitleTracks := []SubtitleTrack{}
	audioTracks := []AudioTrack{}

	subExtractorIdx := 0
	audioExtractorIdx := 0

	folderIDStr := job.FolderID
	if folderIDStr == "" {
		folderIDStr = "root"
	}

	// 4. Extract tracks
	for _, stream := range probeOut.Streams {
		tags := stream.Tags
		if tags == nil {
			tags = make(map[string]string)
		}
		lang := tags["language"]
		if lang == "" {
			lang = "und"
		}
		title := tags["title"]

		if stream.CodecType == "subtitle" {
			subIdx := subExtractorIdx
			subExtractorIdx++

			trackLabel := title
			if trackLabel == "" {
				trackLabel = fmt.Sprintf("Subtitle Track #%d (%s)", subIdx+1, strings.ToUpper(lang))
			}

			log.Printf("[MediaWorker] Extracting subtitle index %d (%s)", stream.Index, trackLabel)
			subTempPath := filepath.Join(tempDir, fmt.Sprintf("sub_%d.vtt", stream.Index))
			
			// ffmpeg -i input -map 0:s:subIdx -y output.vtt
			extractCmd := exec.CommandContext(ctx, ffmpegPath,
				"-i", localInputPath,
				"-map", fmt.Sprintf("0:s:%d", subIdx),
				"-y", subTempPath,
			)
			if err := extractCmd.Run(); err != nil {
				log.Printf("[MediaWorker] Failed to extract subtitle track %d: %v", stream.Index, err)
				continue
			}

			// Upload subtitle track to R2
			subUUID := uuid.New().String()
			subObjectKey := fmt.Sprintf("%s/%s/extracted/subtitles/%s.vtt", job.OwnerID, folderIDStr, subUUID)
			publicURL, err := r2.UploadFile(ctx, subObjectKey, subTempPath, "text/vtt")
			if err != nil {
				log.Printf("[MediaWorker] Failed to upload subtitle track %d to R2: %v", stream.Index, err)
				continue
			}

			subtitleTracks = append(subtitleTracks, SubtitleTrack{
				ID:       subUUID,
				Label:    trackLabel,
				Language: lang,
				S3URL:    publicURL,
			})
		} else if stream.CodecType == "audio" {
			aIdx := audioExtractorIdx
			audioExtractorIdx++

			// Skip primary audio track (index 0)
			if aIdx == 0 {
				continue
			}

			trackLabel := title
			if trackLabel == "" {
				trackLabel = fmt.Sprintf("Audio Track #%d (%s)", aIdx+1, strings.ToUpper(lang))
			}

			log.Printf("[MediaWorker] Extracting audio index %d (%s)", stream.Index, trackLabel)
			audioTempPath := filepath.Join(tempDir, fmt.Sprintf("audio_%d.m4a", stream.Index))
			
			// ffmpeg -i input -map 0:a:aIdx -c:a aac -y output.m4a
			extractCmd := exec.CommandContext(ctx, ffmpegPath,
				"-i", localInputPath,
				"-map", fmt.Sprintf("0:a:%d", aIdx),
				"-c:a", "aac",
				"-y", audioTempPath,
			)
			if err := extractCmd.Run(); err != nil {
				log.Printf("[MediaWorker] Failed to extract audio track %d: %v", stream.Index, err)
				continue
			}

			// Upload audio track to R2
			audioUUID := uuid.New().String()
			audioObjectKey := fmt.Sprintf("%s/%s/extracted/audio/%s.m4a", job.OwnerID, folderIDStr, audioUUID)
			publicURL, err := r2.UploadFile(ctx, audioObjectKey, audioTempPath, "audio/mp4")
			if err != nil {
				log.Printf("[MediaWorker] Failed to upload audio track %d to R2: %v", stream.Index, err)
				continue
			}

			audioTracks = append(audioTracks, AudioTrack{
				ID:       audioUUID,
				Label:    trackLabel,
				Language: lang,
				S3URL:    publicURL,
			})
		}
	}

	// 5. Callback to backend
	log.Printf("[MediaWorker] Finished extraction for file %s. Registering tracks... (Subs: %d, Audio: %d)", job.FileID, len(subtitleTracks), len(audioTracks))
	sendCallback(job.FileID, "completed", subtitleTracks, audioTracks)
}

func sendCallback(fileID string, status string, subtitles []SubtitleTrack, audio []AudioTrack) {
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:5000"
	}
	secret := os.Getenv("OPTIX_SECRET")
	if secret == "" {
		secret = "optix-super-secret-key"
	}

	payload := RegisterTracksPayload{
		FileID:      fileID,
		Status:      status,
		Subtitles:   subtitles,
		AudioTracks: audio,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[MediaWorker] Failed to marshal callback payload: %v", err)
		return
	}

	callbackURL := fmt.Sprintf("%s/api/optix/register-tracks", backendURL)
	req, err := http.NewRequest("POST", callbackURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		log.Printf("[MediaWorker] Failed to build callback request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Optix-Secret", secret)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[MediaWorker] Callback request failed: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		log.Printf("[MediaWorker] Callback server returned status %d: %s", resp.StatusCode, string(respBody))
	} else {
		log.Printf("[MediaWorker] Callback successful for file %s", fileID)
	}
}
