const mqtt = require("mqtt");
const { mqttBroker } = require("../config/app.config");
const { logger } = require("../utils/logging.util"); 

function MqttWrapper() {
    this.client = null;
    this.httpResponses = new Map(); // map of message IDs to HTTP responses 

    this.connect = function() {
        const options = {
            clientId: 'api-gateway-' + Math.random().toString(16).substring(2, 8),
            keepalive: 60,
            connectTimeout: 30000,
            reconnectPeriod: 5000,
            reconnectOnConnackError: true, 
            resubscribe: true,
            clean: false,
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

        // on message event calback
        this.client.on("message", (topic, message) => { 
            const mqttMsg = JSON.parse(message); // message is Buffer
            const mqttMsgStr = JSON.stringify(mqttMsg);
            const msgId = mqttMsg.msgId;
            const res = this.httpResponses.get(msgId);
            const statusCode = mqttMsg.status || 200;

            logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);

            if (res) {
              clearTimeout(res.timeoutId);
              res.status(statusCode).json(mqttMsg.data);
              this.httpResponses.delete(msgId);
              return;
            }
        });   

        // on reconnect callback
        this.client.on("reconnect", () => {
            logger.info("MQTT: reconnecting to broker...");
        });

        // on close callback
        this.client.on("close", () => {
            logger.info("MQTT: closed connection to broker");
        });
    }

    this.publishAndRespond = function(res, timeoutMs, topic, messageId, requestPayload) {
        this.httpResponses.set(messageId, res);
        this.publish(topic, requestPayload);

        res.timeoutId = setTimeout(() => {
            res.status(503).json({ errorMsg: "Request timeout!" }); 
            this.httpResponses.delete(messageId); 
            return;
        }, timeoutMs); 
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
