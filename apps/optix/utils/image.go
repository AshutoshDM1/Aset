package utils

import (
	"errors"
	"image"
	"image/color"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"

	// Register WebP decoder
	_ "golang.org/x/image/webp"

	"golang.org/x/image/draw"
)

// DecodeImage decodes an image from an io.Reader and returns the image, its format, and any error.
func DecodeImage(reader io.Reader) (image.Image, string, error) {
	img, format, err := image.Decode(reader)
	if err != nil {
		return nil, "", err
	}
	return img, format, nil
}

// DetectTransparency scans the image to see if it has any transparent pixels.
func DetectTransparency(img image.Image) bool {
	// If the image color model is not one that supports alpha, it's opaque.
	switch img.ColorModel() {
	case color.RGBAModel, color.NRGBAModel, color.AlphaModel, color.Alpha16Model:
		// These models support transparency. We will scan pixels.
	default:
		// Likely YCbCr or other opaque color spaces (like JPEG)
		return false
	}

	bounds := img.Bounds()
	// To keep it fast, we scan pixels. If we find any pixel with alpha < 255 (or 0xffff in uint32), it is transparent.
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			_, _, _, a := img.At(x, y).RGBA()
			if a < 0xffff {
				return true
			}
		}
	}
	return false
}

// FlattenTransparency flattens an image with alpha transparency onto a solid background color (e.g. white).
func FlattenTransparency(img image.Image, bg color.Color) image.Image {
	bounds := img.Bounds()
	out := image.NewRGBA(bounds)
	// Fill background
	draw.Draw(out, bounds, image.NewUniform(bg), image.Point{}, draw.Src)
	// Overlay image
	draw.Draw(out, bounds, img, bounds.Min, draw.Over)
	return out
}

// ResizeImage resizes the image using high-quality Catmull-Rom cubic interpolation.
// If both width and height are 0, the original image is returned.
// If one of width or height is 0, the aspect ratio is preserved.
func ResizeImage(img image.Image, width, height int) image.Image {
	bounds := img.Bounds()
	origW := bounds.Dx()
	origH := bounds.Dy()

	if origW <= 0 || origH <= 0 {
		return img
	}

	// Determine target dimensions
	var targetW, targetH int
	if width > 0 && height > 0 {
		targetW = width
		targetH = height
	} else if width > 0 {
		targetW = width
		targetH = (origH * width) / origW
	} else if height > 0 {
		targetH = height
		targetW = (origW * height) / origH
	} else {
		return img
	}

	// Avoid resizing if the dimensions match exactly
	if targetW == origW && targetH == origH {
		return img
	}

	rect := image.Rect(0, 0, targetW, targetH)
	resizedImg := image.NewRGBA(rect)

	// Perform scaling
	draw.CatmullRom.Scale(resizedImg, rect, img, bounds, draw.Over, nil)
	return resizedImg
}

// EncodeImage encodes the image into the specified format and writes to the writer.
func EncodeImage(writer io.Writer, img image.Image, format string, quality int) error {
	switch format {
	case "jpeg", "jpg":
		// Ensure quality is within boundaries
		if quality < 1 {
			quality = 1
		} else if quality > 100 {
			quality = 100
		}

		// JPEG does not support transparency. If transparency is detected, flatten it to white.
		if DetectTransparency(img) {
			img = FlattenTransparency(img, color.White)
		}

		return jpeg.Encode(writer, img, &jpeg.Options{Quality: quality})

	case "png":
		// PNG is lossless; quality controls the compression time/ratio
		enc := png.Encoder{CompressionLevel: png.BestCompression}
		return enc.Encode(writer, img)

	case "gif":
		return gif.Encode(writer, img, &gif.Options{NumColors: 256})

	default:
		return errors.New("unsupported encode format: " + format)
	}
}
