package router

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	pahoMqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/go-playground/validator/v10"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/interop"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/mqtt"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/schema"
)

type ClinicRouter struct {
	database *sql.DB
	queries  *db.Queries
	client   *mqtt.MqttClient
	router   mqtt.Router
}

func NewClinicRouter(database *sql.DB, queries *db.Queries, client *mqtt.MqttClient) *ClinicRouter {
	cr := &ClinicRouter{
		database: database,
		queries:  queries,
		client:   client,
		router:   *mqtt.NewRouter(),
	}

	cr.router.RegisterHandler(mqtt.GET, "/clinics", cr.getClinics)
	cr.router.RegisterHandler(mqtt.GET, "/clinics/:id", cr.getClinic)
	cr.router.RegisterHandler(mqtt.GET, "/clinics/:id/dentists", cr.getClinicDentists)
	cr.router.RegisterHandler(mqtt.GET, "/clinics/:id/dentists/appointments", cr.getClinicDentistsWithTheirAppointmentSlots)

	cr.router.RegisterHandler(mqtt.POST, "/clinics", cr.addClinic)
	cr.router.RegisterHandler(mqtt.POST, "/clinics/:id/dentists", cr.addDentistToClinic)

	cr.router.RegisterHandler(mqtt.DELETE, "/clinics/:id", cr.deleteClinic)

	return cr
}

func (r *ClinicRouter) HandleTopLevelRouting(client pahoMqtt.Client, msg pahoMqtt.Message) {
	r.router.Serve(client, msg)
}

func (r *ClinicRouter) getClinics(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		clinicsData, err := r.queries.GetClinics(ctx, db.GetClinicsParams{Limit: 50, Offset: 0})
		if err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get clinics data", err.Error())
			return
		}

		var availabilityData []schema.AppointmentAvailabilityStatusPerClinic
		clinicAppointmentsStatusResponse, err := r.client.InterCommunicate(
			ctx, client, "dit356g2/appointments/res", mqtt.GET, "/appointments/status", nil,
		)
		if err != nil {
			log.Printf("Could not get clinic appointments status: %s", err.Error())
		} else {
			availabilityData, err = mqtt.ConvertPayloadData[[]schema.AppointmentAvailabilityStatusPerClinic](clinicAppointmentsStatusResponse.Data)
			if err != nil {
				log.Printf("Invalid appointments data received: %s", err.Error())
			}
		}

		startDate, startDateExists := params.QueryParameters["start_date"]
		endDate, endDateExists := params.QueryParameters["end_date"]
		if startDateExists && endDateExists {
			appointments, err := r.client.InterCommunicate(
				ctx, client, "dit356g2/appointments/res", mqtt.GET, "/appointments", nil,
			)
			if err != nil {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get appointments data", err.Error())
				return
			}

			appointmentData, err := mqtt.ConvertPayloadData[[]schema.Appointment](appointments.Data)
			if err != nil {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Invalid appointments data received", err.Error())
				return
			}

			filteredAppointments, err := interop.FilterOutAppointmentsOutsideDateRange(startDate, endDate, appointmentData)
			if err != nil {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not filter out appointments data", err.Error())
				return
			}

			availabilityData = interop.CalculateClinicsAvailabilityStatus(filteredAppointments)
			clinicsData = interop.FilterOutClinicsWithNoAvailabilityStatus(clinicsData, availabilityData)
		}

		mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetClinicsRowToClinicWithAvailabilityStatus(clinicsData, availabilityData))
	}()
}

func (r *ClinicRouter) getClinic(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        clinicId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Clinic ID not found in the request path", "")
            return
        }

        clinic, err := r.queries.GetClinicById(ctx, clinicId)
        if err != nil {
            errType := db.MapDbError(err)
            if errType == db.NoRows {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "Clinic with the provided ID not found", err.Error())
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get clinic data", err.Error())
            }
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetClinicsByIdRowToClinicOutput(clinic))
    }()
}

func (r *ClinicRouter) getClinicDentists(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        clinicId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Clinic ID not found in the request path", "")
            return
        }

        dentists, err := r.queries.GetDentistsForClinic(ctx, clinicId)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentists data", err.Error())
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetDentistsForClinicToDentistOutput(dentists))
    }()
}

func (r *ClinicRouter) getClinicDentistsWithTheirAppointmentSlots(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		clinicId, exists := params.PathParameters["id"]
		if !exists {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Clinic ID not found in the request path", "")
			return
		}

		dentists, err := r.queries.GetDentistsForClinic(ctx, clinicId)
		if err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentists data", err.Error())
			return
		}

		appointmentPayload := map[string]string{
			"clinicId": clinicId,
		}
		appointments, err := r.client.InterCommunicate(
			ctx, client, "dit356g2/appointments/res", mqtt.GET, fmt.Sprintf("/appointments/clinic/%s", clinicId), appointmentPayload,
		)
		if err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get appointments data", err.Error())
			return
		}

		appointmentData, err := mqtt.ConvertPayloadData[schema.ClinicAppointmentsPerDentist](appointments.Data)
		if err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Invalid appointments data received", err.Error())
			return
		}

		mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.CombineDentistsWithTheirAppointmentTimeSlots(dentists, appointmentData))
	}()
}

func (r *ClinicRouter) addClinic(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        data, err := mqtt.ConvertPayloadData[schema.ClinicInput](payload.Data)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Invalid clinic data provided", err.Error())
            return
        }

        err = mqtt.Validator.Struct(data)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, fmt.Sprintf("Invalid clinic data provided"), err.(validator.ValidationErrors).Error())
            return
        }

        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        tx, err := r.database.BeginTx(ctx, nil)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to start transaction", err.Error())
            return
        }
        qtx := r.queries.WithTx(tx)

        contact, err := qtx.AddContact(ctx, schema.PrepareContactParams(data.Contact.Email, data.Contact.PhoneNumber))
        if err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DuplicateEntry || errType == db.ConstraintError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Contact information already exist", err.Error())
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add clinic contact information", err.Error())
            }
            return
        }

        address, err := qtx.AddAddress(ctx, schema.PrepareAddressParams(data.Address))
        if err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DuplicateEntry || errType == db.ConstraintError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Address information already exist", err.Error())
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add clinic address information", err.Error())
            }
            return
        }

        clinic, err := qtx.AddClinic(ctx, schema.PrepareClinicParams(data, address.ID, contact.ID))
        if err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DuplicateEntry || errType == db.ConstraintError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Clinic already exists", err.Error())
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add clinic information", err.Error())
            }
            return
        }

        if err := tx.Commit(); err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to commit transaction", err.Error())
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_201_CREATED, schema.PrepareClinicOutput(clinic, address, contact))
    }()
}

func (r *ClinicRouter) deleteClinic(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        clinicId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "Clinic ID not found in the request path", "")
            return
        }

        tx, err := r.database.BeginTx(ctx, nil)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to start transaction", err.Error())
            return
        }
        qtx := r.queries.WithTx(tx)

        clinic, err := qtx.GetClinicById(ctx, clinicId)
        if err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.NoRows {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "Clinic not found", err.Error())
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get clinic data", err.Error())
            }
            return
        }

        if err := qtx.DeleteAddress(ctx, clinic.AddressID); err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DatabaseError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not remove clinic's address", err.Error())
            }
        }

        if err := qtx.DeleteContact(ctx, clinic.ContactID); err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DatabaseError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not remove clinic's contact", err.Error())
            }
        }

        if err := qtx.DeleteClinic(ctx, clinic.ID); err != nil {
            tx.Rollback()
            errType := db.MapDbError(err)
            if errType == db.DatabaseError {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not remove selected clinic", err.Error())
            }
        }

        if err := tx.Commit(); err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to commit transaction", err.Error())
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_204_NO_CONTENT, nil)
    }()
}

func (r *ClinicRouter) addDentistToClinic(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		clinicId, exists := params.PathParameters["id"]
		if !exists {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "Clinic ID not found in the request path", "")
			return
		}

		tx, err := r.database.BeginTx(ctx, nil)
		if err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to start transaction", err.Error())
			return
		}
		qtx := r.queries.WithTx(tx)

		data, err := mqtt.ConvertPayloadData[schema.DentistInput](payload.Data)
		if err != nil {
			tx.Rollback()
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Invalid dentist data provided", err.Error())
			return
		}

		// NOTE: email is needed to create a user account for a new dentist
		if data.Contact.Email == nil {
			tx.Rollback()
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Dentist email was not provided", "Dentist email missing in the input data")
			return
		}

		dentistUser := schema.UserInput{
			FirstName: data.FirstName,
			LastName:  data.LastName,
			Email:     *data.Contact.Email,
			Password:  data.Password,
			Role:      "dentist",
		}
		createUserResponse, err := r.client.InterCommunicate(
			ctx, client, "dit356g2/users/res", mqtt.POST, "/users", dentistUser,
		)
		if err != nil {
			tx.Rollback()
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Could not create user account for this dentist", err.Error())
			return
		}

		if createUserResponse.Status != mqtt.STATUS_201_CREATED {
			errorBody, err := mqtt.ConvertPayloadData[mqtt.ErrorBody](createUserResponse.Data)
			if err != nil {
				tx.Rollback()
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Could not create user account", err.Error())
				return
			}

			tx.Rollback()
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, errorBody.Message, errorBody.Details)
			return
		}

		userResponseData, err := mqtt.ConvertPayloadData[schema.UserOutput](createUserResponse.Data)
		if err != nil {
			tx.Rollback()
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Invalid user response data", err.Error())
			return
		}

		contact, err := qtx.AddContact(ctx, schema.PrepareContactParams(data.Contact.Email, data.Contact.PhoneNumber))
		if err != nil {
			tx.Rollback()
			errType := db.MapDbError(err)
			if errType == db.DuplicateEntry || errType == db.ConstraintError {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Contact information already exist", err.Error())
			} else {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add dentist contact information", err.Error())
			}
			return
		}

		dentist, err := qtx.AddDentist(ctx, schema.PrepareDentistParams(data, userResponseData.Id, contact.ID))
		if err != nil {
			tx.Rollback()
			errType := db.MapDbError(err)
			if errType == db.DuplicateEntry || errType == db.ConstraintError {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Dentist already exists", err.Error())
			} else {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add a new dentist", err.Error())
			}
			return
		}

		_, err = qtx.AddClinicDentist(ctx, db.AddClinicDentistParams{ClinicID: clinicId, DentistID: dentist.ID})
		if err != nil {
			tx.Rollback()
			errType := db.MapDbError(err)
			if errType == db.ConstraintError || errType == db.ForeignKeyConstraint || errType == db.DuplicateEntry {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "This dentist is already assigned to the clinic", err.Error())
			} else {
				mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not add dentist to the clinic", err.Error())
			}
			return
		}

		if err := tx.Commit(); err != nil {
			mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Failed to commit transaction", err.Error())
			return
		}

		mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_201_CREATED, schema.PrepareDentistOutput(dentist, contact))
	}()
}
