package schema

import (
	"database/sql"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"github.com/google/uuid"
)

type ContactInput struct {
	Email       *string `json:"email"`
	PhoneNumber *string `json:"phone_number"`
}

type ContactOutput struct {
	ID          interface{} `json:"id"`
	Email       *string     `json:"email"`
	PhoneNumber *string     `json:"phone_number"`
}

func PrepareContactParams(email *string, phoneNumber *string) db.AddContactParams {
	return db.AddContactParams{
		ID:          uuid.New(),
		Email:       sql.NullString{String: db.GetStringIfValid(email), Valid: db.IsValidString(email)},
		PhoneNumber: sql.NullString{String: db.GetStringIfValid(phoneNumber), Valid: db.IsValidString(phoneNumber)},
	}
}
