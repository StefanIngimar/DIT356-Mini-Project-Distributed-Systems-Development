import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

import { stringifyQuery } from "vue-router";

const dentistClinicService = () => {
    return {
        getClinics: async (queryParams) => {
            try {
                let endpoint = "/clinics"
                if (queryParams !== null) {
                    endpoint += `?${stringifyQuery(queryParams)}`
                }

                const response = await api.get(endpoint);

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not get clinics data");
            }
        },
        getClinicDentistsWithTheirAppointmentSlots: async (clinicId) => {
            try {
                const response = await api.get(`/clinics/${clinicId}/dentists/appointments`);

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not get dentists appointments data for a clinic");
            }
        },
    };
};

export default dentistClinicService();
