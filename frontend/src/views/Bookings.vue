<script>
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import bookingService from '@/lib/services/bookings'
import AppointmentService from "@/lib/services/appointment";
import Cookies from "js-cookie";

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      isModalVisible: false,
      selectedEvent: null,
      calendarOptions: {
        plugins: [ timeGridPlugin, interactionPlugin ],
        initialView: 'timeGridWeek',
        events: [],
        eventClick: this.handleEventClick,
        dayHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit' },//european date format
        locale: 'en-gb',
      },
      isLoading: false,
      error: null,
    };
  },
  methods: {
    closeEventModal() {
      this.isModalVisible = false;
    },
    handleEventClick({ event }) {
      this.selectedEvent = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        status: event.extendedProps.status,
        appointmentId: event.extendedProps.appointmentId,
      }
      this.isModalVisible = true;
    },
    formatTime(date){
      if(!date){
        return null;
      }

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    },
    async fetchDentistID() {
      const token = Cookies.get("jwtToken");
      if(!token){
        this.error = "User is not logged in.";
        console.error("JWT token missing.")
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      try{
        const dentistResponse = await AppointmentService.getDentistByUserId(userId);

        if(dentistResponse.hasError){
          this.error = dentistResponse.error;
          return;
        }

        return dentistResponse.content.id;
      }
      catch(error){
        this.error = error.message;
        console.error("Error fetching dentist ID:", error);
        return;
      }
    },
    async fetchBookings() {
      this.isLoading = true;
      this.error = null;

      try {
        const dentistId = await this.fetchDentistID();
        if (!dentistId) {
          console.error("Dentist ID not found.");
          return;
        }

        const response = await bookingService.getBookingsByDentist(dentistId);
        console.log("API Response:", response);

        if (!response || !response.content || !Array.isArray(response.content.bookings)) {
          console.warn("Invalid or empty bookings data received.");
          this.calendarOptions.events = [];
          return;
        }

        const events = response.content.bookings.map((booking) => {
          const timeslot = booking.timeslot || {};
          const patient = booking.patient || {};

          const start = new Date(timeslot.date);
          start.setHours(timeslot.start_time.split(":")[0]);
          start.setMinutes(timeslot.start_time.split(":")[1]);

          const end = new Date(timeslot.date);
          end.setHours(timeslot.end_time.split(":")[0]);
          end.setMinutes(timeslot.end_time.split(":")[1]);

          return {
            id: booking._id,
            title: `${patient.first_name} ${patient.last_name} - ${booking.status}`,
            //appointmentId: timeslot._id,
            status: booking.status,
            start,
            end,
            extendedProps: {
              appointmentId: timeslot._id,
              status: booking.status,
              patientFirstName: patient.first_name,
              patientLastName: patient.last_name,
            },
          };
        });

        console.log("Converted events:", events);

        this.calendarOptions = {
          ...this.calendarOptions,
          events: events,
        };
      } catch (error) {
        this.error = "Error fetching bookings.";
        console.error("Error fetching bookings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async acceptBooking() {
      const bookingId = this.selectedEvent.id;
      const appointmentId = this.selectedEvent.appointmentId;

      console.log("booking id:", bookingId);
      console.log("appointment id:", appointmentId);
      this.isLoading = true;
      this.error = null;

      try {
        const response = await bookingService.acceptBooking(bookingId, { status: "CONFIRMED"});
        console.log("API Response:", response);

        if (response.hasError) {
          this.error = response.error;
          return;
        }

        const appointmentResponse = await AppointmentService.changeAppointmentStatus(appointmentId, { status: "BOOKED" });
        console.log("API Response:", appointmentResponse);

        if (appointmentResponse.hasError) {
          this.error = appointmentResponse.error;
          return;
        }

        this.fetchBookings();
        this.closeEventModal();
      } catch (error) {
        this.error = "Error accepting booking.";
        console.error("Error accepting booking:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async cancelBooking(bookingId){
      this.isLoading = true;
      this.error = null;

      try {
        const response = await bookingService.cancelBooking(bookingId);
        console.log("API Response:", response);

        if (response.hasError) {
          console.error("API error:", response.error);
          this.error = response.error.message;
          return;
        }

        this.fetchBookings();
        this.closeEventModal();
      } catch (error) {
        this.error = ("Error cancelling booking:", error.message, error.resopnse?.data);
        console.error("Error cancelling booking:", error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted(){
      this.fetchBookings();
    },
}
</script>
<template>
  <div>
    <FullCalendar :options="calendarOptions" />
    <div
      v-if="isModalVisible"
      id="event-modal"
      tabindex="-1"
      aria-hidden="true"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
    >
      <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Details
            </h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeEventModal"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>

          <div class="p-4 md:p-5">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title: {{ selectedEvent?.title || "No Title Available" }}
            </p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status: {{ selectedEvent?.status || "No Status Available" }}
            </p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Time: {{ formatTime(selectedEvent?.start) || "No Start Time Available" }}
            </p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              End Time: {{ formatTime(selectedEvent?.end) || "No End Time Available" }}
            </p>
            <div class="mt-4 flex justify-end space-x-4">
              <div v-if="selectedEvent?.extendedProps?.status !== 'CONFIRMED'">
              <button
                class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                @click="acceptBooking(selectedEvent?.id)"
              >
                Confirm Booking
              </button>
              </div>
              <button
                class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                @click="cancelBooking(selectedEvent?.id)"
              >
                Deny Booking
              </button>
              <button
                class="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
                @click="closeEventModal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>