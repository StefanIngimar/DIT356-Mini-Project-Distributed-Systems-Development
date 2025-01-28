import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const bookingService = {
  getBookingsByDentist: async (dentistId) => {
    try {
      const response = await api.get(`bookings/dentist/${dentistId}`);
      return prepareResponse(false, response.data);
    } catch (error) {
      return prepareResponse(true, error);
    }
  },
  acceptBooking: async (bookingId, bookingData) => {
    try {
      const response = await api.patch(`bookings/${bookingId}`, bookingData);
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
  }
};

export default bookingService;
