import Cookies from "js-cookie";

import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const loginService = () => {
    return {
        login: async (email, password) => {
            try {
                const response = await api.post("/login", {
                    email,
                    password,
                });

                Cookies.set("jwtToken", response.data.token, { expires: 1 });

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(
                        true,
                        error.response.data.message ||
                            "Could not login the user",
                    );
                }

                return prepareResponse(true, "Could not login the user");
            }
        },
    };
};

export default loginService();
