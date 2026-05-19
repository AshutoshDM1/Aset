package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func CompressImage(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Image compressed 🚀",
	})
}