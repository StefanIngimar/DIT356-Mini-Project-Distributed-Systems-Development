<script lang="js">
import LabeledInput from "@/components/form/LabeledInput.vue";
import MultiselectCheckboxForm from "@/components/form/MultiselectCheckboxForm.vue";

import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue";

export default {
    components: {
        LabeledInput,
        ErrorAlert,
        SuccessAlert,
        MultiselectCheckboxForm,
    },
    emits: ["addUserPreference"],
    props: {
        error: {
            type: [String, undefined],
            default: undefined,
        },
        success: {
            type: [String, undefined],
            default: undefined,
        },
    },
    data() {
        return {
            appointmentPreference: {
                startDate: undefined,
                endDate: undefined,
                daysOfWeek: [],
                timeSlots: [],
            },
            daysOfWeek: [
                { value: "monday", name: "Monday" },
                { value: "tuesday", name: "Tuesday" },
                { value: "wednesday", name: "Wednesday" },
                { value: "thursday", name: "Thursday" },
                { value: "friday", name: "Friday" },
                { value: "saturday", name: "Saturday" },
                { value: "sunday", name: "Sunday" },
            ],
            timeSlots: [
                { value: "7:00", name: "7:00" },
                { value: "8:00", name: "8:00" },
                { value: "9:00", name: "9:00" },
                { value: "10:00", name: "10:00" },
                { value: "11:00", name: "11:00" },
                { value: "12:00", name: "12:00" },
                { value: "13:00", name: "13:00" },
                { value: "14:00", name: "14:00" },
                { value: "15:00", name: "15:00" },
                { value: "16:00", name: "16:00" },
                { value: "17:00", name: "17:00" },
                { value: "18:00", name: "18:00" },
                { value: "19:00", name: "19:00" },
                { value: "20:00", name: "20:00" },
                { value: "21:00", name: "21:00" },
                { value: "22:00", name: "22:00" },
                { value: "23:00", name: "23:00" },
            ],
        };
    },
};
</script>

<template>
    <div>
        <div class="pb-2">
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
        <form
            @submit.prevent="$emit('addUserPreference', appointmentPreference)"
        >
            <div class="mb-3 w-full flex flex-row gap-2">
                <LabeledInput
                    divClass="w-1/2"
                    inputName="start-date"
                    inputType="date"
                    text="Start Date"
                    :isRequired="true"
                    v-model="appointmentPreference.startDate"
                />
                <LabeledInput
                    divClass="w-1/2"
                    inputName="end-date"
                    inputType="date"
                    text="End Date"
                    :isRequired="true"
                    v-model="appointmentPreference.endDate"
                />
            </div>
            <div class="mb-3 w-full flex flex-row gap-2">
                <MultiselectCheckboxForm
                    divClass="w-1/2"
                    selectedValueClass="bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium"
                    dropdownReference="days-of-week"
                    dropdownTitle="Days Of Week"
                    :dropdownOptions="daysOfWeek"
                    v-model="appointmentPreference.daysOfWeek"
                />
                <MultiselectCheckboxForm
                    divClass="w-1/2"
                    selectedValueClass="bg-green-100 text-green-600 rounded-full text-xs font-medium"
                    dropdownReference="time-slots"
                    dropdownTitle="Time Slots"
                    :dropdownOptions="timeSlots"
                    v-model="appointmentPreference.timeSlots"
                />
            </div>
            <div class="w-full flex items-center justify-center">
                <button
                    class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md shadow-sm transition duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Add
                </button>
            </div>
        </form>
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
</style>
