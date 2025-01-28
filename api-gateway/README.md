# API Gateway

## Project Structure

| File/Folder   | Purpose            
| ------------- | ---------------------------------------------------------------- |  
| `config/`     | App configuration files                                          |
| `handlers/`   | Endpoint handler files                                           |                       
| `middleware/` | Custom Express middleware                                        | 
| `mqtt/`       | MQTT client wrapper                                              |                                 
| `routers/`    | Express routers                                                  |                            
| `tests/`      | Basic tests                                                      |                                    
| `utils/`      | Utility files                                                    |                              

## Getting started

**Configure your Git identity**

[Get started with Git](https://git.chalmers.se/help/topics/git/get_started.md) and learn [how to configure it](https://git.chalmers.se/help/topics/git/how_to_install_git/index.md#configure-git).

```bash
# Clone repository
git clone git@git.chalmers.se:courses/dit355/2024/student_teams/dit356_2024_02/api-gateway.git

# Change into the directory
cd api-gateway

# Install the dependencies 
npm install

# To run the service in isolation (in dev mode)
npm run dev
```

**NOTE** The service is meant to be run with the other services in this project. So use the Docker compose in the [Entrypoint repo](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/entrypoint) to run the project. 

## Wiki Pages

- [API Dev Documentation](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/api-gateway/-/wikis/api-dev-doc)