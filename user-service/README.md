# User Service
Service responsible for authentication and user-related data and business logic

### How To Integrated
As any other service, the User Service is using MQTT for communication.

Check out the [communication](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/user-service/-/blob/master/docs/communication.md?ref_type=heads)
document to learn how to interact with the service.

### How To Run
User Service requires Python 3.12 to be installed on your system.

The application can also be run using docker with the help of the provided [Dockerfile](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/user-service/-/blob/master/Dockerfile?ref_type=heads).

To run the application locally follow those steps from the root of the repository:
1. Create a virtual environment (`virtualenv`, `python3 -m venv venv`, etc.)
2. Activate the virtual environment and run pip to install required dependencies (`python3 -m pip install -r requirements.txt`)
3. Run the application (`python3 user-service/main.py`)
