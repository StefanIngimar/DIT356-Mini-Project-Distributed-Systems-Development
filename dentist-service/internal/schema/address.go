package schema

import (
	"database/sql"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"github.com/google/uuid"
)

type AddressInput struct {
	Street     string   `json:"street" validate:"required"`
	City       string   `json:"city" validate:"required"`
	PostalCode string   `json:"postal_code" validate:"required"`
	Country    string   `json:"country" validate:"required"`
	Latitude   *float64 `json:"latitude"`
	Longitude  *float64 `json:"longitude"`
}

type AddressOutput struct {
	ID         interface{} `json:"id"`
	Street     string      `json:"street"`
	City       string      `json:"city"`
	PostalCode string      `json:"postal_code"`
	Country    string      `json:"country"`
	Latitude   *float64    `json:"latitude"`
	Longitude  *float64    `json:"longitude"`
}

func PrepareAddressParams(data AddressInput) db.AddAddressParams {
	return db.AddAddressParams{
		ID:         uuid.New(),
		Street:     data.Street,
		City:       data.City,
		PostalCode: data.PostalCode,
		Country:    data.Country,
		Latitude:   sql.NullFloat64{Float64: db.GetFloatIfValid(data.Latitude), Valid: data.Latitude != nil},
		Longitude:  sql.NullFloat64{Float64: db.GetFloatIfValid(data.Longitude), Valid: data.Longitude != nil},
	}
}
