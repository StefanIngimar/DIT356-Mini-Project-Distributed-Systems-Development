const mqtt = require("mqtt");

const { logger } = require("../../utils/logging.util");
const { WS, wsClient } = require("../../ws/client"); const { mqttWsBrokerUri, mqttWsBrokerPort } = require("../../config/app.config");

class MqttWsClient {
    /**
     * @private
     * @type {string}
     */
    #brokerUri

    /**
     * @private
     * @type {string}
     */
    #brokerPort

    /**
     * @private
     * @type {mqtt.MqttClient | null}
     */
    #mqttClient

    /**
     * @private
     * @type {WS}
     */
    #wsClient

    /** 
     * @param {string} brokerUri
     * @param {string} brokerPort
     * @param {WS} wsClient 
    */
    constructor(brokerUri, brokerPort, wsClient) {
        this.#brokerUri = brokerUri;
        this.#brokerPort = brokerPort;
        this.#mqttClient = null;
        this.#wsClient = wsClient;
    }

    connect() {
        this.#mqttClient = mqtt.connect(`${this.#brokerUri}:${this.#brokerPort}/mqtt`, this.#getConnectionOpts());

        this.#mqttClient.on("connect", this.#onConnect);
        this.#mqttClient.on("error", (err) => this.#onConnectionError(err));
        this.#mqttClient.on("message", (topic, message) => this.#onMessage(topic, message));
        this.#mqttClient.on("reconnect", this.#onReconnect);
        this.#mqttClient.on("close", this.#onClose);
    }

    /**
     * 
     * @param {string} topic 
     * @param {mqtt.IClientSubscribeOptions | mqtt.IClientSubscribeProperties | null} opts 
     * @returns {void}
     */
    subscribe(topic, opts) {
        if (!this.#mqttClient) {
            logger.error("WS MQTT: client is not set. Cannot subscribe to topic");
            return;
        }
        this.#mqttClient.subscribe(topic, opts, (err) => {
            if (err) {
                logger.error(`WS MQTT: cannot subscribe to '${topic}', error: ${err}`);
            } else {
                logger.info(`WS MQTT: subscribed to '${topic}'`);
            }
        });
    }

    /**
     * 
     * @returns {Record<string, string | number>}
     */
    #getConnectionOpts() {
        return {
            clientId: 'api-gateway-ws-' + Math.random().toString(16).substring(2, 8),
            keepalive: 60,
            connectTimeout: 30000,
            reconnectPeriod: 5000,
            reconnectOnConnackError: true, 
            resubscribe: true,
            clean: false,
            queueQoSZero: true,
            manualConnect: false,
        }
    }
    
    /**
     *
     * @param {string} err
     */
    #onConnectionError(err) {
        logger.error(`WS MQTT: connection error: ${err}`);
        if (this.#mqttClient) {
            this.#mqttClient.end();
        }

        if (err instanceof AggregateError) {
            err.errors.forEach((e, index) => {
                console.error(`Error ${index + 1}:`, e);
            });
        } else {
            console.error('Detailed error stack:', err.stack);
        }

        logger.info("WS MQTT: attempting to connect after error");
        this.#mqttClient = mqtt.connect(this.#brokerUri, this.#getConnectionOpts());
    }

    /**
     *
     * @param {string} topic 
     * @param {Buffer} message 
     */
    #onMessage(topic, message) {

        let jsonMessage; 
        try {
            jsonMessage = JSON.parse(message);
        } catch (err) {
            logger.error("Could not parse message into JSON:", message, err);
            return;
        }

        // NOTE(SW): this is far from being good but should work for now
        // The if statement below assumes that the word after the last '/'
        // is userId like 'dit356g2/notifications/ws/users/11223344'
        if (topic.startsWith("dit356g2/notifications/ws/users/")) {
            const topicSplit = topic.split("/");
            const userId = topicSplit[topicSplit.length - 1];

            if (!userId) {
                logger.error("User ID was expected but not found in the topic:", topic);
                return;
            }

            this.#wsClient.notifyClient(
                userId,
                jsonMessage
            );
        } else {
            this.#wsClient.notifyClients(jsonMessage);
        }
    }

    #onConnect() {
        logger.info("WS MQTT: connected to the broker");
    }

    #onReconnect() {
        logger.info("WS MQTT: reconnecting to the broker");
    }

    #onClose() {
        logger.info("WS MQTT: closed connection to the broker");
    }
}

const mqttWsClient = new MqttWsClient(mqttWsBrokerUri, mqttWsBrokerPort, wsClient);

module.exports = mqttWsClient;