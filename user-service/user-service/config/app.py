import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AppConfig:
    ENV: str
    DB_PATH: str
    TEST_DB_PATH: str
    MQTT_BROKER: str
    MQTT_PORT: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXP_TIME: int

    @classmethod
    def from_env(cls) -> "AppConfig":
        return cls(
            ENV=os.getenv("ENV", "dev"),
            TEST_DB_PATH="sqlite:///data/test.db",
            DB_PATH=os.getenv("DB_PATH", "sqlite:///data/main.db"),
            MQTT_BROKER=os.getenv("MQTT_BROKER", "localhost"),
            MQTT_PORT=os.getenv("MQTT_BROKER_PORT", "1883"),
            JWT_SECRET=os.getenv("JWT_SECRET", ""),
            JWT_ALGORITHM=os.getenv("JWT_ALGORITHM", "HS256"),
            JWT_EXP_TIME=int(
                os.getenv("JWT_EXP_TIME", 3600 * 12)
            ),  # default to 12 hours
        )

    def get_db_path_from_current_environment(self) -> str:
        return self.TEST_DB_PATH if self.ENV.lower() == "test" else self.DB_PATH
