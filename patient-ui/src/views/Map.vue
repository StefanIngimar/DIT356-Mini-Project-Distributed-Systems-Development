<script setup lang="js">
import { onMounted, onUnmounted, getCurrentInstance } from "vue";

import { useNotificationStore } from "@/lib/store/notification";

import Map from "@/components/map/Map.vue"
import WS from "@/lib/ws/client.js";

const notificationStore = useNotificationStore();

let ws = null;
let emitter = null;


function connectToWebSocket() {
    const userId = localStorage.getItem("userId");
    const wsUrl = import.meta.env.VITE_API_WS_ENDPOINT || `ws://localhost:3000/api/v1/ws?user=${userId}`;

    ws = new WS(wsUrl);
    ws.onmessage = (event) => {
        let jsonEvent;
        try {
            jsonEvent = JSON.parse(event);
        } catch (err) {
            console.error("Could not parse event to json");
            return
        }

        if (jsonEvent.event && jsonEvent.event === "notification") {
            const notificationMessages = jsonEvent.data.map((msg) => ({
                title: "Available Time Slots",
                message: msg,
            }));
            
            if (emitter) {
                emitter.emit("userHasNotifications");
            }

            notificationMessages.forEach((msg) => {
                notificationStore.addNotification(msg);
            });
        }
    }
}

onMounted(() => {
    const instance = getCurrentInstance();
    emitter = instance?.proxy?.emitter;

    connectToWebSocket();
});

onUnmounted(() => {
    if (ws) {
        ws.close();
        ws = null;
    }
});
</script>

<template>
    <Map />
</template>
