# Dentist Service
Service responsible for operations and logic related to dentists and clinics.

### How To Integrate
As other services, the Dentist Service is using MQTT for communication.

Take a look at the [communication](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/-/blob/main/docs/communication.md?ref_type=heads)
document to learn how to integrate with service - how to send messages and what can be expected as a response.

### How To Run
Since the service is written in Go, it is required to have [Golang installed](https://go.dev/doc/install). 
Alternatively, the service can be run in docker container which of course requires [docker to be installed](https://docs.docker.com/engine/install/).

The service is using [goose](https://github.com/pressly/goose) for migrations and [sqlc](https://github.com/sqlc-dev/sqlc) for generation of database schemas.
Both of those tools have to be installed separately/additionally in order to work on the service. However, there are not required to run the service.

The repository has a [Makefile](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/-/blob/14-add-readme/Makefile) with
a bunch of commands responsible for making the development process easier.

For building and running the application locally just run `make run`. To use docker instead, run `make dockerbuild` and `make dockerrun`.

The Makefile uses a `.env` file for loading up some environment variables. You need to create your own `.env` file. Your  `.env` file should have the same keywords as visible in the [.env.example](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/-/blob/main/.env.example?ref_type=heads)
