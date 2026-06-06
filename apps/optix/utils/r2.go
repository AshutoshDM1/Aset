package utils

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2Client struct {
	S3Client   *s3.Client
	BucketName string
	PublicBase string
}

func NewR2Client() (*R2Client, error) {
	endpoint := os.Getenv("R2_ENDPOINT")
	accessKey := os.Getenv("R2_ACCESS_KEY_ID")
	secretKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucket := os.Getenv("R2_BUCKET")
	publicBase := os.Getenv("R2_PUBLIC_BASE_URL")

	if endpoint == "" || accessKey == "" || secretKey == "" || bucket == "" {
		return nil, fmt.Errorf("R2 environment variables are not fully configured")
	}

	// Load AWS configuration with manual static credentials
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	// Ensure public base has no trailing slash
	publicBase = strings.TrimSuffix(publicBase, "/")

	return &R2Client{
		S3Client:   s3Client,
		BucketName: bucket,
		PublicBase: publicBase,
	}, nil
}

// DownloadFile downloads an object from R2 and writes it to a local file path.
func (r *R2Client) DownloadFile(ctx context.Context, objectKey string, localPath string) error {
	input := &s3.GetObjectInput{
		Bucket: aws.String(r.BucketName),
		Key:    aws.String(objectKey),
	}

	resp, err := r.S3Client.GetObject(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to get object from R2 (key: %s): %w", objectKey, err)
	}
	defer resp.Body.Close()

	out, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file %s: %w", localPath, err)
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write to local file: %w", err)
	}

	return nil
}

// UploadFile uploads a local file to R2 and returns its public URL (or key if no public URL is configured).
func (r *R2Client) UploadFile(ctx context.Context, objectKey string, localPath string, contentType string) (string, error) {
	file, err := os.Open(localPath)
	if err != nil {
		return "", fmt.Errorf("failed to open local file %s: %w", localPath, err)
	}
	defer file.Close()

	input := &s3.PutObjectInput{
		Bucket:      aws.String(r.BucketName),
		Key:         aws.String(objectKey),
		Body:        file,
		ContentType: aws.String(contentType),
	}

	_, err = r.S3Client.PutObject(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to upload object to R2 (key: %s): %w", objectKey, err)
	}

	if r.PublicBase != "" {
		return fmt.Sprintf("%s/%s", r.PublicBase, objectKey), nil
	}
	return objectKey, nil
}
