package schema

import (
	"database/sql"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"github.com/google/uuid"
)

type ClinicInput struct {
	Name        string       `json:"name" validate:"required"`
	Description *string      `json:"description"`
	Address     AddressInput `json:"address" validate:"required"`
	Contact     ContactInput `json:"contact" validate:"required"`
}

type ClinicOutput struct {
	ID          interface{}   `json:"id"`
	Name        string        `json:"name"`
	LogoUrl     string        `json:"logo_url"`
	Description *string       `json:"description"`
	Address     AddressOutput `json:"address"`
	Contact     ContactOutput `json:"contact"`
}

type ClinicWithAppointmentAvailabilityStatus struct {
	ID                 interface{}               `json:"id"`
	Name               string                    `json:"name"`
	LogoUrl            string                    `json:"logo_url"`
	Description        *string                   `json:"description"`
	Address            AddressOutput             `json:"address"`
	Contact            ContactOutput             `json:"contact"`
	AvailabilityStatus *ClinicAvailabilityStatus `json:"availability_status"`
}

type ClinicDoctorsInput struct {
	DoctorsIds []string `json:"doctor_ids" validate:"required"`
}

func PrepareClinicParams(data ClinicInput, addressId interface{}, contactId interface{}) db.AddClinicParams {
	return db.AddClinicParams{
		ID:          uuid.New(),
		Name:        data.Name,
		Description: sql.NullString{String: db.GetStringIfValid(data.Description), Valid: db.IsValidString(data.Description)},
		AddressID:   addressId,
		ContactID:   contactId,
	}
}

func PrepareClinicOutput(clinic db.Clinic, address db.Address, contact db.Contact) ClinicOutput {
	return ClinicOutput{
		ID:          clinic.ID,
		Name:        clinic.Name,
		Description: &clinic.Description.String,
		LogoUrl:     clinic.LogoUrl,
		Address: AddressOutput{
			ID:         address.ID,
			Street:     address.Street,
			City:       address.City,
			PostalCode: address.PostalCode,
			Country:    address.Country,
			Latitude:   &address.Latitude.Float64,
			Longitude:  &address.Longitude.Float64,
		},
		Contact: ContactOutput{
			ID:          contact.ID,
			Email:       &contact.Email.String,
			PhoneNumber: &contact.PhoneNumber.String,
		},
	}
}

func MapGetClinicsRowToClinicOutput(clinicsData []db.GetClinicsRow) []ClinicOutput {
	clinics := make([]ClinicOutput, len(clinicsData))
	for i, clinic := range clinicsData {
		var address AddressOutput
		if clinic.AddressID != nil {
			address = AddressOutput{
				ID:         clinic.AddressID,
				Street:     clinic.Street.String,
				City:       clinic.City.String,
				PostalCode: clinic.PostalCode.String,
				Country:    clinic.Country.String,
				Latitude:   &clinic.Latitude.Float64,
				Longitude:  &clinic.Longitude.Float64,
			}
		}

		var contact ContactOutput
		if clinic.ContactID != nil {
			contact = ContactOutput{
				ID:          clinic.ContactID,
				Email:       &clinic.ContactEmail.String,
				PhoneNumber: &clinic.ContactPhoneNumber.String,
			}
		}

		clinics[i] = ClinicOutput{
			ID:          clinic.ID,
			Name:        clinic.Name,
			Description: &clinic.Description.String,
			LogoUrl:     clinic.LogoUrl,
			Address:     address,
			Contact:     contact,
		}
	}

	return clinics
}

func MapGetClinicsRowToClinicWithAvailabilityStatus(clinicsData []db.GetClinicsRow, clinicsAppointmentsAvailability []AppointmentAvailabilityStatusPerClinic) []ClinicWithAppointmentAvailabilityStatus {
	clinicIdToAppointmentAvailability := make(map[string]AppointmentAvailabilityStatusPerClinic)
	for _, clinic := range clinicsAppointmentsAvailability {
		clinicIdToAppointmentAvailability[clinic.ClinicId] = clinic
	}

	clinics := make([]ClinicWithAppointmentAvailabilityStatus, len(clinicsData))
	for i, clinic := range clinicsData {
		var address AddressOutput
		if clinic.AddressID != nil {
			address = AddressOutput{
				ID:         clinic.AddressID,
				Street:     clinic.Street.String,
				City:       clinic.City.String,
				PostalCode: clinic.PostalCode.String,
				Country:    clinic.Country.String,
				Latitude:   &clinic.Latitude.Float64,
				Longitude:  &clinic.Longitude.Float64,
			}
		}

		var contact ContactOutput
		if clinic.ContactID != nil {
			contact = ContactOutput{
				ID:          clinic.ContactID,
				Email:       &clinic.ContactEmail.String,
				PhoneNumber: &clinic.ContactPhoneNumber.String,
			}
		}

		clinicAvailabilityStatus, exists := clinicIdToAppointmentAvailability[clinic.ID.(string)]
		var availabilityStatus ClinicAvailabilityStatus
		if exists {
			availabilityStatus = clinicAvailabilityStatus.AvailabilityStatus
		} else {
			availabilityStatus = UNKNOWN
		}

		clinics[i] = ClinicWithAppointmentAvailabilityStatus{
			ID:                 clinic.ID,
			Name:               clinic.Name,
			Description:        &clinic.Description.String,
			LogoUrl:            clinic.LogoUrl,
			Address:            address,
			Contact:            contact,
			AvailabilityStatus: &availabilityStatus,
		}
	}

	return clinics
}

func MapGetClinicsByIdRowToClinicOutput(clinic db.GetClinicByIdRow) ClinicOutput {
	return ClinicOutput{
		ID:          clinic.ID,
		Name:        clinic.Name,
		Description: &clinic.Description.String,
		LogoUrl:     clinic.LogoUrl,
		Address: AddressOutput{
			ID:         clinic.AddressID,
			Street:     clinic.Street.String,
			City:       clinic.City.String,
			PostalCode: clinic.PostalCode.String,
			Country:    clinic.Country.String,
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
