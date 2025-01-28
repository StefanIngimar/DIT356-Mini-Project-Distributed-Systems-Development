import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const dentistClinicService = () => {
  return {
    getClinics: async () => {
      try {
        const response = await api.get("/clinics");

        return prepareResponse(false, response.data);
      } catch (error) {
        if (error.response && error.response.data) {
          return prepareResponse(true, error.response.data.message);
        }

        return prepareResponse(true, "Could not get clinics data");
      }
    },
    getDentistsForClinic: async (clinicId) => {
      try {
        const response = await api.get(`clinics/${clinicId}/dentists/`);
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
    addClinic: async (clinicData) => {
      try {
        const response = await api.post("clinics", clinicData);
        return prepareResponse(false, response.data);
      } catch (error) {
        return prepareResponse(true, error);
      }
    },
    addDentistToClinic: async (clinicId, dentistData) => {
      try {
        const response = await api.post(
          `clinics/${clinicId}/dentists`,
          dentistData
        );
        return prepareResponse(false, response.data);
      } catch (error) {
        if (error.response && error.response.data) {
          return prepareResponse(true, error.response.data.message);
        }

        return prepareResponse(true, "Could not add dentists to a clinic");
      }
    },
  };
};

export default dentistClinicService();
