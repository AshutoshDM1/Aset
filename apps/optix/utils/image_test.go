package utils

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"testing"
)

// Helper function to create a simple test image (opaque or transparent)
func createTestImage(width, height int, transparent bool) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			if transparent && x%2 == 0 {
				img.Set(x, y, color.RGBA{R: 255, G: 0, B: 0, A: 128}) // transparent red
			} else {
				img.Set(x, y, color.RGBA{R: 0, G: 255, B: 0, A: 255}) // opaque green
			}
		}
	}
	return img
}

func TestDecodeImage(t *testing.T) {
	// Create a test image
	srcImg := createTestImage(10, 10, false)
	var buf bytes.Buffer

	// Encode it to PNG
	err := png.Encode(&buf, srcImg)
	if err != nil {
		t.Fatalf("Failed to encode test image to PNG: %v", err)
	}

	// Try to decode it
	decodedImg, format, err := DecodeImage(&buf)
	if err != nil {
		t.Fatalf("DecodeImage failed: %v", err)
	}

	if format != "png" {
		t.Errorf("Expected format to be 'png', got: %s", format)
	}

	if decodedImg.Bounds().Dx() != 10 || decodedImg.Bounds().Dy() != 10 {
		t.Errorf("Expected bounds to be 10x10, got: %dx%d", decodedImg.Bounds().Dx(), decodedImg.Bounds().Dy())
	}
}

func TestDetectTransparency(t *testing.T) {
	opaqueImg := createTestImage(10, 10, false)
	if DetectTransparency(opaqueImg) {
		t.Error("Expected opaque image to have no transparency")
	}

	transparentImg := createTestImage(10, 10, true)
	if !DetectTransparency(transparentImg) {
		t.Error("Expected transparent image to have transparency detected")
	}
}

func TestFlattenTransparency(t *testing.T) {
	// Create transparent image with half-transparent red pixels
	transImg := createTestImage(10, 10, true)
	flatImg := FlattenTransparency(transImg, color.White)

	if DetectTransparency(flatImg) {
		t.Error("Expected flattened image to have NO transparency")
	}

	// Verify that the color at (0,0) has been flattened to opaque
	r, g, b, a := flatImg.At(0, 0).RGBA()
	if a != 0xffff {
		t.Errorf("Expected pixel alpha to be opaque (0xffff), got: %d", a)
	}
	// Red (255, 0, 0) alpha 128 (approx 50% opacity) blended over White (255, 255, 255)
	// should produce a light pink (r > 0, g > 0, b > 0)
	if r == 0 || g == 0 || b == 0 {
		t.Errorf("Flattening calculation failed, color values: r=%d, g=%d, b=%d", r, g, b)
	}
}

func TestResizeImage(t *testing.T) {
	origImg := createTestImage(100, 50, false) // 2:1 aspect ratio

	// Test case 1: width & height specified
	res1 := ResizeImage(origImg, 10, 10)
	if res1.Bounds().Dx() != 10 || res1.Bounds().Dy() != 10 {
		t.Errorf("Expected exact resize to 10x10, got: %dx%d", res1.Bounds().Dx(), res1.Bounds().Dy())
	}

	// Test case 2: only width specified (should preserve aspect ratio)
	res2 := ResizeImage(origImg, 10, 0)
	if res2.Bounds().Dx() != 10 || res2.Bounds().Dy() != 5 {
		t.Errorf("Expected aspect ratio resize to 10x5, got: %dx%d", res2.Bounds().Dx(), res2.Bounds().Dy())
	}

	// Test case 3: only height specified (should preserve aspect ratio)
	res3 := ResizeImage(origImg, 0, 10)
	if res3.Bounds().Dx() != 20 || res3.Bounds().Dy() != 10 {
		t.Errorf("Expected aspect ratio resize to 20x10, got: %dx%d", res3.Bounds().Dx(), res3.Bounds().Dy())
	}

	// Test case 4: neither specified (should return original size)
	res4 := ResizeImage(origImg, 0, 0)
	if res4.Bounds().Dx() != 100 || res4.Bounds().Dy() != 50 {
		t.Errorf("Expected original bounds 100x50, got: %dx%d", res4.Bounds().Dx(), res4.Bounds().Dy())
	}
}

func TestEncodeImage(t *testing.T) {
	img := createTestImage(10, 10, false)

	// Test JPEG Encoding
	var jpegBuf bytes.Buffer
	err := EncodeImage(&jpegBuf, img, "jpeg", 80)
	if err != nil {
		t.Fatalf("Failed to encode JPEG: %v", err)
	}
	_, format, err := DecodeImage(&jpegBuf)
	if err != nil || format != "jpeg" {
		t.Errorf("Decoded JPEG failed: %v, format: %s", err, format)
	}

	// Test PNG Encoding
	var pngBuf bytes.Buffer
	err = EncodeImage(&pngBuf, img, "png", 0)
	if err != nil {
		t.Fatalf("Failed to encode PNG: %v", err)
	}
	_, format, err = DecodeImage(&pngBuf)
	if err != nil || format != "png" {
		t.Errorf("Decoded PNG failed: %v, format: %s", err, format)
	}

	// Test GIF Encoding
	var gifBuf bytes.Buffer
	err = EncodeImage(&gifBuf, img, "gif", 0)
	if err != nil {
		t.Fatalf("Failed to encode GIF: %v", err)
	}
	_, format, err = DecodeImage(&gifBuf)
	if err != nil || format != "gif" {
		t.Errorf("Decoded GIF failed: %v, format: %s", err, format)
	}

	// Test Unsupported Encoding
	var unsupBuf bytes.Buffer
	err = EncodeImage(&unsupBuf, img, "webp", 0) // WebP is decoding-only in pure Go
	if err == nil {
		t.Error("Expected error for unsupported encoding format, got nil")
	}
}

func TestJpegFlattenOnEncode(t *testing.T) {
	// Encode a transparent image to JPEG, verify it flattens transparency without error
	transImg := createTestImage(10, 10, true)
	var jpegBuf bytes.Buffer
	err := EncodeImage(&jpegBuf, transImg, "jpeg", 80)
	if err != nil {
		t.Fatalf("Failed to encode transparent image to JPEG: %v", err)
	}

	decodedImg, format, err := DecodeImage(&jpegBuf)
	if err != nil || format != "jpeg" {
		t.Fatalf("Failed to decode flattened JPEG: %v, format: %s", err, format)
	}

	if DetectTransparency(decodedImg) {
		t.Error("Expected encoded JPEG to have no transparency")
	}
}

func TestInvalidJpegQuality(t *testing.T) {
	img := createTestImage(5, 5, false)

	// Quality < 1 should be treated as 1, Quality > 100 should be treated as 100
	var buf1, buf2 bytes.Buffer
	if err := EncodeImage(&buf1, img, "jpeg", 0); err != nil {
		t.Errorf("Expected quality 0 to encode successfully, got: %v", err)
	}
	if err := EncodeImage(&buf2, img, "jpeg", 150); err != nil {
		t.Errorf("Expected quality 150 to encode successfully, got: %v", err)
	}

	// Verify both resulted in valid JPEG encodings
	_, f1, err1 := DecodeImage(&buf1)
	_, f2, err2 := DecodeImage(&buf2)
	if err1 != nil || f1 != "jpeg" || err2 != nil || f2 != "jpeg" {
		t.Errorf("Invalid quality levels produced corrupt JPEGs: %v (%s), %v (%s)", err1, f1, err2, f2)
	}
}
