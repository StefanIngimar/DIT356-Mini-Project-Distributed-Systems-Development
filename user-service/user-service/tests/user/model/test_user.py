import pytest
from sqlalchemy.orm.session import Session

from db.sqlite import Sqlite
from db.dataclasses import DbErrorType

from user.model import User
from user.schema import UserInput


@pytest.fixture
def db() -> Sqlite:
    return Sqlite(db_path="sqlite:///:memory:")


def test_add_user(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        user = result.unwrap()
        assert str(user.first_name) == "Joe"
        assert str(user.last_name) == "Doe"
        assert str(user.email) == "joeDoe@email.com"
        assert str(user.role.role) == "admin"

        session.rollback()


def test_add_user_cannot_create_duplicate(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        user = result.unwrap()
        assert str(user.first_name) == "Joe"
        assert str(user.last_name) == "Doe"
        assert str(user.email) == "joeDoe@email.com"
        assert str(user.role.role) == "admin"

        new_user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        new_result = User.add_user(session=session, user=new_user_input)
        assert new_result.is_err() is True

        err = new_result.unwrap_err()
        assert err.message == "User already exists"
        assert err.details == "User with email 'joeDoe@email.com' already exists"
        assert err.error_type == DbErrorType.RECORD_ALREADY_EXIST

        session.rollback()


def test_get_users(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        users_result = User.get_users(session=session)
        assert users_result.is_ok() is True

        users = users_result.unwrap()
        assert len(users) == 1

        user = users[0]
        assert str(user.first_name) == "Joe"
        assert str(user.last_name) == "Doe"
        assert str(user.email) == "joeDoe@email.com"
        assert str(user.role.role) == "admin"

        session.rollback()


def test_get_user_by_id(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        added_user = result.unwrap()

        found_user_result = User.get_user_by_id(session=session, id=str(added_user.id))
        assert found_user_result.is_ok() is True

        user = found_user_result.unwrap()
        assert str(user.first_name) == "Joe"
        assert str(user.last_name) == "Doe"
        assert str(user.email) == "joeDoe@email.com"
        assert str(user.role.role) == "admin"

        session.rollback()


def test_get_user_by_id_returns_error_when_no_user_found(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        found_user_result = User.get_user_by_id(session=session, id="112233")
        assert found_user_result.is_err() is True

        err = found_user_result.unwrap_err()
        assert err.message == "User does not exist"
        assert err.details == "There is no user with ID '112233'"
        assert err.error_type == DbErrorType.RECORD_NOT_FOUND

        session.rollback()


def test_get_user_by_email(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        added_user = result.unwrap()

        found_user_result = User.get_user_by_email(
            session=session, email=str(added_user.email)
        )
        assert found_user_result.is_ok() is True

        user = found_user_result.unwrap()
        assert str(user.first_name) == "Joe"
        assert str(user.last_name) == "Doe"
        assert str(user.email) == "joeDoe@email.com"
        assert str(user.role.role) == "admin"

        session.rollback()


def test_get_user_by_email_returns_error_when_no_user_found(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        found_user_result = User.get_user_by_email(
            session=session, email="fooBar@email.com"
        )
        assert found_user_result.is_err() is True

        err = found_user_result.unwrap_err()
        assert err.message == "User does not exist"
        assert err.details == "There is no user with email 'fooBar@email.com'"
        assert err.error_type == DbErrorType.RECORD_NOT_FOUND

        session.rollback()


def test_remove_user_by_id(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        added_user = result.unwrap()

        remove_user_result = User.remove_user_by_id(
            session=session, id=str(added_user.id)
        )
        assert remove_user_result.is_ok() is True

        session.rollback()


def test_remove_user_by_email(db: Sqlite):
    with Session(db.engine) as session:
        user_input = UserInput(
            first_name="Joe",
            last_name="Doe",
            email="joeDoe@email.com",
            role="admin",
            password="admin",
        )

        result = User.add_user(session=session, user=user_input)
        assert result.is_ok() is True

        added_user = result.unwrap()

        remove_user_result = User.remove_user_by_email(
            session=session, email=str(added_user.email)
        )
        assert remove_user_result.is_ok() is True

        session.rollback()
