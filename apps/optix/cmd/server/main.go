package main

import (
	"github.com/gin-gonic/gin"
	"optix/handlers"
)

func main() {
	app := gin.Default()

	app.GET("/", handlers.Hello)
	app.POST("/compress", handlers.CompressImage)

	app.Run(":5001")
}