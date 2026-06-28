# ─── Stage 1: Build ────────────────────────────────────────────────────────────
# Use the official Go image to compile a static binary.
FROM golang:1.26.3-alpine AS builder

WORKDIR /app

# Download dependencies first (cached layer — only re-runs if go.mod/go.sum change)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o optix-api ./cmd/server

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────────
# Minimal Alpine image with ffmpeg + ffprobe installed.
FROM alpine:3.20

# Install ffmpeg (includes ffprobe), poppler-utils (for pdftoppm), and CA certs (needed for HTTPS/TLS connections)
RUN apk add --no-cache ffmpeg poppler-utils ca-certificates

WORKDIR /app

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/optix-api .

EXPOSE 5001

CMD ["./optix-api"]