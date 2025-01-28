# Booking Service

## Project Structure

| File/Folder   | Purpose            
| ------------- | ---------------------------------------------------------------- |  
| `config/`     | App configuration files                                          |
| `database/`   | Database related files                                           |
| `errors/`     | Custom error classes                                             |   
| `handlers/`   | Endpoint handler files                                           |   
| `models/`     | Database schema files                                            |   
| `mqtt/`       | MQTT client wrapper                                              |  
| `services/`   | Service-level files with functions that interact with the models |   
| `tests/`      | Basic tests                                                      |   
| `utils/`      | Utility files                                                    |                           
                            

## Getting started

**Configure your Git identity**

[Get started with Git](https://git.chalmers.se/help/topics/git/get_started.md) and learn [how to configure it](https://git.chalmers.se/help/topics/git/how_to_install_git/index.md#configure-git).

```bash
# Clone repository
git clone git@git.chalmers.se:courses/dit355/2024/student_teams/dit356_2024_02/booking-service.git

# Change into the directory
cd booking-service

# Install the dependencies 
npm install

# To run the service in isolation (in dev mode)
npm run dev
```

**NOTE** The service is meant to be run with the other services in this project. So use the Docker compose in the [Entrypoint repo](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/entrypoint) to run the project.

## Wiki Pages

- [Documentation](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/booking-service/-/wikis/Home)