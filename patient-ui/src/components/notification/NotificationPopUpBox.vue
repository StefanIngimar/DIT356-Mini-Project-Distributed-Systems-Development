<script lang="js" setup>
import NotificationPopUp from './NotificationPopUp.vue';

import { useNotificationStore } from '@/lib/store/notification';

const notificationStore = useNotificationStore();

const removeNotification = (id) => {
    notificationStore.removeNotification(id);
}
</script>

<template>
    <div class="fixed bottom-9 right-5 space-y-1 z-50">
        <transition-group name="notification">
            <div v-for="notification in notificationStore.notifications" :key="notification.id">
                <NotificationPopUp :notification="notification" @removeNotificationFromStore="removeNotification" />
            </div>
        </transition-group>
    </div>
</template>

<style lang="css" scoped>
.notification-enter-active {
    transition: all 0.2s ease-in;
    transform: translateY(0);
    opacity: 1;
}

.notification-leave-active {
    transition: all 0.2s ease-out;
    transform: translateY(0);
    opacity: 1;
}

.notification-enter-from {
    transform: translateY(30px);
    opacity: 0;
}

.notification-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>