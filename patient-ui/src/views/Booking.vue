<script lang="js">
import bookingService from '@/lib/services/booking';
import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue";

export default {
    components: {
      ErrorAlert,
      SuccessAlert,
    },
    data() {
      return {
        isLoading: false,
        bookings: [],
        canceledBooking: {},
        errMessage: undefined, 
        successMessage: undefined, 
      }
    },
    computed: {
      patientId() {
        return localStorage.getItem('userId')
      }
    },
    methods: {
      async fetchBookings(patientId) {
        this.isLoading = true
        const { hasError, content } = await bookingService.getBookings(patientId)
        if (hasError) {
          this.resetMessagesState()
          this.errMessage = content.message
        } else {
          this.bookings = Array.isArray(content.bookings) ? content.bookings : [content]
        }
        this.isLoading = false
      },
      async cancelBooking(bookingId) {
        if (confirm('Do you really want to cancel your booking?')) {
          this.isLoading = true
          const { hasError, content } = await bookingService.cancelBooking(bookingId)
          if (hasError) {
            this.resetMessagesState()
            this.errMessage = content.message
          } else {
            this.canceledBooking = content
            this.resetMessagesState()
            this.successMessage = 'Booking successfully canceled'
            this.fetchBookings(this.patientId)
          }
          this.isLoading = false
        }
      },
      resetMessagesState() {
        this.errMessage = undefined
        this.successMessage = undefined
      },
    },
    async mounted() {
      await this.fetchBookings(this.patientId)
    },
}
</script>

<template>
  <div class="w-full">
    <div v-if="errMessage || successMessage" class="pb-8 w-full flex flex-col gap-2">
      <ErrorAlert v-if="errMessage" :withHeader="false" :message="errMessage" />
      <SuccessAlert v-if="successMessage" :withHeader="false" :message="successMessage" />
    </div>
    <div v-if="isLoading">Loading</div>
    <div v-else class="p-6 relative overflow-x-auto">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3">Dentist</th>
            <th scope="col" class="px-6 py-3">Clinic</th>
            <th scope="col" class="px-6 py-3">Status</th>
            <th scope="col" class="px-6 py-3">Date</th>
            <th scope="col" class="px-6 py-3">Start Time</th>
            <th scope="col" class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" class="bg-white border-b">
            <td class="px-6 py-4">
              {{ booking.timeslot.dentistId?.first_name || "-" }} {{ booking.timeslot.dentistId?.last_name }}
            </td>
            <td class="px-6 py-4">{{ booking.timeslot.clinicId?.name || "-" }}</td>
            <td class="px-6 py-4">{{ booking.status || "-" }}</td>
            <td class="px-6 py-4">{{ booking.timeslot?.date.substring(0, 10) || "-" }}</td>
            <td class="px-6 py-4">{{ booking.timeslot?.start_time || "-" }}</td>
            <td class="px-6 py-4">
              <button type="button" @click="cancelBooking(booking._id)">Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
