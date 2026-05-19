FROM golang:1.24-alpine

WORKDIR /app

COPY . .

RUN go mod tidy
RUN go build -o optix-api ./cmd/server

EXPOSE 5001

CMD ["./optix-api"]