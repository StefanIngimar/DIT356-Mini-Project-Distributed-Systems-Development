package config

import (
	"database/sql"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/env"
)

type App struct {
	Debug   bool
	Db      *sql.DB
	Queries *db.Queries
}

func NewApp(database *sql.DB) *App {
	return &App{
		Debug:   env.GetBoolEnv("DEBUG", true),
		Db:      database,
		Queries: db.New(database),
	}
}
