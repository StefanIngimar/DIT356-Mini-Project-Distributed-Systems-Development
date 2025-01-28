const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const mqttClient = require("../mqtt/mqttClient");

const outgoingTopic = "dit356g2/users/req";
const incomingTopic = "dit356g2/users/res";
const timeoutIds = new Map();

function fetchPatients() {
  const timeoutMs = 5000;
  const msgId = nanoid();  
  const requestPayload = { 
    msgId: msgId, 
    method: "GET", 
    path: `/users`, 
    data: {}
  };
  
  mqttClient.publish(outgoingTopic, requestPayload);
  mqttClient.subscribe(incomingTopic); 

  // MQTT response might take some time
  // use Promise to wrap async code 
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logger.info(`MQTT: request timeout on topic: ${outgoingTopic}`);
      mqttClient.unsubscribe(incomingTopic); 
      reject(new Error("Timeout: couldn't fetch patients data"));
    }, timeoutMs);

    timeoutIds.set(msgId, timeoutId);

    mqttClient.onMessage((topic, message) => {
      try { 
          const mqttMsg = JSON.parse(message); // message is Buffer
          const mqttMsgStr = JSON.stringify(mqttMsg);
    
          logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
    
          if (mqttMsg.msgId == msgId) {
            clearTimeout(timeoutIds.get(msgId));
            mqttClient.unsubscribe(incomingTopic); 
            resolve(mqttMsg.data);
          }
      } catch (error) {
          logger.error(`Booking -> User srvc req error: ${error.message}`);
      }
    });     
  });
}

function fetchPatient(patientId) {
    const timeoutMs = 5000;
    const msgId = nanoid();  
    const requestPayload = { 
      msgId: msgId, 
      method: "GET", 
      path: `/users/${patientId}`, 
      data: {}
    };
    
    mqttClient.publish(outgoingTopic, requestPayload);
    mqttClient.subscribe(incomingTopic); 

    // MQTT response might take some time
    // use Promise to wrap async code 
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.info(`MQTT: request timeout on topic: ${outgoingTopic}`);
        mqttClient.unsubscribe(incomingTopic); 
        reject(new Error("Timeout: couldn't fetch patient data"));
      }, timeoutMs);

      timeoutIds.set(msgId, timeoutId);

      mqttClient.onMessage((topic, message) => {
        try { 
            const mqttMsg = JSON.parse(message); // message is Buffer
            const mqttMsgStr = JSON.stringify(mqttMsg);
      
            logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
      
            if (mqttMsg.msgId == msgId) {
              clearTimeout(timeoutIds.get(msgId));
              mqttClient.unsubscribe(incomingTopic); 
              resolve(mqttMsg.data);
            }
        } catch (error) {
            logger.error(`Booking -> User srvc req error: ${error.message}`);
        }
      });     
    });
}

module.exports = { 
    fetchPatient, 
    fetchPatients,
};

 