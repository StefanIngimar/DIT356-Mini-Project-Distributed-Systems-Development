import { api } from "@/lib/api/client";

const dashboardService = () => {
  return {
    getClinics: async () => {
      try {
        const response = await api.get("/clinics");

        return response.data;
      } catch (error) {
        return error;
      }
    },

    getClinicsById: async (id) => {
        try {
            const response = await api.get(`/clinics/${id}`);

            return response.data;
        } catch (error) {
            return error;
        }
        },

    getDentists: async () => {
        try {
            const response = await api.get("/dentists");
    
            return response.data;
        } catch (error) {
            return error;
        }
        },

    getDentistWithClinic: async (id) => {
        try {
            const response = await api.get(`/dentists/${id}/clinics`);
    
            return response.data;
        } catch (error) {
            return error;
        }
        },

    getBookings: async () => {
        try {
            const response = await api.get("/bookings");
    
            return response.data;
        } catch (error) {
            return error;
        }
        },
    
    getAppointments: async () => {
        try {
            const response = await api.get("/appointments");
    
            return response.data;
        } catch (error) {
            return error;
        }
        }
  };
}

export default dashboardService();