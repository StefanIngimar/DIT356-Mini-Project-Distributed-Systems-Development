import { api } from "../api/client";
import { prepareResponse } from "../api/utils";

const dentistService = () => {
  return {
    getDentistFromUserId: async (userId) => {
      try {
        const response = await api.get(`/dentists/users/${userId}`);

        return prepareResponse(false, response.data);
      } catch (error) {
        if (error.response && error.response.data) {
          return prepareResponse(true, error.response.data.message);
        }

        return prepareResponse(true, "Could not get dentist from user ID");
      }
    },
  };
};

export default dentistService();