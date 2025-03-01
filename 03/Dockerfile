FROM golang:1.24-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

COPY go.mod go.sum ./

RUN go mod tidy

COPY . .

RUN go build -o app3 .

EXPOSE 8082

CMD ["/bin/bash", "-c", "/usr/local/bin/wait-for-it postgres:5432 --timeout=30 --strict -- ./app3"]
