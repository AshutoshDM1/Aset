package handlers

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"github.com/gin-gonic/gin"
)

// compressRequest is the JSON body the client sends.
type compressRequest struct {
	URL string `json:"url" binding:"required"`
}

// CompressImage receives a public image URL, fetches it server-side
// (no CORS issues from the server), and returns a receipt confirming
// the file was received. Actual compression logic goes here later.
func CompressImage(c *gin.Context) {

	// 1. Parse the JSON body
	var req compressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid request body: %s", err.Error()),
		})
		return
	}

	// 2. Fetch the image server-side — no CORS restriction here, this is Go
	resp, err := http.Get(req.URL) // #nosec G107 – URL comes from authenticated client
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

	// 4. Derive a clean filename from the URL
	filename := filepath.Base(req.URL)

	// TODO: plug real compression here (e.g. bimg, libvips, golang.org/x/image)
	//       and return the compressed WebP bytes instead of the JSON receipt.

	c.JSON(http.StatusOK, gin.H{
		"filename": filename,
		"size":     len(imageBytes),
		"message":  "File successfully received by Optix!",
	})
}
