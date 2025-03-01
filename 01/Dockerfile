FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod tidy

COPY . .

RUN go build -o app1 .

EXPOSE 8080

CMD ["./app1"]
