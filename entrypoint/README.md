# Entrypoint 

This repo contains the Docker compose files and relevant files necessary to run the services and components in a containerized environment. 

## Prerequisites 

- Clone the other repos of this project
- Docker version 27
- Docker Compose version 2.30.0 and later 

## How To Run

To create and start the service containers using the Docker compose file, run the the following command in the shell:
```
docker compose up --build
```

To stop the services: 
```
docker compose stop 
```

For more info on how to use the `docker compose` command, refer to the [Docker compose documentation](https://docs.docker.com/reference/cli/docker/compose/).  