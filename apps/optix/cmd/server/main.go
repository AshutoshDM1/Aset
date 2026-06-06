package main

import (
	"context"
	"log"
	"optix/handlers"
	"optix/utils"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}

	// Read Redis configuration
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	// Initialize background worker pool for media extraction
	// We run up to 2 parallel extraction processes to not overwhelm CPU/RAM of the VM.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	log.Println("[Main] Starting Optix background media extraction worker pool...")
	utils.StartWorkerPool(ctx, redisURL, 2)

	app := gin.Default()
	app.SetTrustedProxies(nil) // Trust no external proxy headers

	// Allow requests from the Vite dev server and any localhost origin.
	// In production, restrict AllowOrigins to your actual frontend domain.
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "https://aset.elitedev.space", "https://aset-optix.elitedev.space"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	app.GET("/", handlers.Hello)
	app.POST("/compress", handlers.CompressImage)

	app.Run(":" + port)
}
