package utils

import (
	"bytes"
	"image"
	_ "image/jpeg"
	_ "image/png"
	_ "golang.org/x/image/webp"

	"github.com/deepteams/webp"
)

// CompressImage decodes the input image bytes (JPEG, PNG, WebP) and compresses
// and encodes them into WebP format using standard 80% quality lossy compression.
func CompressImage(imageBytes []byte) ([]byte, error) {
	// 1. Decode the input image
	reader := bytes.NewReader(imageBytes)
	img, _, err := image.Decode(reader)
	if err != nil {
		return nil, err
	}

	// 2. Encode to WebP using the CGO-free deepteams/webp encoder
	var buf bytes.Buffer
	err = webp.Encode(&buf, img, &webp.EncoderOptions{
		Quality:  80,
		Lossless: false,
		Method:   4, // Balanced speed and compression effort
	})
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
