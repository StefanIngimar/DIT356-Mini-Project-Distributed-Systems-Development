import { api } from "@/lib/api/client";
import { prepareResponse } from "@/lib/api/utils";

import { stringifyQuery } from "vue-router";

const notificationService = () => {
    return {
        getUserNotifications: async () => {
            try {
                const userId = localStorage.getItem("userId");
                const queryParams = {
                    status: "unread"
                }
                const response = await api.get(`/notifications/${userId}?${stringifyQuery(queryParams)}`);

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not get user notifications");
            }
        },
        markNotificationAsRead: async (notificationId) => {
            try {
                const response = await api.put(`/notifications/${notificationId}`);

                return prepareResponse(false, response.data);
            } catch (error) {
                if (error.response && error.response.data) {
                    return prepareResponse(true, error.response.data.message);
                }

                return prepareResponse(true, "Could not mark notification as read");
            }
        },
    }
}

export default notificationService();