<script lang="js">
import NotificationBellIcon from "@/components/icons/NotificationBellIcon.vue"

export default {
    components: { NotificationBellIcon },
    data() {
        return {
            hasNotifications: false,
        }
    },
    mounted() {
        this.emitter.on("userHasNotifications", () => {
            this.hasNotifications = true;
        });

        this.emitter.on("userHasNoNotifications", () => {
            this.hasNotifications = false;
        })
    },
    unmounted() {
        this.emitter.off("userHasNotifications");
        this.emitter.off("userHasNoNotifications");
    },
    methods: {
        toggleNotificationDropdown() {
            this.emitter.emit("toggleNotificationDropdown");
        }
    }
}
</script>

<template>
    <button @click="toggleNotificationDropdown" class="relative flex items-center justify-center w-[40px] h-[40px] p-2 border border-gray-200 rounded-lg shadow text-gray-500 hover:bg-gray-100 transform transition-transform duration-100">
        <transition name="slide-up">
            <span v-if="hasNotifications" class="absolute bg-blue-500 top-[-3px] right-[-3px] w-3 h-3 rounded-full"></span>
        </transition>
        <NotificationBellIcon width="17" height="17" fill="currentColor" />
    </button>
</template>

<style lang="css" scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.2s ease-out;
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(5px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}
</style>