const mqtt = require("mqtt");
const { mqttBroker } = require("../config/app.config");
const { logger } = require("../utils/logging.util"); 

function MqttWrapper() {
    this.client = null;
    this.httpResponses = new Map(); // map of message IDs to HTTP responses 

    this.connect = function() {
        const options = {
            clientId: 'booking-service-' + Math.random().toString(16).substring(2, 8),
            keepalive: 60,
            connectTimeout: 30000,
            reconnectPeriod: 5000,
            reconnectOnConnackError: true, 
            resubscribe: true,
            clean: true,
            queueQoSZero: true,
            manualConnect: false,
        }

        this.client = mqtt.connect(mqttBroker, options);

        // on error event calback
        this.client.on("error", (error) => {
            logger.error(`MQTT: connection error: ${error}`);
            this.client.end();
            // attempt to connect again
            logger.info("MQTT: attempting to connect after error");
            this.client = mqtt.connect(mqttBroker, options);
        });

        // on connect event calback
        this.client.on("connect", () => {
            logger.info("MQTT: connected to broker");
        });
          
        // on close callback
        this.client.on("close", () => {
            logger.info("MQTT: disconnected from broker");
        });

        // on reconnect callback
        this.client.on("reconnect", () => {
            logger.info("MQTT: reconnecting to broker...");
        });
    }

    // default values used if options are undefined (not provided):

    this.publish = function(outgoingTopic, message, options) {
        this.client.publish(outgoingTopic, JSON.stringify(message), options, (error) => {
            logger.info(`MQTT: publishing on topic: ${outgoingTopic} ...`);
            if (error) { logger.error(`MQTT: publishing error: ${error}`); }
        });
    }

    this.subscribe = function(incomingTopics, options) {
        this.client.subscribe(incomingTopics, options, (error) => {
            if (error) { logger.info(`MQTT: subscription error: ${error}`); }
        }); 
    }

    this.unsubscribe = function(incomingTopics, options) {
        this.client.unsubscribe(incomingTopics, options, (error) => {
            if (error) { logger.info(`MQTT: unsubscription error: ${error}`); }
        }); 
    }
    
    // called after client disconnects
    // note: on close event callback will also log a message on disconnect
    this.end = function(callback) {
        this.client.end(callback);
    }

    // called after client receives a message 
    this.onMessage = function(callback) {
        this.client.on("message", callback);
    }

    // called after client is connected 
    this.onConnect = function(callback) {
        this.client.on("connect", callback);
    }
}

module.exports = MqttWrapper;