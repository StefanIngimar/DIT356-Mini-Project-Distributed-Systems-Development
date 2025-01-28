<script lang="js">
import DentistProfileBox from "../dentist/DentistProfileBox.vue";

export default {
    components: {
        DentistProfileBox,
    },
    emits: ["bookingCanceled", "bookAppointment"],
    props: {
        dentist: {
            type: Object,
            required: true,
        },
        timeSlot: {
            type: Object,
            required: true,
        },
    },
    methods: {
        formatDate(date) {
            return new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).format(new Date(date));
        },
    },
};
</script>

<template>
    <div
        class="p-6 w-full flex flex-col items-center border border-gray-200 rounded-lg shadow-lg bg-white"
    >
        <h1 class="text-2xl font-bold text-gray-800 mb-6">
            Appointment Booking
        </h1>

        <div
            class="flex flex-col sm:flex-row gap-6 w-full justify-center items-center mb-6"
        >
            <div class="flex justify-center sm:justify-end">
                <DentistProfileBox :dentist="dentist" />
            </div>

            <div class="flex flex-col items-center sm:items-start">
                <p class="text-lg font-semibold text-gray-700 mb-1">
                    {{ formatDate(timeSlot.date) }}
                </p>
                <div
                    class="text-sm flex flex-row w-full justify-evenly py-1 px-2 rounded bg-blue-100 text-blue-600"
                >
                    {{ timeSlot.start_time }}
                </div>
            </div>
        </div>

        <div class="w-full flex flex-row justify-between gap-4">
            <button
                class="px-4 py-2 w-24 text-sm bg-gray-200 text-gray-700 rounded-md shadow-sm transition duration-150 hover:bg-gray-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                @click="$emit('bookingCanceled')"
            >
                Cancel
            </button>
            <button
                class="px-4 py-2 w-24 text-sm bg-blue-500 text-white rounded-md shadow-sm transition duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                @click="$emit('bookAppointment', this.timeSlot.appointmentId)"
            >
                Book
            </button>
        </div>
    </div>
</template>
