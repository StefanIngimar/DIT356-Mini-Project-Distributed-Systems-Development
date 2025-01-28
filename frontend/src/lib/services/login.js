import Cookies from "js-cookie";

import { api } from "../api/client";
import { prepareResponse } from "../api/utils";
import { decodeJwt, updateLocalStorageWithCurrentDentistData } from "../auth/jwt";

import dentistService from "./dentist";

const loginService = () => {
  return {
    login: async (email, password) => {
      try {
        const response = await api.post("/login", {
          email,
          password,
        });

        if (response.data === null || response.data.token === null) {
          return prepareResponse(true, "Token not found in the response");
        }

        const { payload } = decodeJwt(response.data.token);
        if (payload.role === null || payload.role.toLowerCase() !== "dentist") {
          return prepareResponse(true, "Unauthorized");
        }

        const currentDentistUserResponse = await dentistService.getDentistFromUserId(payload.sub);
        if (currentDentistUserResponse.hasError) {
          return prepareResponse(true, currentDentistUserResponse.content);
        }

        updateLocalStorageWithCurrentDentistData(payload, currentDentistUserResponse.content);

        Cookies.set("jwtToken", response.data.token, { expires: 1 });

        return prepareResponse(false, response.data);
      } catch (error) {
        if (error.response && error.response.data) {
          return prepareResponse(true, error.response.data.message);
        }

        return prepareResponse(true, "Could not login the user");
      }
    },
  };
};

export default loginService();
