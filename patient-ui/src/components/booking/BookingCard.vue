<script lang="js">
import BookingStatusPill from './BookingStatusPill.vue';
import DentistProfileBox from '../dentist/DentistProfileBox.vue';

export default {
    components: {
        BookingStatusPill,
        DentistProfileBox,
    },
    props: {
        booking: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            showConfirmation: false,
        }
    },
    methods: {
        cancelBooking(id) {
            this.$emit("cancel-booking", id);
        },
        toggleShowConfirmation() {
            this.showConfirmation = !this.showConfirmation;
        }
    },
};
</script>

<template>
    <div class="w-full flex flex-col sm:flex-row justify-between border rounded-lg p-4 bg-white shadow-sm">
        <div class="w-full">
            <div class="flex flex-row justify-between items-center mb-4 relative">
                <DentistProfileBox :dentist="booking.timeslot.dentistId" />
                <div class="relative flex flex-row gap-2 items-center">
                    <transition name="fade-scale">
                        <div v-if="showConfirmation" class="flex flex-row gap-2 absolute right-0">
                            <button
                                class="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                @click="cancelBooking(booking._id)">
                                Confirm
                            </button>
                            <button
                                class="px-4 py-2 text-xs font-medium text-white bg-gray-500 rounded hover:bg-gray-600 transition"
                                @click="showConfirmation = false">
                                Back
                            </button>
                        </div>
                        <button v-else
                            class="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                            @click="toggleShowConfirmation">
                            Cancel
                        </button>
                    </transition>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row mb-4 text-sm text-gray-700">
                <div class="w-full">
                    <p class="font-medium text-gray-500">Clinic:</p>
                    <p class="text-gray-700">
                        {{ booking.timeslot.clinicId?.name || "-" }}
                    </p>
                    <p class="text-gray-700 text-sm">
                        {{ booking.timeslot.clinicId.address.street || "-" }},
                        {{ booking.timeslot.clinicId.address.postal_code || "-" }}
                        {{ booking.timeslot.clinicId.address.city || "-" }}
                    </p>
                </div>
            </div>
            <div class="flex flex-row sm:justify-between text-sm text-gray-700">
                <div class="w-1/3">
                    <BookingStatusPill :status="booking.status" />
                </div>
                <div class="w-1/3">
                    <p class="font-medium text-gray-500">Start Time:</p>
                    <p class="inline-block py-1 px-3 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                        {{ booking.timeslot?.start_time || "-" }}
                    </p>
                </div>
                <div class="w-1/3">
                    <p class="font-medium text-gray-500">Date:</p>
                    <p class="inline-block py-1 px-3 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                        {{ booking.timeslot?.date.substring(0, 10) || "-" }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>