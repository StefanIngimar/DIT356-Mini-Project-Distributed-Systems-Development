from typing import Protocol

class LoggerProto(Protocol):
    def debug(self, message: str) -> None:
        pass
    def info(self, message: str) -> None:
        pass
    def warning(self, message: str) -> None:
        pass
    def error(self, message: str) -> None:
        pass