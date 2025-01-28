import os
import subprocess
import logging
import time

from typing import List
from dataclasses import dataclass
from pathlib import Path
from typing import Literal


@dataclass(frozen=True)
class ServiceDirectory:
    dir_name: str
    main_branch_name: Literal["main", "master"] = "main"


class ColorFormatter(logging.Formatter):
    COLORS = {
        "INFO": "\033[94m",     # Blue
        "DEBUG": "\033[92m",    # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",    # Red
    }
    RESET = "\033[0m"

    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.msg = f"{log_color}{record.msg}{self.RESET}"
        return super().format(record)


PROJECT_ROOT = Path("./../..")
DIRECTORIES = [
    ServiceDirectory(dir_name="admin-ui", main_branch_name="master"),
    ServiceDirectory(dir_name="api-gateway"),
    ServiceDirectory(dir_name="booking-service"),
    ServiceDirectory(dir_name="dentist-service"),
    ServiceDirectory(dir_name="dentist-ui"),
    ServiceDirectory(dir_name="documentation"),
    ServiceDirectory(dir_name="entrypoint"),
    ServiceDirectory(dir_name="integration-test"),
    ServiceDirectory(dir_name="mqtt-broker", main_branch_name="master"),
    ServiceDirectory(dir_name="patient-ui"),
    ServiceDirectory(dir_name="user-service", main_branch_name="master"),
]

def has_uncommited_changes(dir_path: Path) -> bool:
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=dir_path,
        text=True,
        capture_output=True
    )
    return bool(result.stdout.strip())


def run_git_command(command: List[str], dir_path: Path) -> None:
    try:
        result = subprocess.run(command, cwd=dir_path, text=True, capture_output=True, check=True)
        logging.debug(result.stdout.strip())
    except subprocess.CalledProcessError as e:
        logging.error(f"Error for '{dir_path}':\n {e.stderr.strip()}")


def pull_latest_from_repository(dir: ServiceDirectory) -> None:
    logging.info(f"Pulling latest from '{dir.dir_name}'")

    dir_path = Path(os.path.join(PROJECT_ROOT, dir.dir_name))

    if not dir_path.is_dir():
        logging.error(f"Cannot pull latest from'{dir.dir_name}'. Not a directory")
        return

    git_dir = dir_path / ".git"
    if not git_dir.is_dir():
        logging.error(f"'{dir.dir_name}' is not a git directory")
        return

    if has_uncommited_changes(dir_path=dir_path):
        logging.warning(f"Uncommited changes found in '{dir.dir_name}'. Skipping pulling latest changes...\n")
        return

    run_git_command(["git", "checkout", dir.main_branch_name], dir_path=dir_path)
    time.sleep(1)  # Delay to avoid server throttling
    run_git_command(["git", "pull"], dir_path=dir_path)

    print()


def setup_logging() -> None:
    formatter = ColorFormatter('%(asctime)s - %(levelname)s - %(message)s')
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)


def main():
    setup_logging()

    logging.info("Starting the update process\n")

    for dir in DIRECTORIES:
        try:
            pull_latest_from_repository(dir=dir)
        except Exception as e:
            logging.error(f"Something went wrong while pulling updates for '{dir.dir_name}': {e}")
            continue


if __name__ == "__main__":
    main()

