FROM golang:1.22 AS build

WORKDIR /app
COPY . .

COPY ./tools/goose/goose_linux_x86_64 /usr/local/bin/goose
RUN chmod +x /usr/local/bin/goose

RUN go mod download

ENV CGO_ENABLED=1 GOOS=linux
RUN go build -o /bin/dentist-service -a -ldflags '-linkmode external -extldflags "-static"' cmd/dentist-service/main.go

RUN chmod +x ./entrypoint.sh

FROM alpine:3.18

COPY --from=build /bin/dentist-service .
COPY --from=build /usr/local/bin/goose /usr/local/bin/goose

COPY --from=build /app/db/migrations ./db/migrations
COPY --from=build /app/entrypoint.sh ./entrypoint.sh
COPY --from=build /app/data/main.db ./data/main.db
COPY --from=build /app/data/test.db ./data/test.db

EXPOSE 1883

ENTRYPOINT [ "./entrypoint.sh" ]
