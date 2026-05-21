package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CompressImage(c *gin.Context) {

	// 1. Get the file header from the multipart form request
	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No image file provided in the 'image' form field",
		})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to open the uploaded file",
		})
		return
	}
	defer file.Close()

	c.JSON(http.StatusOK, gin.H{
		"filename": fileHeader.Filename,
		"size":     fileHeader.Size,
		"message":  "File successfully received!",
	})
}
