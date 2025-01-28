package mqtt

import (
	"fmt"
	"log"
	"net/url"
	"strings"

	pahoMqtt "github.com/eclipse/paho.mqtt.golang"
)

type HTTPMethod string

const (
	GET    HTTPMethod = "GET"
	POST   HTTPMethod = "POST"
	PUT    HTTPMethod = "PUT"
	DELETE HTTPMethod = "DELETE"
)

type HTTPStatus int

const (
	STATUS_200_OK              HTTPStatus = 200
	STATUS_201_CREATED         HTTPStatus = 201
	STATUS_204_NO_CONTENT      HTTPStatus = 204
	STATUS_400_BAD_REQUEST     HTTPStatus = 400
	STATUS_404_NOT_FOUND       HTTPStatus = 404
	STATUS_408_REQUEST_TIMEOUT HTTPStatus = 408
	STATUS_500_INTERNAL_ERROR  HTTPStatus = 500
)

type Request[T interface{}] struct {
	MsgId  string     `json:"msgId"`
	Method HTTPMethod `json:"method"`
	Path   string     `json:"path"`
	Data   T          `json:"data"`
}

type Response[T interface{}] struct {
	MsgId  string     `json:"msgId"`
	Status HTTPStatus `json:"status"`
	Data   T          `json:"data"`
}

type ErrorBody struct {
	Message string `json:"message"`
	Details string `json:"details"`
}

type Params map[string]string
type RequestParameters struct {
	PathParameters  Params
	QueryParameters Params
}

type RouteHandler func(pahoMqtt.Client, pahoMqtt.Message, RequestParameters, Request[interface{}])

type Router struct {
	routes map[HTTPMethod]map[string]RouteHandler
}

func NewRouter() *Router {
	return &Router{
		routes: make(map[HTTPMethod]map[string]RouteHandler),
	}
}

func (r *Router) RegisterHandler(method HTTPMethod, path string, handler RouteHandler) {
	if _, exists := r.routes[method]; !exists {
		r.routes[method] = make(map[string]RouteHandler)
	}

	r.routes[method][path] = handler
}

func (r *Router) Serve(client pahoMqtt.Client, msg pahoMqtt.Message) {
	payload, err := ConvertMessagePayload[Request[any]](msg)
	if err != nil {
		// NOTE: since it was not possible to parse the request, there is no message ID that can be passed back to the caller
		log.Printf("Invalid structure of the message payload received on topic '%s'\n", msg.Topic())
		SendErrorResponse(client, msg.Topic(), "", STATUS_400_BAD_REQUEST, "Invalid structure of the request", err.Error())
		return
	}

	routes, exists := r.routes[payload.Method]
	if !exists {
		log.Printf("No routes were found for method '%s' received on topic '%s'\n", payload.Method, msg.Topic())
		SendErrorResponse(client, msg.Topic(), payload.MsgId, STATUS_404_NOT_FOUND, fmt.Sprintf("No routes were found for method '%s'", payload.Method), fmt.Sprintf("No handlers associated with HTTP method '%s'", payload.Method))
		return
	}

	for route, handler := range routes {
		params, matches := r.matchRoute(route, payload.Path)
		if matches {
			log.Printf("Serving request for method '%s' and path '%s' received on topic '%s'\n", payload.Method, payload.Path, msg.Topic())
			handler(client, msg, params, payload)
			return
		}
	}

	log.Printf("No handler was found for method '%s' and path '%s' received on topic '%s'\n", payload.Method, payload.Path, msg.Topic())
	SendErrorResponse(client, msg.Topic(), payload.MsgId, STATUS_404_NOT_FOUND, fmt.Sprintf("No handler found for HTTP method '%s' and path '%s'", payload.Method, payload.Path), "")
}

func (r *Router) matchRoute(route string, path string) (RequestParameters, bool) {
	normalizedRoute := strings.Trim(route, "/")
	normalizedPath := strings.Trim(path, "/")

	routeSegments := strings.Split(normalizedRoute, "/")
	pathAndQuery := strings.SplitN(normalizedPath, "?", 2)

	pathSegment := pathAndQuery[0]
	pathSegments := strings.Split(pathSegment, "/")

	if len(routeSegments) != len(pathSegments) {
		return RequestParameters{}, false
	}

	pathParams := make(map[string]string)
	for idx, routeSegment := range routeSegments {
		pathSegment := pathSegments[idx]

		if strings.HasPrefix(routeSegment, ":") {
			pathParams[routeSegment[1:]] = pathSegment
		} else if routeSegment != pathSegment {
			return RequestParameters{}, false
		}
	}

	queryParams := make(map[string]string)
	if len(pathAndQuery) > 1 {
		queryString := pathAndQuery[1]
		values, err := url.ParseQuery(queryString)
		if err != nil {
			return RequestParameters{}, false
		}
		for key, vals := range values {
			queryParams[key] = vals[0]
		}
	}

	return RequestParameters{PathParameters: pathParams, QueryParameters: queryParams}, true
}
