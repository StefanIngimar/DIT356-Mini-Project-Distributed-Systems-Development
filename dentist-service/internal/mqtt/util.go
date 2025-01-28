package mqtt

import (
	"encoding/json"
	"log"
	"strings"

	pahoMqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/go-playground/validator/v10"
)

var Validator = validator.New()

func SendErrorResponse(client pahoMqtt.Client, originTopic string, requestId string, statusCode HTTPStatus, error string, details string) {
	errorBody := ErrorBody{
		Message: error,
		Details: details,
	}

	SendResponse(client, originTopic, requestId, statusCode, errorBody)
}

func SendResponse(client pahoMqtt.Client, originTopic string, requestId string, statusCode HTTPStatus, data interface{}) {
	destTopic := strings.Replace(originTopic, "/req", "/res", 1)

	log.Printf("Publishing response '%d' on topic '%s' for '%s'\n", statusCode, destTopic, requestId)

	response := Response[interface{}]{
		MsgId:  requestId,
		Status: statusCode,
		Data:   data,
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		log.Fatalf("Could not marshal the response object " + err.Error())
	}

	token := client.Publish(destTopic, 0, false, jsonResponse)
	token.Wait()
}

func SendRequest(client pahoMqtt.Client, originTopic string, requestId string, method HTTPMethod, path string, data interface{}) error {
	destTopic := strings.Replace(originTopic, "/res", "/req", 1)

	log.Printf("Publishing request '%s %s' on topic '%s' for '%s'\n", method, path, destTopic, requestId)

	request := Request[interface{}]{
		MsgId:  requestId,
		Method: method,
		Path:   path,
		Data:   data,
	}

	jsonResponse, err := json.Marshal(request)
	if err != nil {
		log.Fatalf("Could not marshal the request object " + err.Error())
	}

	token := client.Publish(destTopic, 0, false, jsonResponse)
	if token.Wait() && token.Error() != nil {
		return token.Error()
	}

	return nil
}

func ConvertMessagePayload[T any](msg pahoMqtt.Message) (T, error) {
	var payload T
	if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
		return payload, err
	}

	return payload, nil
}

func ConvertPayloadData[T any](payloadData interface{}) (T, error) {
	var res T

	jsonBytes, error := json.Marshal(payloadData)
	if error != nil {
		return res, error
	}

	if error := json.Unmarshal(jsonBytes, &res); error != nil {
		return res, error
	}

	return res, nil
}
