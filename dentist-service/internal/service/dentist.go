package service

import (
	"log"

	pahoMqtt "github.com/eclipse/paho.mqtt.golang"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/config"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/mqtt"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/router"
)

type Service struct {
	appCfg  *config.App
	mqttCfg *config.MQTT

	mqttClient *mqtt.MqttClient

	topicsWithHandlers map[string]pahoMqtt.MessageHandler
}

func New(appCfg *config.App, mqttCfg *config.MQTT) *Service {
	return &Service{
		appCfg:             appCfg,
		mqttCfg:            mqttCfg,
		mqttClient:         mqtt.New(*mqttCfg),
		topicsWithHandlers: make(map[string]pahoMqtt.MessageHandler),
	}
}

func (service *Service) Run() {
	dentistRouter := router.NewDentistRouter(service.appCfg.Db, service.appCfg.Queries)
	service.RegisterTopicWithHandler("dit356g2/dentists/req", dentistRouter.HandleTopLevelRouting)

	clinicRouter := router.NewClinicRouter(service.appCfg.Db, service.appCfg.Queries, service.mqttClient)
	service.RegisterTopicWithHandler("dit356g2/clinics/req", clinicRouter.HandleTopLevelRouting)

	if error := service.ListenAndServe(); error != nil {
		log.Fatalf("Error while serving the service. Error: %s", error.Error())
	}
}

func (service *Service) RegisterTopicWithHandler(topic string, handler pahoMqtt.MessageHandler) {
	service.topicsWithHandlers[topic] = handler
}

func (service *Service) DisconnectClient() {
	service.mqttClient.Disconnect()
}

func (service *Service) ListenAndServe() error {
	if error := service.mqttClient.Connect(); error != nil {
		return error
	} else if service.appCfg.Debug {
		log.Printf("Connected to the MQTT broker at: %s\n", service.mqttCfg.BrokerUri)
	}

	if error := service.subscribeToRegisteredTopics(); error != nil {
		return error
	}

	return nil
}

func (service *Service) subscribeToRegisteredTopics() error {
	for topic, handler := range service.topicsWithHandlers {
		if error := service.mqttClient.Subscribe(topic, handler); error != nil {
			return error
		}
	}

	return nil
}
