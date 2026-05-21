package main

import (
	"optix/handlers"

	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}

	app := gin.Default()
	app.SetTrustedProxies(nil) // Trust no external proxy headers

	app.GET("/", handlers.Hello)
	app.POST("/compress", handlers.CompressImage)

	app.Run(":" + port)
}
