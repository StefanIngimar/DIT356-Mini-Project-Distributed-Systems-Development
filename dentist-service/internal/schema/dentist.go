package schema

import (
	"database/sql"
	"log"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"github.com/google/uuid"
)

type DentistInput struct {
	FirstName         string       `json:"first_name" validate:"required"`
	LastName          string       `json:"last_name" validate:"required"`
	Password          string       `json:"password" validate:"required"`
	Specialization    *string      `json:"specialization"`
	YearsOfExperiance *int64       `json:"years_of_experiance"`
	Contact           ContactInput `json:"contact" validate:"required"`
}

type DentistOutput struct {
	ID                interface{}   `json:"id"`
	UserId            interface{}   `json:"user_id"`
	FirstName         string        `json:"first_name"`
	LastName          string        `json:"last_name"`
	ImageUrl          string        `json:"image_url"`
	Specialization    *string       `json:"specialization"`
	YearsOfExperiance *int64        `json:"years_of_experiance"`
	Contact           ContactOutput `json:"contact"`
}

type DentistWithClinics struct {
	ID                interface{}    `json:"id"`
	UserId            interface{}    `json:"user_id"`
	FirstName         string         `json:"first_name"`
	LastName          string         `json:"last_name"`
	ImageUrl          string         `json:"image_url"`
	Specialization    *string        `json:"specialization"`
	YearsOfExperiance *int64         `json:"years_of_experiance"`
	Contact           ContactOutput  `json:"contact"`
	Clinics           []ClinicOutput `json:"clinics"`
}

type DentistWithAppointmentTimeSlots struct {
	ID                interface{}   `json:"id"`
	UserId            interface{}   `json:"user_id"`
	FirstName         string        `json:"first_name"`
	LastName          string        `json:"last_name"`
	ImageUrl          string        `json:"image_url"`
	Specialization    *string       `json:"specialization"`
	YearsOfExperiance *int64        `json:"years_of_experiance"`
	Contact           ContactOutput `json:"contact"`
	TimeSlots         []TimeSlot    `json:"time_slots"`
}

func PrepareDentistParams(data DentistInput, userId interface{}, contactId interface{}) db.AddDentistParams {
	return db.AddDentistParams{
		ID:                uuid.New(),
		UserID:            userId,
		FirstName:         data.FirstName,
		LastName:          data.LastName,
		Specialization:    sql.NullString{String: db.GetStringIfValid(data.Specialization), Valid: db.IsValidString(data.Specialization)},
		YearsOfExperiance: sql.NullInt64{Int64: db.GetIntIfValid(data.YearsOfExperiance), Valid: data.YearsOfExperiance != nil},
		ContactID:         contactId,
	}
}

func PrepareDentistOutput(dentist db.Dentist, contact db.Contact) DentistOutput {
	return DentistOutput{
		ID:                dentist.ID,
		UserId:            dentist.UserID,
		FirstName:         dentist.FirstName,
		LastName:          dentist.LastName,
		ImageUrl:          dentist.ImageUrl,
		Specialization:    &dentist.Specialization.String,
		YearsOfExperiance: &dentist.YearsOfExperiance.Int64,
		Contact: ContactOutput{
			ID:          contact.ID,
			Email:       &contact.Email.String,
			PhoneNumber: &contact.PhoneNumber.String,
		},
	}
}

func MapDbDentistToOutputSchema(dbDentist db.GetDentistsRow) DentistOutput {
	return DentistOutput{
		ID:                dbDentist.ID,
		UserId:            dbDentist.UserID,
		FirstName:         dbDentist.FirstName,
		LastName:          dbDentist.LastName,
		ImageUrl:          dbDentist.ImageUrl,
		Specialization:    &dbDentist.Specialization.String,
		YearsOfExperiance: &dbDentist.YearsOfExperiance.Int64,
		Contact: ContactOutput{
			ID:          dbDentist.ContactID,
			Email:       &dbDentist.ContactEmail.String,
			PhoneNumber: &dbDentist.ContactPhoneNumber.String,
		},
	}
}

func MapDbDentistsToOutputSchema(dentistsData []db.GetDentistsRow) []DentistOutput {
	dentists := make([]DentistOutput, len(dentistsData))
	for i, dbDentist := range dentistsData {
		dentists[i] = DentistOutput{
			ID:                dbDentist.ID,
			UserId:            dbDentist.UserID,
			FirstName:         dbDentist.FirstName,
			LastName:          dbDentist.LastName,
			ImageUrl:          dbDentist.ImageUrl,
			Specialization:    &dbDentist.Specialization.String,
			YearsOfExperiance: &dbDentist.YearsOfExperiance.Int64,
			Contact: ContactOutput{
				ID:          dbDentist.ContactID,
				Email:       &dbDentist.ContactEmail.String,
				PhoneNumber: &dbDentist.ContactPhoneNumber.String,
			},
		}
	}

	return dentists
}

func MapGetDentistsByIdRowToDentistOutput(dentist db.GetDentistByIdRow) DentistOutput {
	return DentistOutput{
		ID:                dentist.ID,
		UserId:            dentist.UserID,
		FirstName:         dentist.FirstName,
		LastName:          dentist.LastName,
		ImageUrl:          dentist.ImageUrl,
		Specialization:    &dentist.Specialization.String,
		YearsOfExperiance: &dentist.YearsOfExperiance.Int64,
		Contact: ContactOutput{
			ID:          dentist.ContactID,
			Email:       &dentist.ContactEmail.String,
			PhoneNumber: &dentist.ContactPhoneNumber.String,
		},
	}
}

func MapGetDentistByUserIdtoDentistOutput(dentist db.GetDentistByUserIdRow) DentistOutput {
	return DentistOutput{
		ID:                dentist.ID,
		UserId:            dentist.UserID,
		FirstName:         dentist.FirstName,
		LastName:          dentist.LastName,
		ImageUrl:          dentist.ImageUrl,
		Specialization:    &dentist.Specialization.String,
		YearsOfExperiance: &dentist.YearsOfExperiance.Int64,
		Contact: ContactOutput{
			ID:          dentist.ContactID,
			Email:       &dentist.ContactEmail.String,
			PhoneNumber: &dentist.ContactPhoneNumber.String,
		},
	}
}

func MapGetDentistsForClinicToDentistOutput(dbDentists []db.GetDentistsForClinicRow) []DentistOutput {
	dentists := make([]DentistOutput, len(dbDentists))
	for i, dbDentist := range dbDentists {
		dentists[i] = DentistOutput{
			ID:                dbDentist.ID,
			UserId:            dbDentist.UserID,
			FirstName:         dbDentist.FirstName,
			LastName:          dbDentist.LastName,
			ImageUrl:          dbDentist.ImageUrl,
			Specialization:    &dbDentist.Specialization.String,
			YearsOfExperiance: &dbDentist.YearsOfExperiance.Int64,
			Contact: ContactOutput{
				ID:          dbDentist.ContactID,
				Email:       &dbDentist.ContactEmail.String,
				PhoneNumber: &dbDentist.ContactPhoneNumber.String,
			},
		}
	}

	return dentists
}

func MapGetDentistsWithTheirClinics(dentist db.GetDentistByIdRow, associatedClinics []db.GetClinicsAssociatedWithDentistRow) DentistWithClinics {
	clinics := make([]ClinicOutput, len(associatedClinics))
	for i, clinic := range associatedClinics {
		clinics[i] = ClinicOutput{
			ID:          clinic.ID,
			Name:        clinic.Name,
			Description: &clinic.Description.String,
			LogoUrl:     clinic.LogoUrl,
			Address: AddressOutput{
				ID:         clinic.AddressID,
				Street:     clinic.Street,
				City:       clinic.City,
				PostalCode: clinic.PostalCode,
				Country:    clinic.Country,
				Latitude:   &clinic.Latitude.Float64,
				Longitude:  &clinic.Longitude.Float64,
			},
			Contact: ContactOutput{
				ID:          clinic.ContactID,
				Email:       &clinic.ContactEmail.String,
				PhoneNumber: &clinic.ContactPhoneNumber.String,
			},
		}
	}

	return DentistWithClinics{
		ID:                dentist.ID,
		UserId:            dentist.UserID,
		FirstName:         dentist.FirstName,
		LastName:          dentist.LastName,
		ImageUrl:          dentist.ImageUrl,
		Specialization:    &dentist.Specialization.String,
		YearsOfExperiance: &dentist.YearsOfExperiance.Int64,
		Contact: ContactOutput{
			ID:          dentist.ContactID,
			Email:       &dentist.ContactEmail.String,
			PhoneNumber: &dentist.ContactPhoneNumber.String,
		},
		Clinics: clinics,
	}
}

func CombineDentistsWithTheirAppointmentTimeSlots(
	dentists []db.GetDentistsForClinicRow, clinicAppointments ClinicAppointmentsPerDentist,
) []DentistWithAppointmentTimeSlots {
	combinedDentists := []DentistWithAppointmentTimeSlots{}
	dentistIdsToDentistData := make(map[string]db.GetDentistsForClinicRow, len(dentists))
	for _, dentist := range dentists {
		idStr, ok := dentist.ID.(string)
		// NOTE: this should not happen
		if !ok {
			log.Printf("Dentist ID is not castable to a string. ID '%s'", dentist.ID)
			continue
		}
		dentistIdsToDentistData[idStr] = dentist
	}

	for _, dentistAppointments := range clinicAppointments.Dentists {
		dentist := dentistIdsToDentistData[dentistAppointments.DentistId]
		combinedDentists = append(combinedDentists, DentistWithAppointmentTimeSlots{
			ID:                dentist.ID,
			UserId:            dentist.UserID,
			FirstName:         dentist.FirstName,
			LastName:          dentist.LastName,
			ImageUrl:          dentist.ImageUrl,
			Specialization:    &dentist.Specialization.String,
			YearsOfExperiance: &dentist.YearsOfExperiance.Int64,
			Contact: ContactOutput{
				ID:          dentist.ContactID,
				Email:       &dentist.ContactEmail.String,
				PhoneNumber: &dentist.ContactPhoneNumber.String,
			},
			TimeSlots: dentistAppointments.TimeSlots,
		})
	}

	return combinedDentists
}
