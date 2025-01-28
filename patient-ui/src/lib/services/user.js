import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

const userService = () => {
    return {
        register: async (firstName, lastName, email, password) => {
            try {
                const response = await api.post("/users", {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    role: "patient",
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
        getPreferences: async () => {
            try {
                const response = await api.get(
                    `/users/${localStorage.getItem("userId")}/preferences`,
                );

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not get user preferences");
            }
        },
        addPreference: async (startDate, endDate, daysOfWeek, timeSlots) => {
            try {
                const response = await api.post(
                    `/users/${localStorage.getItem("userId")}/preferences`,
                    {
                        start_date: startDate,
                        end_date: endDate,
                        is_active: true,
                        days_of_week: daysOfWeek,
                        time_slots: timeSlots.map((timeSlot) => ({
                            start_time: timeSlot,
                        })),
                    },
                );

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not add user preferences");
            }
        },
        removePreference: async (preferenceId) => {
            try {
                const response = await api.delete(
                    `/users/${localStorage.getItem("userId")}/preferences/${preferenceId}`,
                );

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(
                    true,
                    "Could not delete user preferences",
                );
            }
        },
    };
};

export default userService();
