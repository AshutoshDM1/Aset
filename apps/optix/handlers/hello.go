package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

var startTime = time.Now()

// Hello returns a detailed diagnostics check of the OptiX microservice.
func Hello(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	c.JSON(http.StatusOK, gin.H{
		"service":   "OptiX Image Compression Service",
		"status":    "healthy",
		"version":   "1.0.0",
		"uptime":    time.Since(startTime).String(),
		"go_version": runtime.Version(),
		"system": gin.H{
			"cpus":       runtime.NumCPU(),
			"goroutines": runtime.NumGoroutine(),
			"memory": gin.H{
				"alloc_mb":   float64(m.Alloc) / 1024 / 1024,
				"sys_mb":     float64(m.Sys) / 1024 / 1024,
				"gc_count":   m.NumGC,
				"heap_alloc": m.HeapAlloc,
			},
		},
		"capabilities": gin.H{
			"decoders": []string{"jpeg", "jpg", "png", "gif", "webp"},
			"encoders": []string{"jpeg", "jpg", "png", "gif"},
		},
	})
}