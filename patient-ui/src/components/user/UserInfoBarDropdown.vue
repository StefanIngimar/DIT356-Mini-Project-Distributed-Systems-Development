<script lang="js">
import { removeTokenFromCookie } from "@/lib/auth/jwt.js";

export default {
    props: {
        isDropdownOpen: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["closeDropdown"],
    methods: {
        openUserPreferencesModal() {
            this.$emit("closeDropdown");
            this.emitter.emit("openUserPreferencesModal");
        },
        logout() {
            removeTokenFromCookie();
            this.$router.replace("/");
        },
    },
};
</script>

<template>
    <transition name="slide-down">
        <div
            v-if="isDropdownOpen"
            class="absolute right-1 top-[65px] z-50 min-w-[225px] bg-white shadow-lg border border-gray-200 rounded-md text-sm text-gray-700"
        >
            <div class="flex flex-col gap-1 p-2">
                <button
                    class="p-3 w-full text-left rounded-md border border-gray-100 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    @click="openUserPreferencesModal"
                >
                    Preferences
                </button>
                <button
                    class="p-3 w-full text-left rounded-md border border-gray-100 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    @click="logout"
                >
                    Log Out
                </button>
            </div>
        </div>
    </transition>
</template>

<style lang="css" scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease-out;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-30px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-30px);
}
</style>
