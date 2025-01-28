include .env

build:
	go build -o bin/dentist-service cmd/dentist-service/main.go

run: build
	bin/dentist-service

sqlc:
	sqlc generate

mup:
	goose -dir ./db/migrations $(DB_DRIVER) $(DB_URL) up

mdown:
	goose -dir ./db/migrations $(DB_DRIVER) $(DB_URL) down

dockerbuild:
	docker build -t dentist-service .

dockerrun: 
	docker run --name dentist-service -d dentist-service
