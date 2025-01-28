const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const { mqttClient } = require("../mqtt/mqttClient");
const querystring = require("querystring");

const incomingTopic = "dit356g2/clinics/res";
const outgoingTopic = "dit356g2/clinics/req";

// Subscribe to relevant topics 
mqttClient.subscribe(incomingTopic); 

function createClinicHandler(req, res) {
  const timeoutMs = 5000;  
  const clinicData = req.body;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method,
    path: "/clinics", 
    data: clinicData 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getClinicsHandler(req, res) {
  const timeoutMs = 5000;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method,
    path: req.query ? `/clinics?${querystring.stringify(req.query)}` : "/clinics"
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}
 
function getClinicHandler(req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method,
    path: `/clinics/${clinicId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function updateClinicHandler(req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const clinicData = req.body;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: `/clinics/${clinicId}`, 
    data: clinicData
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function deleteClinicHandler(req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: `/clinics/${clinicId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function createDentistForClinicHandler(req, res) {
  const timeoutMs = 5000;  
  const clinicId = req.params.clinicId;
  const dentistData = req.body;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: `/clinics/${clinicId}/dentists`, 
    data: dentistData 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getDentistsForClinicHandler(req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const msgId = nanoid();
  const requestPayload = { 
      msgId: msgId, 
      method: req.method, 
      path: `/clinics/${clinicId}/dentists`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getDentistForClinicHandler(req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const dentistId = req.params.dentistId;
  const msgId = nanoid();
  const requestPayload = { 
      msgId: msgId, 
      method: req.method, 
      path: `/clinics/${clinicId}/dentists/${dentistId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function updateDentistForClinicHandler (req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const dentistId = req.params.dentistId;
  const dentistData = req.body;
  const msgId = nanoid();
  const requestPayload = { 
      msgId: msgId, 
      method: req.method, 
      path: `/clinics/${clinicId}/dentists/${dentistId}`, 
      data: dentistData 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function deleteDentistForClinicHandler (req, res) {
  const timeoutMs = 5000;
  const clinicId = req.params.clinicId;
  const dentistId = req.params.dentistId;
  const msgId = nanoid();
  const requestPayload = { 
      msgId: msgId, 
      method: req.method, 
      path: `/clinics/${clinicId}/dentists/${dentistId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

module.exports = {
    getClinicsHandler,
    getClinicHandler,
    createClinicHandler, 
    updateClinicHandler,
    deleteClinicHandler,
    createDentistForClinicHandler, 
    getDentistsForClinicHandler, 
    getDentistForClinicHandler,
    updateDentistForClinicHandler,
    deleteDentistForClinicHandler,
};
  
