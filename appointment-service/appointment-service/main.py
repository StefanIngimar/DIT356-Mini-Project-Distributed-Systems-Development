from logger.loguru import Loguru
from config.app import AppConfig
from appointments_operations.router import AppointmentsMqttRouter
from appointments_operations.service import AppointmentService
from dotenv import load_dotenv
from db.db import Database


def main():
    load_dotenv()
    app_config = AppConfig.from_env()
    db = Database(db_path=app_config.DB_PATH)

    appointments_service = AppointmentService(logger=Loguru(), app_config=app_config)
    appointments_service.mount_router(
        topic="dit356g2/appointments/req",
        router=AppointmentsMqttRouter(
            app_config=app_config,
            database=db,
        ),
    )
    appointments_service.listen_and_serve()


if __name__ == "__main__":
    main()
