import axios from "axios";

import { generateClinicMockData, generateDentistMockData } from "./generators.js";
import { SETTINGS } from "./settings.js";

export async function createClinics(toAdd) {
    const endpoint = `${SETTINGS.API}/clinics`;

    const requestQueue = [];
    for (let i = 0; i < toAdd; i++) {
        const clinicData = generateClinicMockData();
        const headers = SETTINGS.REQUEST_HEADERS;
        requestQueue.push(
            axios.post(endpoint, clinicData, { headers }),
        );
    }

    try {
        const responses = await Promise.all(requestQueue);
        return responses.map((res) => res.data);
    } catch (error) {
        console.error("Error while creating clinics:", error);
        throw error;
    }
}

export async function createDentistsForClinic(clinics, toAdd) {
    const clinicIds = clinics.map((clinic) => clinic.id);
    for (let i = 0; i < toAdd; i++) {
        const clinicId =
            clinicIds[Math.floor(Math.random() * clinicIds.length)];
        const dentistData = generateDentistMockData();
        const endpoint = `${SETTINGS.API}/clinics/${clinicId}/dentists`;
        const headers = SETTINGS.REQUEST_HEADERS;
        try {
            await axios.post(endpoint, dentistData, { headers }),
                console.log(`\t[#${i + 1}] Dentist for clinic added`);
        } catch (error) {
            console.error("Error while adding dentist to clinic:", error);
        }
    }
}

export async function getDentistsPerClinic(clinicIds) {
    const clinicIdsToDentists = {};
    for (const clinicId of clinicIds) {
        try {
            const endpoint = `${SETTINGS.API}/clinics/${clinicId}/dentists`;
            const headers = SETTINGS.REQUEST_HEADERS;
            const response = await axios.get(endpoint, { headers });

            clinicIdsToDentists[clinicId] = response.data;
        } catch (error) {
            console.error(
                `Could not get dentists for clinic with ID '${clinicId}': ${error}`,
            );
        }
    }

    return clinicIdsToDentists;
}

export async function createAppointment(appointmentGenerator, dentistId, clinicId) {
    const startTime = Date.now();
    try {
        const appointmentData = appointmentGenerator
            .next()
            .value(dentistId, clinicId);
        const headers = SETTINGS.REQUEST_HEADERS;
        await axios.post(SETTINGS.CREATE_APPOINTMENT_ENDPOINT, appointmentData, {
            headers,
        });
        const duration = Date.now() - startTime;
        return { success: true, duration };
    } catch (error) {
        return { success: false, error };
    }
}
