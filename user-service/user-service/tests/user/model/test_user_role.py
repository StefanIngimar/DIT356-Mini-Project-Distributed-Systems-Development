import pytest
from sqlalchemy.orm.session import Session

from db.sqlite import Sqlite
from db.dataclasses import DbErrorType
from user.model import UserRole


@pytest.fixture
def db() -> Sqlite:
    return Sqlite(db_path="sqlite:///:memory:")


def test_get_or_create_role_new_role(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.get_or_create(session=session, role="admin")
        assert result is not result.is_err()

        user_role, created = result.unwrap()
        assert created is True
        assert str(user_role.role) == "admin"

        roles = session.query(UserRole).all()
        assert len(roles) == 1

        session.rollback()


def test_get_or_create_role_existing_role(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.get_or_create(session=session, role="admin")
        assert result is not result.is_err()

        user_role, created = result.unwrap()
        assert created is True
        assert str(user_role.role) == "admin"

        new_result = UserRole.get_or_create(session=session, role="admin")
        assert new_result is not new_result.is_err()

        new_user_role, newly_created = new_result.unwrap()
        assert newly_created is False
        assert str(new_user_role.role) == "admin"

        roles = session.query(UserRole).all()
        assert len(roles) == 1

        session.rollback()


def test_user_role_new_role(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.add_user_role(session=session, role="admin")
        assert result.is_err() is False

        user_role = result.unwrap()
        assert str(user_role.role) == "admin"

        session.rollback()


def test_user_role_duplicated_role_is_unsuccesful(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.add_user_role(session=session, role="admin")
        assert result.is_err() is False

        user_role = result.unwrap()
        assert str(user_role.role) == "admin"

        new_result = UserRole.add_user_role(session=session, role="admin")
        assert new_result.is_err() is True

        err = new_result.unwrap_err()
        assert err.message == "This role already exists"
        assert err.details == "Role 'admin' violates unique constraint"
        assert err.error_type == DbErrorType.RECORD_ALREADY_EXIST

        session.rollback()


def test_remove_role_by_name(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.add_user_role(session=session, role="admin")
        assert result.is_err() is False

        user_role = result.unwrap()
        assert str(user_role.role) == "admin"

        roles = session.query(UserRole).all()
        assert len(roles) == 1

        remove_result = UserRole.remove_role_by_name(session=session, name="admin")
        assert remove_result.is_ok() == True

        roles = session.query(UserRole).all()
        assert len(roles) == 0

        session.rollback()


def test_remove_role_by_name_cannot_remove_nonexisting_role(db: Sqlite):
    with Session(db.engine) as session:
        roles = session.query(UserRole).all()
        assert len(roles) == 0

        result = UserRole.add_user_role(session=session, role="admin")
        assert result.is_err() is False

        user_role = result.unwrap()
        assert str(user_role.role) == "admin"

        roles = session.query(UserRole).all()
        assert len(roles) == 1

        remove_result = UserRole.remove_role_by_name(session=session, name="developer")
        assert remove_result.is_err() == True

        err = remove_result.unwrap_err()
        assert err.message == "Role does not exist"
        assert err.details == "No role was found with name 'developer'"
        assert err.error_type == DbErrorType.RECORD_NOT_FOUND

        session.rollback()
