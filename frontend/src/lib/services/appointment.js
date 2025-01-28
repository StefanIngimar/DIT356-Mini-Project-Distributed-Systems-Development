import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const appointmentService = () => {
    return {
        getAppointmentByDentist: async (dentistId) => {
        try {
            const response = await api.get(`appointments/dentist/${dentistId}`);
            return prepareResponse(false, response.data);
        } catch (error) {
            return prepareResponse(true, error);
        }
        },
        getAppointmentByID: async (appointmentId) => {
        try {
            const response = await api.get(`appointments/${appointmentId}`);
            return prepareResponse(false, response.data);
        } catch (error) {
            return prepareResponse(true, error);
        }
        },
        getAllAppointments: async () => {
        try {
            const response = await api.get(`appointments`);
            return prepareResponse(false, response.data);
        } catch (error) {
            return prepareResponse(true, error);
        }
        },
        addAppointment: async (availabilityData) => {
        try {
            const response = await api.post(`/appointments`, availabilityData
            );
            return prepareResponse(false, response.data);
        } catch (error) {
            return prepareResponse(true, error);
        }
        },
        getDentistWithClinic: async (dentistId) => {
        try {
            const response = await api.get(`dentists/${dentistId}/clinics`);
            return prepareResponse(false, response.data);
        } catch (error) {
            return prepareResponse(true, error);
        }
        },
        getDentistByUserId: async (userId) => {
            try {
                const response = await api.get(`dentists/users/${userId}`);
                return prepareResponse(false, response.data);
            } catch (error) {
                return prepareResponse(true, error);
            }
        },
        changeAppointmentStatus: async (appointmentId, appointmentData) => {
            try {
                const response = await api.patch(`appointments/${appointmentId}`, appointmentData);
                return prepareResponse(false, response.data);
            } catch (error) {
                return prepareResponse(true, error);
            }
        },
        deleteAppointment: async (appointmentId) => {
            try {
                const response = await api.delete(`appointments/${appointmentId}`);
                return prepareResponse(false, response.data);
            } catch (error) {
                return prepareResponse(true, error);
            }
        },
    };
    };

export default appointmentService();