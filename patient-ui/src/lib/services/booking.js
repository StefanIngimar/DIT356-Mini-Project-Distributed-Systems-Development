import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const bookingService = () => {
  return {
    getBookings: async (patientId) => {
      try {
        const response = await api.get(`bookings?search=patient:${patientId}`);
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
    getBooking: async (bookingId) => {
      try {
        const response = await api.get(`bookings/${bookingId}`);
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
    cancelBooking: async (bookingId) => {
      try {
        const response = await api.delete(`bookings/${bookingId}`);
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
    addBooking: async (timeslotId, patientId) => {
      try {
        const response = await api.post(`bookings`, {
          timeslot: timeslotId,
          patient: patientId,
        });
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
  };
};

export default bookingService();
