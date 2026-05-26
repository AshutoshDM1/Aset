package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"optix/utils"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// compressRequest is the JSON body the client sends.
type compressRequest struct {
	URL      string `json:"url" binding:"required"`
	FileID   string `json:"fileId" binding:"required"`
	FileName string `json:"fileName" binding:"required"`
}

// backendResponse is the JSON body the main backend returns.
type backendResponse struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	URL    string  `json:"url"`
	SizeMB float64 `json:"sizeMb"`
}

// CompressImage receives a public image URL and a file ID, fetches the image,
// compresses and converts it to WebP format, notifies the main backend to update
// the DB / delete the old file, and returns the final optimized details.
func CompressImage(c *gin.Context) {
	// 1. Parse the JSON body
	var req compressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid request body: %s", err.Error()),
		})
		return
	}

	// 2. Fetch the image server-side
	resp, err := http.Get(req.URL) // #nosec G107
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("Failed to fetch image from URL: %s", err.Error()),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("Remote server returned %d for the image URL", resp.StatusCode),
		})
		return
	}

	// 3. Read the image bytes into memory
	imageBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read image data",
		})
		return
	}

	// 4. Compress and convert the image to WebP (CGO-free)
	compressedBytes, err := utils.CompressImage(imageBytes)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error": fmt.Sprintf("Failed to compress and encode image to WebP: %s", err.Error()),
		})
		return
	}

	// 5. Derive the new WebP filename from the clean fileName passed by frontend
	ext := filepath.Ext(req.FileName)
	baseFilename := req.FileName
	if ext != "" {
		baseFilename = req.FileName[:len(req.FileName)-len(ext)]
	}
	newFilename := baseFilename + ".webp"

	// 6. Base64-encode the WebP bytes
	webpBase64 := base64.StdEncoding.EncodeToString(compressedBytes)

	// 7. Make API request to main backend to update DB & R2
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:5000"
	}
	updateEndpoint := fmt.Sprintf("%s/api/optix/update-file", backendURL)

	updatePayload := map[string]string{
		"fileId":     req.FileID,
		"webpBase64": webpBase64,
		"fileName":   newFilename,
	}

	payloadBytes, err := json.Marshal(updatePayload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to serialize update payload",
		})
		return
	}

	client := &http.Client{Timeout: 30 * time.Second}
	backendReq, err := http.NewRequest("POST", updateEndpoint, bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to construct backend request: %s", err.Error()),
		})
		return
	}

	optixSecret := os.Getenv("OPTIX_SECRET")
	if optixSecret == "" {
		optixSecret = "optix-super-secret-key"
	}
	backendReq.Header.Set("Content-Type", "application/json")
	backendReq.Header.Set("X-Optix-Secret", optixSecret)

	backendResp, err := client.Do(backendReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("Failed to contact main backend: %s", err.Error()),
		})
		return
	}
	defer backendResp.Body.Close()

	if backendResp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(backendResp.Body)
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("Main backend returned error %d: %s", backendResp.StatusCode, string(bodyBytes)),
		})
		return
	}

	var backResp backendResponse
	if err := json.NewDecoder(backendResp.Body).Decode(&backResp); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("Failed to parse main backend response: %s", err.Error()),
		})
		return
	}

	// 8. Calculate optimization statistics
	oldSize := float64(len(imageBytes))
	newSize := float64(len(compressedBytes))
	savedPercent := math.Max(0, ((oldSize - newSize) / oldSize) * 100)

	// 9. Return final details to the frontend
	c.JSON(http.StatusOK, gin.H{
		"id":           backResp.ID,
		"name":         backResp.Name,
		"url":          backResp.URL,
		"oldSize":      oldSize,
		"newSize":      newSize,
		"savedPercent": savedPercent,
		"message":      "Image successfully optimized!",
	})
}
