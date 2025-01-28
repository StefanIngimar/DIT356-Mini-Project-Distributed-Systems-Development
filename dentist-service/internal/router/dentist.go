package router

import (
	"context"
	"database/sql"
	"time"

	pahoMqtt "github.com/eclipse/paho.mqtt.golang"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/mqtt"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/schema"
)

type DentistRouter struct {
	database *sql.DB
	queries  *db.Queries
	router   mqtt.Router
}

func NewDentistRouter(database *sql.DB, queries *db.Queries) *DentistRouter {
	dr := &DentistRouter{
		database: database,
		queries:  queries,
		router:   *mqtt.NewRouter(),
	}

	dr.router.RegisterHandler(mqtt.GET, "/dentists", dr.getDentists)
	dr.router.RegisterHandler(mqtt.GET, "/dentists/:id", dr.getDentist)
	dr.router.RegisterHandler(mqtt.GET, "/dentists/users/:id", dr.getDentistFromUserId)
	dr.router.RegisterHandler(mqtt.GET, "/dentists/:id/clinics", dr.getDentistWithClinics)

	return dr
}

func (dr *DentistRouter) HandleTopLevelRouting(client pahoMqtt.Client, msg pahoMqtt.Message) {
	dr.router.Serve(client, msg)
}

func (dr *DentistRouter) getDentists(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        dentistsData, err := dr.queries.GetDentists(ctx, db.GetDentistsParams{Limit: 50, Offset: 0})
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentists data", err.Error())
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapDbDentistsToOutputSchema(dentistsData))
    }()
}

func (dr *DentistRouter) getDentist(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        dentistId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Dentist ID not found in the request path", "")
            return
        }

        dentist, err := dr.queries.GetDentistById(ctx, dentistId)
        if err != nil {
            errType := db.MapDbError(err)
            if errType == db.NoRows {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "No dentist found with this ID", "")
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentist data", err.Error())
            }
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetDentistsByIdRowToDentistOutput(dentist))
    }()
}

func (dr *DentistRouter) getDentistFromUserId(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        userId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "User ID not found in the request path", "")
            return
        }

        dentist, err := dr.queries.GetDentistByUserId(ctx, userId)
        if err != nil {
            errType := db.MapDbError(err)
            if errType == db.NoRows {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "No dentist found corresponding to user ID", "")
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentist data", err.Error())
            }
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetDentistByUserIdtoDentistOutput(dentist))
    }()
}

func (dr *DentistRouter) getDentistWithClinics(client pahoMqtt.Client, msg pahoMqtt.Message, params mqtt.RequestParameters, payload mqtt.Request[interface{}]) {
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        dentistId, exists := params.PathParameters["id"]
        if !exists {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_400_BAD_REQUEST, "Dentist ID not found in the request path", "")
            return
        }

        dentist, err := dr.queries.GetDentistById(ctx, dentistId)
        if err != nil {
            errType := db.MapDbError(err)
            if errType == db.NoRows {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_404_NOT_FOUND, "No dentist found with this ID", "")
            } else {
                mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentist data", err.Error())
            }
            return
        }

        dentistClinics, err := dr.queries.GetClinicsAssociatedWithDentist(ctx, dentistId)
        if err != nil {
            mqtt.SendErrorResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_500_INTERNAL_ERROR, "Could not get dentist data", err.Error())
            return
        }

        mqtt.SendResponse(client, msg.Topic(), payload.MsgId, mqtt.STATUS_200_OK, schema.MapGetDentistsWithTheirClinics(dentist, dentistClinics))
    }()
}
