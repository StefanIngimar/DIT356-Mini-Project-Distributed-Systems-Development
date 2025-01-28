<script lang="js">
import notificationService from "@/lib/services/notification.js"

import NotificationDropdownElement from "./NotificationDropdownElement.vue";

import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

export default {
    components: {
        NotificationDropdownElement,
        ErrorAlert,
        SuccessAlert,
    },
    data() {
        return {
            isOpen: false,
            error: null,
            success: null,
            notifications: [],
        }
    },
    async mounted() {
        this.emitter.on("toggleNotificationDropdown", async () => {
            this.resetAlerts();
            this.isOpen = !this.isOpen;
            await this.getUserNotifications();
        });

        await this.getUserNotifications();
    },
    beforeUnmount() {
        this.emitter.off("toggleNotificationDropdown");
    },
    methods: {
        resetAlerts() {
            this.error = null;
            this.success = null;
        },
        async getUserNotifications() {
            const response = await notificationService.getUserNotifications();
            if (response.hasError) {
                this.error = response.content;
            } else {
                this.notifications = response.content;

                if (this.notifications.length) {
                    this.emitter.emit("userHasNotifications");
                }
            }
        },
        async markNotificationAsRead(notificationId) {
            const response = await notificationService.markNotificationAsRead(notificationId);
            if (response.hasError) {
                this.error = response.content;
            } else {
                this.success = "Notification marked as read";
                this.notifications = this.notifications.filter((notification) => notification.id !== notificationId);

                if (!this.notifications.length) {
                    this.emitter.emit("userHasNoNotifications");
                }
            }
        }
    }
}
</script>

<template>
    <transition name="slide-down">
        <div v-if="isOpen"
            class="absolute left-[75px] top-[65px] z-50 min-w-[225px] max-h-[325px] bg-white shadow-lg border border-gray-200 rounded-md text-sm text-gray-700 overflow-scroll">
            <transition name="alert-slide">
                <div v-if="this.error || this.success" class="p-2 pb-0">
                    <ErrorAlert v-if="this.error" :message="this.error" :withHeader="false" pClass="text-xs" />
                    <SuccessAlert v-if="this.success" :message="this.success" :withHeader="false" pClass="text-xs" />
                </div>
            </transition>
            <div class="flex flex-col gap-1 p-2">
                <div v-if="this.notifications.length" v-for="notification in this.notifications" :key="notification.id">
                    <NotificationDropdownElement :notification="notification" @markAsRead="markNotificationAsRead" />
                </div>
                <div v-else class="py-2 text-center text-gray-400 font-semibold text-xs">
                    <p>No unread notifications</p>
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="css" scoped>
.slide-down-enter-active {
    transition: all 0.2s ease-in;
}

.slide-down-leave-active {
    transition: all 0.1s ease-out;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.2s ease-out;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>