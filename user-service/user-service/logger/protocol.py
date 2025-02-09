from typing import Protocol


class LoggerProto(Protocol):
    def debug(self, message: str) -> None: ...

    def info(self, message: str) -> None: ...

    def warning(self, message: str) -> None: ...

    def error(self, message: str) -> None: ...
