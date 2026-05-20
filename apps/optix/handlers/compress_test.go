package handlers

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"optix/utils"
	"strconv"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

// Setup test router
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/", Hello)
	r.POST("/compress", CompressImage)
	return r
}

// Generate an in-memory PNG for testing
func generatePngBytes(t *testing.T, width, height int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: 0, G: 0, B: 255, A: 255}) // blue image
		}
	}
	var buf bytes.Buffer
	err := png.Encode(&buf, img)
	if err != nil {
		t.Fatalf("Failed to encode PNG bytes: %v", err)
	}
	return buf.Bytes()
}

func TestHelloEndpoint(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code 200, got: %d", w.Code)
	}

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	if err != nil {
		t.Fatalf("Failed to parse response JSON: %v", err)
	}

	if resp["service"] != "OptiX Image Compression Service" {
		t.Errorf("Expected service name, got: %v", resp["service"])
	}

	if resp["status"] != "healthy" {
		t.Errorf("Expected status 'healthy', got: %v", resp["status"])
	}

	if _, ok := resp["system"].(map[string]interface{}); !ok {
		t.Error("Expected system stats to be present in response")
	}

	capabilities, ok := resp["capabilities"].(map[string]interface{})
	if !ok {
		t.Fatal("Expected capabilities to be present in response")
	}

	decoders, ok := capabilities["decoders"].([]interface{})
	if !ok || len(decoders) == 0 {
		t.Error("Expected decoders capability list")
	}
}

func TestCompressEndpoint_Success(t *testing.T) {
	router := setupTestRouter()

	// 1. Prepare multipart body with a mock PNG file
	pngData := generatePngBytes(t, 200, 100)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", "test_image.png")
	if err != nil {
		t.Fatalf("Failed to create form file: %v", err)
	}
	_, err = part.Write(pngData)
	if err != nil {
		t.Fatalf("Failed to write png bytes to form: %v", err)
	}
	writer.Close()

	// 2. Perform the request
	req, _ := http.NewRequest("POST", "/compress?width=50&quality=80", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// 3. Assertions
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status code 200, got: %d, body: %s", w.Code, w.Body.String())
	}

	if w.Header().Get("Content-Type") != "image/png" {
		t.Errorf("Expected content type image/png, got: %s", w.Header().Get("Content-Type"))
	}

	// Verify headers
	origSizeHeader := w.Header().Get("X-Original-Size")
	compSizeHeader := w.Header().Get("X-Compressed-Size")
	ratioHeader := w.Header().Get("X-Compression-Ratio")
	timeHeader := w.Header().Get("X-Processing-Time-Ms")

	if origSizeHeader == "" || compSizeHeader == "" || ratioHeader == "" || timeHeader == "" {
		t.Errorf("Missing custom performance headers. Got: Orig=%s, Comp=%s, Ratio=%s, Time=%s",
			origSizeHeader, compSizeHeader, ratioHeader, timeHeader)
	}

	origSize, _ := strconv.ParseInt(origSizeHeader, 10, 64)
	if origSize != int64(len(pngData)) {
		t.Errorf("Expected X-Original-Size to be %d, got: %d", len(pngData), origSize)
	}

	// Check that the returned image bounds are indeed resized to width 50
	decodedImg, format, err := utils.DecodeImage(w.Body)
	if err != nil {
		t.Fatalf("Failed to decode returned image: %v", err)
	}

	if format != "png" {
		t.Errorf("Expected returned format to be png, got: %s", format)
	}

	if decodedImg.Bounds().Dx() != 50 {
		t.Errorf("Expected width to be resized to 50, got: %d", decodedImg.Bounds().Dx())
	}

	if decodedImg.Bounds().Dy() != 25 { // original aspect ratio 200:100 = 2:1, so width 50 implies height 25
		t.Errorf("Expected height to be resized to 25 (maintaining 2:1 aspect ratio), got: %d", decodedImg.Bounds().Dy())
	}
}

func TestCompressEndpoint_MissingFile(t *testing.T) {
	router := setupTestRouter()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	// Create another form field, but NOT "file" or "image"
	_ = writer.WriteField("other_field", "value")
	writer.Close()

	req, _ := http.NewRequest("POST", "/compress", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for missing file, got: %d", w.Code)
	}

	var resp map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if !strings.Contains(resp["error"], "No file uploaded") {
		t.Errorf("Expected 'No file uploaded' error message, got: %v", resp["error"])
	}
}

func TestCompressEndpoint_InvalidImage(t *testing.T) {
	router := setupTestRouter()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "not_an_image.txt")
	_, _ = part.Write([]byte("This is plain text and not a valid image format!"))
	writer.Close()

	req, _ := http.NewRequest("POST", "/compress", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for invalid image, got: %d", w.Code)
	}

	var resp map[string]string
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if !strings.Contains(resp["error"], "Failed to decode the uploaded image") {
		t.Errorf("Expected decoding error message, got: %v", resp["error"])
	}
}

func TestCompressEndpoint_FormatConversion(t *testing.T) {
	router := setupTestRouter()

	pngData := generatePngBytes(t, 50, 50)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.png")
	_, _ = io.Copy(part, bytes.NewReader(pngData))
	writer.Close()

	// Request conversion to JPEG
	req, _ := http.NewRequest("POST", "/compress?format=jpeg", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200, got: %d", w.Code)
	}

	if w.Header().Get("Content-Type") != "image/jpeg" {
		t.Errorf("Expected conversion to image/jpeg, got Content-Type: %s", w.Header().Get("Content-Type"))
	}
}
