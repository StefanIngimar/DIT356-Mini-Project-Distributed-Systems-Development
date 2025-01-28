<script lang="js">
import bookingService from "@/lib/services/booking.js";

import BookingPanel from "./BookingPanel.vue";
import AppointmentCalendar from "./AppointmentCalendar.vue";

import ErrorAlert from "@/components/alert/ErrorAlert.vue"
import SuccessAlert from "@/components/alert/SuccessAlert.vue"
import LoadingSpinner from "@/components/core/LoadingSpinner.vue"

export default {
    components: {
        AppointmentCalendar,
        BookingPanel,
        ErrorAlert,
        SuccessAlert,
        LoadingSpinner,
    },
    emits: ["refreshClinicDentists"],
    data() {
        return {
            isLoading: true,
            error: null,
            success: null,
            currentlyBooking: {
                dentist: undefined,
                timeSlot: undefined,
            },
        };
    },
    props: {
        dentists: {
            type: Array,
            required: true,
        },
    },
    methods: {
        resetAlerts() {
            this.error = null;
            this.success = null;
        },
        showBookingPanel(dentist, timeSlot) {
            this.currentlyBooking = {
                dentist: dentist,
                timeSlot: timeSlot,
            };
        },
        async bookSelectedAppointment(appointmentId) {
            this.resetAlerts();
            this.closeBookingPanel();

            this.isLoading = true;

            const patientId = localStorage.getItem("userId")
            if (patientId === null || patientId === undefined) {
                this.error = "Patient ID was not found";
                return
            }

            const response = await bookingService.addBooking(appointmentId, patientId)
            if (response.hasError) {
                this.error = response.content;
            } else {
                this.success = "Appointment booked!"
                this.$emit("refreshClinicDentists");
            }

            this.isLoading = false;
        },
        closeBookingPanel() {
            this.currentlyBooking = {
                dentist: undefined,
                timeSlot: undefined,
            };
        },
    },
    computed: {
        isCurrentlyBooking() {
            return (
                this.currentlyBooking.dentist !== undefined &&
                this.currentlyBooking.timeSlot !== undefined
            );
        },
    },
};
</script>

<template>
  <div class="py-2">
    <transition name="slide-up" mode="out-in">
      <template v-if="isCurrentlyBooking">
        <BookingPanel
          :dentist="this.currentlyBooking.dentist"
          :timeSlot="this.currentlyBooking.timeSlot"
          @bookingCanceled="closeBookingPanel"
          @bookAppointment="bookSelectedAppointment"
        />
      </template>

      <template v-else>
        <div>
          <p class="text-sm text-gray-500 font-medium mb-2">
            Available Appointment Slots
          </p>

          <transition name="alert-slide">
            <div v-if="this.error || this.success" class="pb-3 px-1">
              <ErrorAlert
                v-if="this.error"
                :message="this.error"
                :withHeader="false"
              />
              <SuccessAlert
                v-if="this.success"
                :message="this.success"
                :withHeader="false"
              />
            </div>
          </transition>

          <div class="flex flex-col gap-2">
            <div
              v-for="dentist in dentists"
              :key="dentist.id"
              class="p-4 border-[1px] border-gray-200 rounded shadow"
            >
              <AppointmentCalendar
                :dentist="dentist"
                @bookAppointment="showBookingPanel"
              />
            </div>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<style lang="css" scoped>
.slide-up-enter-active {
  transition: all 0.2s ease-out;
}

.slide-up-leave-active {
  transition: all 0.1s ease-in;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
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
