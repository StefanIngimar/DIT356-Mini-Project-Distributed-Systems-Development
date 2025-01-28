import { defineStore } from "pinia";
import { generateRandomId } from "../utils/identifier";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        displayDurationMs: 5000,
        notifications: [],
    }),
    actions: {
        addNotification(notification) {
            const newNotification = {id: generateRandomId(), ...notification};
            this.notifications.push(newNotification);
            setTimeout(() => this.removeNotification(newNotification.id), this.displayDurationMs);
        },
        removeNotification(notificationId) {
            this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
        }
    }
})