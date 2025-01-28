const CONNECTING = 0
const CONNECTED = 1
const CLOSED = 2
const ERROR = 3
const RECONNECTING = 4

class WS {
    /**
     * @public
     * @type {(buf: ArrayBuffer | null) => void}
     */
    onmessage

    /**
     * @private
     * @type {WebSocket}
     */
    #ws
    
    /**
     * @private
     * @type {string}
     */
    #url

    /**
     * @private
     * @type {number}
     */
    #connState
    
    /**
     * @private
     * @type {boolean}
     */
    #isClosedManually

    /**
     * @private
     * @type {number}
     */
    #reconnectDelayMs
    
    /**
     * 
     * @param {string} url 
     */
    constructor(url) {
        this.#url = url;
        this.#reconnectDelayMs = 1000;
        this.#isClosedManually = false;

        this.onmessage = null;

        this.#connect();
    }

    close() {
        if (this.#ws) {
            this.#isClosedManually = true;
            this.#ws.close();
        }
    }

    #connect() {
        if (this.#connState === CONNECTED) {
            return;
        }

        const ws = this.#ws = new WebSocket(this.#url);
        this.#connState = CONNECTING;

        ws.onopen = () => {
            console.log("Connected to the WebSocket server");
            this.#connState = CONNECTED;
            this.#reconnectDelayMs = 1000;
        }

        ws.onclose = () => {
            this.#connState = CLOSED;
            console.log("WebSocket connection closed")
            
            if (!this.#isClosedManually) {
                this.#reconnect();
            }
        }

        ws.onerror = (err) => {
            this.#connState = ERROR;
            console.error("WebSocket error:", err);
            
            this.#reconnect();
        }

        ws.onmessage = (msg) => {
            /**
             * @type {ArrayBuffer}
             */
            const arrayBuffer = msg.data;

            if (this.onmessage) {
                this.onmessage(arrayBuffer);
            }
        }
    }

    #reconnect() {
        if (this.#connState === RECONNECTING) {
            return;
        }

        this.#connState === RECONNECTING;

        console.log(`Reconnecting to the WebSocket server in ${this.#reconnectDelayMs / 1000} seconds`);
        setTimeout(() => this.#connect(), this.#reconnectDelayMs);
        this.#reconnectDelayMs = Math.min(this.#reconnectDelayMs * 2, 30000);
    }
}

export default WS;