from dotenv import load_dotenv

from logger.loguru import Loguru

from config.app import AppConfig

from user.router import UserMqttRouter
from user.service import UserService

from db.sqlite import Sqlite


def main():
    load_dotenv()

    app_config = AppConfig.from_env()

    db = Sqlite(db_path=app_config.get_db_path_from_current_environment())

    user_service = UserService(logger=Loguru(), app_config=app_config)
    user_service.mount_router(
        topic="dit356g2/users/req",
        router=UserMqttRouter(
            app_config=app_config,
            database=db,
        ),
    )
    user_service.listen_and_serve()


if __name__ == "__main__":
    main()
