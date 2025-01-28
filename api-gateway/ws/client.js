const WebSocket = require("ws");
const { logger } = require("../utils/logging.util");

class WS {
    /**
     * @private
     * @type {Set<WebSocket>}
     */
    #wsClients

    /**
     * @private
     * @type {Record<string, WebSocket>}
     */
    #userIdToWsClient

    constructor() {
        this.#wsClients = new Set();
        this.#userIdToWsClient = {};
    }

    /**
     * 
     * @param {WebSocket} ws 
     */
    addClient(ws) {
        logger.info("New WebSocket client addded");
        this.#wsClients.add(ws);

        const cleanup = () => {
            logger.info("Started WebSocket client cleanup");
            this.#wsClients.delete(ws);

            for (const userId in this.#userIdToWsClient) {
                if (this.#userIdToWsClient[userId] === ws) {
                    delete this.#userIdToWsClient[userId];
                    break;
                }
            }
        }
        
        ws.on("close", () => {
            logger.info("WebSocket client closed the connection");
            cleanup();
        });

        ws.on("error", (err) => {
            logger.info("WebSocket client failed:", err);
            cleanup();
        })
    }

    /**
     * 
     * @param {string} userId 
     * @param {WebSocket} ws 
     */
    addUserIdToClient(userId, ws) {
        this.#userIdToWsClient[userId] = ws;
    }

    /**
     * 
     * @param {Record<string, Any>} payload 
     */
    notifyClients(payload) {
        this.#wsClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(payload));
                } catch (err) {
                    logger.error(`Failed to send websocket message: ${err}`);
                }
            }
        });
    }

    /**
     * 
     * @param {string} userId
     * @param {Record<string, Any>} payload 
     */
    notifyClient(userId, payload) {
        if (!Object.keys(this.#userIdToWsClient).includes(userId)) {
            return;
        }

        const client = this.#userIdToWsClient[userId];
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(payload));
            } catch (err) {
                logger.error(`Failed to send websocket message to client with id '${userId}': ${err}`);
            }
        }
    }

    close() {
        this.#wsClients.forEach(client => {
            client.close();
        })
        this.#wsClients.clear();
        logger.info("Websocket closed");
    }
}

const wsClient = new WS();

module.exports = {
    wsClient,
}
