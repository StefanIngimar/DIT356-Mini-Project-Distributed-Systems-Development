package mqtt

import (
	"context"
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/google/uuid"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/config"
)

type MqttClient struct {
	client mqtt.Client
}

func New(config config.MQTT) *MqttClient {
	opts := mqtt.
		NewClientOptions().
		AddBroker(config.BrokerUri).
		SetClientID(config.ClientId).
		SetAutoReconnect(config.AutoReconnect).
		SetConnectTimeout(config.ConnectTimeout).
		SetResumeSubs(true).
		SetCleanSession(false)

	if config.Password != nil && config.Username != nil {
		opts.SetUsername(*config.Username).SetPassword(*config.Password)
	}

	client := mqtt.NewClient(opts)

	return &MqttClient{client: client}
}

func (c *MqttClient) Connect() error {
	if token := c.client.Connect(); token.Wait() && token.Error() != nil {
		return token.Error()
	}

	log.Printf("Client connected")

	return nil
}

func (c *MqttClient) Disconnect() {
	var delayMs uint = 250
	c.client.Disconnect(delayMs)

	log.Printf("Client disconnected")
}

func (c *MqttClient) Subscribe(topic string, handler mqtt.MessageHandler) error {
	if token := c.client.Subscribe(topic, 0, handler); token.Wait() && token.Error() != nil {
		return token.Error()
	}

	log.Printf("Subscribed to topic '%s'", topic)

	return nil
}

func (c *MqttClient) Unsubscribe(topic string) error {
	if token := c.client.Unsubscribe(topic); token.Wait() && token.Error() != nil {
		return token.Error()
	}

	log.Printf("Unsubscribed from topic '%s'", topic)

	return nil
}

func (c *MqttClient) Publish(topic string, payload interface{}) error {
	log.Printf("Publishing on topic '%s'", topic)

	token := c.client.Publish(topic, 0, false, payload)
	token.Wait()

	return token.Error()
}

// NOTE: inter-communicate with the other service through mqtt
// publish messages on a specified topic and wait for the response based on the
// timeout specified in the context
func (c *MqttClient) InterCommunicate(
	ctx context.Context,
	client mqtt.Client,
	responseTopic string,
	requestMethod HTTPMethod,
	requestPath string,
	requestData interface{},
) (Response[any], error) {
	responseChan := make(chan Response[any], 10)
	requestId := uuid.NewString()

	err := c.Subscribe(responseTopic, func(client mqtt.Client, responseMsg mqtt.Message) {
		converted, err := ConvertMessagePayload[Response[any]](responseMsg)
		if converted.MsgId != requestId {
			return
		} else if err != nil {
			log.Printf("Invalid response payload received from '%s': '%s'", responseMsg.Topic(), err.Error())
			return
		}

		select {
		case responseChan <- converted:
		default:
			log.Println("Response channel full - message is discarded")
		}
	})
	if err != nil {
		return Response[any]{}, err
	}
	defer c.Unsubscribe(responseTopic)

	err = SendRequest(client, responseTopic, requestId, requestMethod, requestPath, requestData)
	if err != nil {
		return Response[any]{}, err
	}

	select {
	case response := <-responseChan:
		log.Printf("Response received: %v", response)
		return response, nil
	case <-ctx.Done():
		log.Printf("Getting data while calling response on '%s' timed out\n", responseTopic)
		return Response[any]{}, ctx.Err()
	}
}
