package handlers

import (
	"bytes"
	"fmt"
	"net/http"
	"optix/utils"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// CompressImage handles requests to compress and resize an uploaded image.
func CompressImage(c *gin.Context) {
	// Parse the uploaded file (accepts either "file" or "image" fields)
	fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No file uploaded. Please upload an image using the 'file' or 'image' multipart field.",
			})
			return
		}
	}

	// 1. Parse compression parameters
	// Quality: (1-100, default 75)
	quality := 75
	qualityStr := c.DefaultQuery("quality", c.PostForm("quality"))
	if qualityStr != "" {
		if q, err := strconv.Atoi(qualityStr); err == nil {
			if q >= 1 && q <= 100 {
				quality = q
			}
		}
	}

	// Width: (optional, default 0 - original width)
	width := 0
	widthStr := c.DefaultQuery("width", c.PostForm("width"))
	if widthStr != "" {
		if w, err := strconv.Atoi(widthStr); err == nil && w > 0 {
			width = w
		}
	}

	// Height: (optional, default 0 - original height)
	height := 0
	heightStr := c.DefaultQuery("height", c.PostForm("height"))
	if heightStr != "" {
		if h, err := strconv.Atoi(heightStr); err == nil && h > 0 {
			height = h
		}
	}

	// Output format: (optional, default "original")
	format := strings.ToLower(c.DefaultQuery("format", c.PostForm("format")))

	// 2. Open and process the image
	srcFile, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to open uploaded file: " + err.Error(),
		})
		return
	}
	defer srcFile.Close()

	startTime := time.Now()

	// Decode the original image
	img, inputFormat, err := utils.DecodeImage(srcFile)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to decode the uploaded image: " + err.Error() + ". Please upload a valid JPEG, PNG, GIF, or WebP image.",
		})
		return
	}

	// Resolve the target output format
	targetFormat := format
	if targetFormat == "" || targetFormat == "original" {
		targetFormat = strings.ToLower(inputFormat)
	}

	// Normalize format names
	if targetFormat == "jpg" {
		targetFormat = "jpeg"
	}

	// If the target format is not natively encodable, default it appropriately
	if targetFormat != "jpeg" && targetFormat != "png" && targetFormat != "gif" {
		// If input was WebP or others, default to PNG if transparency is present, otherwise JPEG
		if utils.DetectTransparency(img) {
			targetFormat = "png"
		} else {
			targetFormat = "jpeg"
		}
	}

	// Perform resizing if specified
	processedImg := utils.ResizeImage(img, width, height)

	// Encode the processed image into a memory buffer
	var outBuf bytes.Buffer
	err = utils.EncodeImage(&outBuf, processedImg, targetFormat, quality)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to compress/encode image: " + err.Error(),
		})
		return
	}

	processingDuration := time.Since(startTime)

	// Calculate compression statistics
	originalSize := fileHeader.Size
	compressedSize := int64(outBuf.Len())
	var compressionRatio float64
	if originalSize > 0 {
		compressionRatio = float64(originalSize-compressedSize) / float64(originalSize) * 100.0
	}

	// Resolve appropriate MIME Type
	contentType := "image/jpeg"
	if targetFormat == "png" {
		contentType = "image/png"
	} else if targetFormat == "gif" {
		contentType = "image/gif"
	}

	// Set descriptive optimization headers in the response
	c.Header("X-Original-Size", strconv.FormatInt(originalSize, 10))
	c.Header("X-Compressed-Size", strconv.FormatInt(compressedSize, 10))
	c.Header("X-Compression-Ratio", fmt.Sprintf("%.2f%%", compressionRatio))
	c.Header("X-Processing-Time-Ms", strconv.FormatInt(processingDuration.Milliseconds(), 10))

	// Return the raw binary image stream
	c.Data(http.StatusOK, contentType, outBuf.Bytes())
}