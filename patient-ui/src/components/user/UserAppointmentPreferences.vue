<script lang="js">
import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue";

import UserAppointmentPreferenceCard from "./UserAppointmentPreferenceCard.vue";

export default {
    components: {
        ErrorAlert,
        SuccessAlert,
        UserAppointmentPreferenceCard,
    },
    emits: ["deleteUserPreference"],
    props: {
        preferences: {
            type: Array,
            required: true,
        },
        error: {
            type: [String, undefined],
            default: undefined,
        },
        success: {
            type: [String, undefined],
            default: undefined,
        },
    },
    methods: {
        propagateDeleteUserPreference(userPreferenceId) {
            this.$emit("deleteUserPreference", userPreferenceId);
        },
    },
};
</script>

<template>
    <div
        v-if="preferences && preferences.length"
        class="px-2 flex flex-col gap-2 h-full"
    >
        <div class="pb-2" v-if="error || success">
            <transition name="slide-up">
                <ErrorAlert v-if="error" :message="error" :withHeader="false" />
            </transition>
            <transition name="slide-up">
                <SuccessAlert
                    v-if="success"
                    :message="success"
                    :withHeader="false"
                />
            </transition>
        </div>
        <div
            v-for="(preference, index) in preferences"
            :key="index"
            class="p-4 bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition-shadow"
        >
            <transition name="slide-down">
                <UserAppointmentPreferenceCard
                    :preference="preference"
                    @deleteUserPreference="propagateDeleteUserPreference"
                />
            </transition>
        </div>
    </div>

    <div v-else class="text-center text-gray-500 text-sm">
        No preferences added yet
    </div>
</template>

<style lang="css" scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

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
