package config

import (
	"time"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/env"
)

type MQTT struct {
	BrokerUri      string
	ClientId       string
	Username       *string
	Password       *string
	AutoReconnect  bool
	ConnectTimeout time.Duration
}

func NewMqtt() *MQTT {
	return &MQTT{
		BrokerUri:      env.GetStringEnv("BROKER_URI", "tcp://127.0.0.1:1883"),
		ClientId:       env.GetStringEnv("MQTT_CLIENT_ID", "dentist-service-1"),
		Username:       nil,
		Password:       nil,
		AutoReconnect:  env.GetBoolEnv("MQTT_AUTO_RECONNECT", true),
		ConnectTimeout: time.Duration(env.GetIntEnv("MQTT_CONNECT_TIMEOUT", 250)) * time.Millisecond,
	}
}
