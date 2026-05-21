package main

import (
	"optix/handlers"
	"os"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}

	app := gin.Default()
	app.SetTrustedProxies(nil) // Trust no external proxy headers

	// Allow requests from the Vite dev server and any localhost origin.
	// In production, restrict AllowOrigins to your actual frontend domain.
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
	}))

	app.GET("/", handlers.Hello)
	app.POST("/compress", handlers.CompressImage)

	app.Run(":" + port)
}
