# Integration Test

## Project Structure

| File/Folder    | Purpose            
| -------------- | ---------------------------------------------------------------- |  
| `tests/`       | Contains the test files such as the postman collection           |
| `compose.yaml` | Docker compose file to run the microservices                     |                       
                            
## Getting started

**Configure your Git identity**

[Get started with Git](https://git.chalmers.se/help/topics/git/get_started.md) and learn [how to configure it](https://git.chalmers.se/help/topics/git/how_to_install_git/index.md#configure-git).

**Prerequisites**

* You have [Docker](https://www.docker.com/get-started/) installed 
* You have cloned the other repositories of the [`dit356_2024_02`](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02) project group

```bash
# Clone repository
git clone git@git.chalmers.se:courses/dit355/2024/student_teams/dit356_2024_02/integration-test.git

# Change into the directory
cd integration-test

# To run the postman tests locally 
docker compose up --build && docker compose stop 
```

**NOTE** the current postman collection tests expect the test databases to be empty before running the test. Otherwise, some of the assertions will fail. 

## Next steps

- To explore the possibility of running the integration tests on GitLab CI/CD 