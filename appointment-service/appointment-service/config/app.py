import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AppConfig:
    DB_PATH: str
    MQTT_BROKER: str
    MQTT_PORT: str

    @classmethod
    def from_env(cls) -> "AppConfig":
            return cls(
                DB_PATH=os.getenv("DB_PATH", "sqlite:///main.db"),
                MQTT_BROKER=os.getenv("MQTT_BROKER", "localhost"),
                MQTT_PORT=os.getenv("MQTT_BROKER_PORT", "1885"),
            )
