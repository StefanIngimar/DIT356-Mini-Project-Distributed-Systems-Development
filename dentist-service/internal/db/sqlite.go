package db

import (
	"database/sql"
	"errors"

	"github.com/mattn/go-sqlite3"
)

func Init(dbPath string) (*sql.DB, error) {
	db, error := sql.Open("sqlite3", dbPath)
	if error != nil {
		return nil, error
	}

	if error = db.Ping(); error != nil {
		return nil, error
	}

	return db, nil
}

type DbErrorType string

const (
	DuplicateEntry       DbErrorType = "DUPLICATE_ENTRY"
	ForeignKeyConstraint DbErrorType = "FOREIGN_KEY_CONSTRAINT"
	ConstraintError      DbErrorType = "CONSTRAINT_ERROR"
	NoRows               DbErrorType = "NO_ROWS"
	DatabaseError        DbErrorType = "DATABASE_ERROR"
	UnknownDbError       DbErrorType = "UNKNOWN_DB_ERROR"
)

func MapDbError(err error) DbErrorType {
	if errors.Is(err, sql.ErrNoRows) {
		return NoRows
	}

	var sqliteError sqlite3.Error
	if errors.As(err, &sqliteError) {
		switch sqliteError.Code {
		case sqlite3.ErrConstraint:
			switch sqliteError.ExtendedCode {
			case sqlite3.ErrConstraintUnique:
				return DuplicateEntry
			case sqlite3.ErrConstraintForeignKey:
				return ForeignKeyConstraint
			default:
				return ConstraintError
			}
		default:
			return DatabaseError
		}
	}
	return UnknownDbError
}
