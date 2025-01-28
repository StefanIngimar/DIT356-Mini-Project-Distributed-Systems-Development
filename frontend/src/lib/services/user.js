import { api } from "../api/client";
import { prepareResponse } from "../api/utils";

const userService = () => {
  return {
    register: async (firstName, lastName, role, email, password) => {
      try {
        const response = await api.post("/users", {
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
          password: password,
        });

        return prepareResponse(false, response.data);
      } catch (error) {
        if (error.response && error.response.data) {
          return prepareResponse(true, error.response.data.message);
        }

        return prepareResponse(true, "Could not register a user");
      }
    },
  };
};

export default userService();
