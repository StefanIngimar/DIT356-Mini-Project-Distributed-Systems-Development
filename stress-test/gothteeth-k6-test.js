// init context: 

import { sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { vu, scenario } from 'k6/execution';
import { SharedArray } from 'k6/data';
import { appConfig } from './config/k6/appConfig.js';
import { generateAppointmentMockData } from './mockers/appointment.js';

const appointmentCreationFailRate = new Rate('failed_appointment_creations');
const bookingCreationFailRate = new Rate('failed_booking_creations');

const totalVUs = 50;
 
// shared array variables:
const userIds = new SharedArray('users', function () {
    return JSON.parse(open('./data/userIds.json'));
});

const dentistClinicIds = new SharedArray('dentists', function () {
    return JSON.parse(open('./data/dentistIds.json'));
});

export const options = {
  //setupTimeout: '30m',
  discardResponseBodies: true,
  scenarios: {
    create_appointment: {
      // common scenario config             // default
      executor: 'shared-iterations',
      //startTime: '1s',                    // '0s'
      gracefulStop: '2s',                   // '30s'
      exec: 'createAppointment',            // 'default'
      //env: { EXAMPLEVAR: 'testing' },     // {}
      tags: { example_tag: 'appointment' }, // {}

      // executor-specific config 
      vus: totalVUs,                        // 1
      iterations: 1500,                     // 1
      maxDuration: '60s',                   // '10m' excluding gracefulStop
    },
    book_appointment: {
        // common scenario config        
        executor: 'per-vu-iterations',
        startTime: '62s',                      
        gracefulStop: '2s',                    
        exec: 'bookAppointment',                   
        tags: { example_tag: 'booking' },      
  
        // executor-specific config
        vus: totalVUs,
        iterations: 1,
        maxDuration: '120s',
    },
  },
};

// VU code:

let appointmentIds = []; 

export function createAppointment () {
    const params = {...appConfig.params, responseType: 'text'};
    const iterationNum = scenario.iterationInTest;    
    const dentistObj = dentistClinicIds[iterationNum];
    
    const appointment = generateAppointmentMockData(dentistObj);
    const payload = JSON.stringify(appointment);

    const response = http.post(appConfig.appointmentsUrl, payload, params);

    if (response.status === 201) {
        appointmentIds.push(JSON.parse(response.body)._id);
        appointmentCreationFailRate.add(false);
    } else {
        console.log(`Appt: ${response.status} error: ${response.body}`);
        appointmentCreationFailRate.add(true);
    }
    sleep(1);
}

export function bookAppointment () {
    const params = appConfig.params;
    const iterationNum = scenario.iterationInTest;   
    const vuNum = vu.idInTest;

    appointmentIds.forEach(appointmentId => {
        http.get(`${appConfig.appointmentsUrl}/${appointmentId}`);

        const patientId = userIds[iterationNum];
        const booking = {
            timeslot: appointmentId,
            patient: patientId, 
        };
        const payload = JSON.stringify(booking);
        
        const response = http.post(appConfig.bookingsUrl, payload, {...params, responseType: 'text'});
    
        if (response.status === 201) {
            bookingCreationFailRate.add(false);
        } else {
            console.log(`Booking: ${response.status} error: ${response.body}`);
            bookingCreationFailRate.add(true);
        }
        sleep(1);
    });
}
