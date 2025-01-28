const { wsClient } = require("../ws/client");
const { mqttWsClient } = require("../mqtt/mqttClient");

const usersNotificationsTopic = "dit356g2/notifications/ws/users/+";

mqttWsClient.subscribe(usersNotificationsTopic);

function addClientCallback(ws, request) {
    wsClient.addClient(ws);

    if (request.query.user) {
        wsClient.addUserIdToClient(request.query.user, ws);
    }
}

module.exports = {
    addClientCallback,
}
