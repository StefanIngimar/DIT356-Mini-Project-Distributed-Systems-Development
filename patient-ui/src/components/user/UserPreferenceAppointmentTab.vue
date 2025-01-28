<script lang="js">
import userService from "@/lib/services/user.js";

import UserPreferenceAppointmentForm from "@/components/user/UserPreferenceAppointmentForm.vue";
import UserAppointmentPreferences from "./UserAppointmentPreferences.vue";
import InfoIcon from "@/components/icons/InfoIcon.vue";

export default {
    components: {
        UserPreferenceAppointmentForm,
        UserAppointmentPreferences,
        InfoIcon,
    },
    data() {
        return {
            formError: undefined,
            formSuccess: undefined,
            deleteError: undefined,
            deleteSuccess: undefined,
            isTooltipOpen: false,
            preferences: [],
            selectedTab: "new",
            slideDirection: 'slide-right',
        };
    },
    async mounted() {
        await this.getUserPreferences();
    },
    methods: {
        showTooltip() {
            this.isTooltipOpen = true;
        },
        hideTooltip() {
            this.isTooltipOpen = false;
        },
        resetAlerts() {
            this.formError = undefined;
            this.formSuccess = undefined;
            this.deleteError = undefined;
            this.deleteSuccess = undefined;
        },
        switchTab(tab) {
            this.slideDirection =
                tab === 'new' && this.selectedTab === 'existing'
                    ? 'slide-left'
                    : 'slide-right';

            this.previousTab = this.selectedTab;
            this.selectedTab = tab;
        },
        async getUserPreferences() {
            const response = await userService.getPreferences();
            if (response.hasError) {
                this.formError = response.content;
            } else {
                this.preferences = response.content;
            }
        },
        async addUserPreference(form) {
            this.resetAlerts();

            if (form.daysOfWeek.length === 0) {
                this.formError =
                    "You need to specify at least one preferred day of week";
                return;
            }
            if (form.timeSlots.length === 0) {
                this.formError =
                    "You need to specify at least one preferred time slot";
                return;
            }
            if (form.startDate > form.endDate) {
                this.formError = "Start date has to be before end date";
                return;
            }

            const response = await userService.addPreference(
                form.startDate,
                form.endDate,
                form.daysOfWeek,
                form.timeSlots,
            );

            if (response.hasError) {
                this.formError = response.content;
            } else {
                this.formSuccess = "New appointment preference added";
                this.preferences = [response.content, ...this.preferences];
            }

            form.startDate = undefined;
            form.endDate = undefined;
            form.daysOfWeek = [];
            form.timeSlots = [];
        },
        async deleteUserPreference(preferenceId) {
            this.resetAlerts();

            const response = userService.removePreference(preferenceId);

            if (response.hasError) {
                this.deleteError = response.content;
            } else {
                this.deleteSuccess = "Preference removed";
                this.preferences = this.preferences.filter(
                    (preference) => preference.id !== preferenceId,
                );
            }
        },
    },
};
</script>

<template>
    <div class="mb-4 h-[350px] overflow-auto relative">
        <div class="flex border-b border-gray-200">
            <div class="py-2 px-4 cursor-pointer text-xs" :class="{
                'border-b-2 border-blue-500 font-semibold': selectedTab === 'new',
                'text-gray-500 border-b-2 border-gray-300': selectedTab !== 'new',
            }" @click="switchTab('new')">
                Add Preference
            </div>
            <div class="py-2 px-4 cursor-pointer text-xs" :class="{
                'border-b-2 border-blue-500 font-semibold':
                    selectedTab === 'existing',
                'text-gray-500 border-b-2 border-gray-300':
                    selectedTab !== 'existing',
            }" @click="switchTab('existing')">
                Preferences
            </div>
        </div>

        <transition :name="slideDirection" mode="out-in">
            <div :key="selectedTab" class="absolute w-full">
                <div v-if="selectedTab === 'new'" class="py-4 h-[250px]">
                    <div class="relative mb-4 flex flex-row items-center">
                        <p class="text-sm font-semibold">New Appointment Preference</p>
                        <div class="px-2 text-blue-500 cursor-pointer" @mouseenter="showTooltip"
                            @mouseleave="hideTooltip">
                            <InfoIcon fill="currentColor" />
                        </div>
                        <transition name="slide-down">
                            <div v-if="isTooltipOpen"
                                class="p-2 absolute top-6 bg-white border border-gray-200 z-50 shadow-lg rounded text-sm text-gray-500">
                                <p>
                                    Indicate your preferred appointment time slots to receive
                                    notifications when a matching slot becomes available.
                                </p>
                            </div>
                        </transition>
                    </div>

                    <div class="flex flex-col justify-center h-full">
                        <UserPreferenceAppointmentForm :error="formError" :success="formSuccess"
                            @addUserPreference="addUserPreference" />
                    </div>
                </div>

                <div v-if="selectedTab === 'existing'" class="py-4">
                    <p class="mb-4 text-sm font-semibold">
                        Your Appointment Preferences (#{{ preferences.length }})
                    </p>
                    <UserAppointmentPreferences :preferences="preferences" :error="deleteError" :success="deleteSuccess"
                        @deleteUserPreference="deleteUserPreference" />
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="css" scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease-out;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
    transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 200ms ease-in-out;
}

.slide-right-enter,
.slide-left-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.slide-right-leave-to,
.slide-left-enter {
    transform: translateX(-100%);
    opacity: 0;
}

.slide-right-leave-active,
.slide-left-leave-active {
    position: absolute;
    width: 100%;
}
</style>