package schema

type TimeSlotStatus string

const (
	FREE     TimeSlotStatus = "FREE"
	RESERVED TimeSlotStatus = "RESERVED"
	BOOKED   TimeSlotStatus = "BOOKED"
)

type ClinicAvailabilityStatus string

const (
	HIGH    ClinicAvailabilityStatus = "HIGH"
	MEDIUM  ClinicAvailabilityStatus = "MEDIUM"
	LOW     ClinicAvailabilityStatus = "LOW"
	UNKNOWN ClinicAvailabilityStatus = "UNKNOWN"
)

type Appointment struct {
	AppointmentId string         `json:"_id"`
	Date          string         `json:"date"`
	StartTime     string         `json:"start_time"`
	EndTime       string         `json:"end_time"`
	Status        TimeSlotStatus `json:"status"`
	ClinicId      string         `json:"clinicId"`
	DentistId     string         `json:"dentistId"`
	CreatedAt     string         `json:"createdAt"`
	UpdatedAt     string         `json:"updatedAt"`
}

type TimeSlot struct {
	AppointmentId string         `json:"appointmentId"`
	Date          string         `json:"date"`
	StartTime     string         `json:"start_time"`
	EndTime       string         `json:"end_time"`
	Status        TimeSlotStatus `json:"status"`
}

type DentistWithAppointments struct {
	DentistId string     `json:"dentistId"`
	TimeSlots []TimeSlot `json:"time_slots"`
}

type ClinicAppointmentsPerDentist struct {
	ClinicId string                    `json:"clinicId"`
	Dentists []DentistWithAppointments `json:"dentists"`
}

type AppointmentAvailabilityStatusPerClinic struct {
	ClinicId           string                   `json:"clinic_id"`
	AvailabilityStatus ClinicAvailabilityStatus `json:"availability_status"`
}
