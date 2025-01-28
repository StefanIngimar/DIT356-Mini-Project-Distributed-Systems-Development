package interop

import (
	"log"
	"strings"
	"time"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/schema"
)

func FilterOutAppointmentsOutsideDateRange(startDate string, endDate string, appointments []schema.Appointment) ([]schema.Appointment, error) {
	layout := "2006-01-02"
	parsedStartDate, err := time.Parse(layout, startDate)
	if err != nil {
		return nil, err
	}

	parsedEndDate, err := time.Parse(layout, endDate)
	if err != nil {
		return nil, err
	}

	var filteredAppointments []schema.Appointment
	for _, appointment := range appointments {
		timeSlotDate, err := time.Parse(layout, strings.Split(appointment.Date, "T")[0])
		if err != nil {
			log.Printf("Received invalid date format of the time slot: %s\n", appointment.Date)
			continue
		}

		if (timeSlotDate.After(parsedStartDate) || timeSlotDate.Equal(parsedStartDate)) &&
			(timeSlotDate.Before(parsedEndDate) || timeSlotDate.Equal(parsedEndDate)) {
			filteredAppointments = append(filteredAppointments, appointment)
		}
	}

	return filteredAppointments, nil
}

func CalculateClinicsAvailabilityStatus(appointments []schema.Appointment) []schema.AppointmentAvailabilityStatusPerClinic {
	appointmentsPerClinic := make(map[string][]schema.Appointment)
	for _, appointment := range appointments {
		if clinicAppointments, exists := appointmentsPerClinic[appointment.ClinicId]; exists {
			appointmentsPerClinic[appointment.ClinicId] = append(clinicAppointments, appointment)
		} else {
			appointmentsPerClinic[appointment.ClinicId] = []schema.Appointment{appointment}
		}
	}

	appointmentAvailabilityPerClinic := []schema.AppointmentAvailabilityStatusPerClinic{}
	for key, value := range appointmentsPerClinic {
		freeAppointmentsCount := 0
		for _, appointment := range value {
			if appointment.Status == schema.FREE {
				freeAppointmentsCount += 1
			}
		}

		freeAvailabilityPercentage := (freeAppointmentsCount / len(value)) * 100
		var availabilityStatus schema.ClinicAvailabilityStatus
		if freeAvailabilityPercentage >= 80 {
			availabilityStatus = schema.HIGH
		} else if freeAvailabilityPercentage >= 40 {
			availabilityStatus = schema.MEDIUM
		} else {
			availabilityStatus = schema.LOW
		}

		appointmentAvailabilityPerClinic = append(appointmentAvailabilityPerClinic, schema.AppointmentAvailabilityStatusPerClinic{
			ClinicId:           key,
			AvailabilityStatus: availabilityStatus,
		})
	}

	return appointmentAvailabilityPerClinic
}

func FilterOutClinicsWithNoAvailabilityStatus(clinics []db.GetClinicsRow, availabilityData []schema.AppointmentAvailabilityStatusPerClinic) []db.GetClinicsRow {
	availabilityPerClinic := make(map[string]schema.AppointmentAvailabilityStatusPerClinic)
	for _, availability := range availabilityData {
		availabilityPerClinic[availability.ClinicId] = availability
	}

	filteredClinics := []db.GetClinicsRow{}
	for _, clinic := range clinics {
		if _, exists := availabilityPerClinic[clinic.ID.(string)]; exists {
			filteredClinics = append(filteredClinics, clinic)
		}
	}

	return filteredClinics
}
