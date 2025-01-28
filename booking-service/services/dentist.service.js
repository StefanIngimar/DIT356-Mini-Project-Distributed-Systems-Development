const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const mqttClient = require("../mqtt/mqttClient");

const outgoingClinicTopic = "dit356g2/clinics/req";
const incomingClinicTopic = "dit356g2/clinics/res";
const outgoingDentistTopic = "dit356g2/dentists/req";
const incomingDentistTopic = "dit356g2/dentists/res";

const timeoutIds = new Map();

function fetchClinics() {
  const timeoutMs = 5000;
  const msgId = nanoid();  
  const requestPayload = { 
    msgId: msgId, 
    method: "GET", 
    path: "/clinics", 
    data: {}
  };
  
  mqttClient.publish(outgoingClinicTopic, requestPayload);
  mqttClient.subscribe(incomingClinicTopic); 

  // MQTT response might take some time
  // use Promise to wrap async code 
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logger.info(`MQTT: request timeout on topic: ${outgoingClinicTopic}`);
      mqttClient.unsubscribe(incomingClinicTopic); 
      reject(new Error("Timeout: couldn't fetch clinics data"));
    }, timeoutMs);

    timeoutIds.set(msgId, timeoutId);

    mqttClient.onMessage((topic, message) => {
      try { 
          const mqttMsg = JSON.parse(message); // message is Buffer
          const mqttMsgStr = JSON.stringify(mqttMsg);
    
          logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
    
          if (mqttMsg.msgId == msgId) {
            clearTimeout(timeoutIds.get(msgId));
            mqttClient.unsubscribe(incomingClinicTopic); 
            resolve(mqttMsg.data);
          }
      } catch (error) {
          logger.error(`Booking -> Dentist srvc req error: ${error.message}`);
      }
    });     
  });  
}

function fetchClinic(clinicId) {
    const timeoutMs = 5000;
    const msgId = nanoid();  
    const requestPayload = { 
      msgId: msgId, 
      method: "GET", 
      path: `/clinics/${clinicId}`, 
      data: {}
    };
    
    mqttClient.publish(outgoingClinicTopic, requestPayload);
    mqttClient.subscribe(incomingClinicTopic); 

    // MQTT response might take some time
    // use Promise to wrap async code 
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.info(`MQTT: request timeout on topic: ${outgoingClinicTopic}`);
        mqttClient.unsubscribe(incomingClinicTopic); 
        reject(new Error("Timeout: couldn't fetch clinic data"));
      }, timeoutMs);

      timeoutIds.set(msgId, timeoutId);

      mqttClient.onMessage((topic, message) => {
        try { 
            const mqttMsg = JSON.parse(message); // message is Buffer
            const mqttMsgStr = JSON.stringify(mqttMsg);
      
            logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
      
            if (mqttMsg.msgId == msgId) {
              clearTimeout(timeoutIds.get(msgId));
              mqttClient.unsubscribe(incomingClinicTopic); 
              resolve(mqttMsg.data);
            }
        } catch (error) {
            logger.error(`Booking -> Dentist srvc req error: ${error.message}`);
        }
      });     
    });
}

function fetchDentists() {
  const timeoutMs = 5000;
  const msgId = nanoid();  
  const requestPayload = { 
    msgId: msgId, 
    method: "GET", 
    path: "/dentists", 
    data: {}
  };
  
  mqttClient.publish(outgoingDentistTopic, requestPayload);
  mqttClient.subscribe(incomingDentistTopic); 

  // MQTT response might take some time
  // use Promise to wrap async code 
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logger.info(`MQTT: request timeout on topic: ${outgoingDentistTopic}`);
      mqttClient.unsubscribe(incomingDentistTopic); 
      reject(new Error("Timeout: couldn't fetch dentists data"));
    }, timeoutMs);

    timeoutIds.set(msgId, timeoutId);

    mqttClient.onMessage((topic, message) => {
      try { 
          const mqttMsg = JSON.parse(message); // message is Buffer
          const mqttMsgStr = JSON.stringify(mqttMsg);
    
          logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
    
          if (mqttMsg.msgId == msgId) {
            clearTimeout(timeoutIds.get(msgId));
            mqttClient.unsubscribe(incomingDentistTopic); 
            resolve(mqttMsg.data);
          }
      } catch (error) {
          logger.error(`Booking -> Dentist srvc req error: ${error.message}`);
      }
    });     
  });
}

function fetchDentist(dentistId) {
    const timeoutMs = 5000;
    const msgId = nanoid();  
    const requestPayload = { 
      msgId: msgId, 
      method: "GET", 
      path: `/dentists/${dentistId}`, 
      data: {}
    };
    
    mqttClient.publish(outgoingDentistTopic, requestPayload);
    mqttClient.subscribe(incomingDentistTopic); 

    // MQTT response might take some time
    // use Promise to wrap async code 
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.info(`MQTT: request timeout on topic: ${outgoingDentistTopic}`);
        mqttClient.unsubscribe(incomingDentistTopic); 
        reject(new Error("Timeout: couldn't fetch dentist data"));
      }, timeoutMs);

      timeoutIds.set(msgId, timeoutId);

      mqttClient.onMessage((topic, message) => {
        try { 
            const mqttMsg = JSON.parse(message); // message is Buffer
            const mqttMsgStr = JSON.stringify(mqttMsg);
      
            logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);
      
            if (mqttMsg.msgId == msgId) {
              clearTimeout(timeoutIds.get(msgId));
              mqttClient.unsubscribe(incomingDentistTopic); 
              resolve(mqttMsg.data);
            }
        } catch (error) {
            logger.error(`Booking -> Dentist srvc req error: ${error.message}`);
        }
      });     
    });
}

module.exports = { 
    fetchClinics, 
    fetchClinic, 
    fetchDentists, 
    fetchDentist, 
};
