# Notification Service
Service responsible for operations and logic related to sending notifications to users based on user's specified preferences.

### Hot To Integrate
The Notification Service is not really meant to be integrated with by other services as it is primarly a "consuming" service - operating on data from other services.

### How To Run
Since the service is written in Rust, it is required to have [Rust programming language](https://www.rust-lang.org/tools/install) installed.

Alternatively, the service can be run in a docker container, which of course requires [docker to be installed](https://docs.docker.com/engine/install/), using the [Dockerfile](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/notification-service/-/blob/main/Dockerfile?ref_type=heads) from the root of the project.

The service also uses [Redis](https://redis.io/) for caching purposes. Redis can be easily run through docker - [resource](https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/)

Before running the service, specify the `.env` file with values specified in the [.env.example](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/notification-service/-/blob/main/.env.example?ref_type=heads) file.

Since the Notification service requires other services to run, the easiest way is to run all other services through the [entrypoint project](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/entrypoint) and exluding the Notification service from the `docker.yaml` or `docker.dev.yaml` files. Then, the service can be run by using `cargo run` command from the project root.

### How To Develop
The service is using [Diesel](https://diesel.rs/) as its ORM, which has to be installed to be able to work on the service.
