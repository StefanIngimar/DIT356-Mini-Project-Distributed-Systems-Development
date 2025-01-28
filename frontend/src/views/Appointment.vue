<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AppointmentService from "@/lib/services/appointment";
import timeGridPlugin from '@fullcalendar/timegrid'
import Cookies from "js-cookie";

const getDefaultAppointmentData = () => {
  return {
    date: '',
    start: '',
    end: '',
  };
};

function formatDate(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      isModalVisible: false,
      selectedEvent: null,
      newAppointment: {
        clinicId: '',
        dentistId: '',
        date: '',
        start_time: '',
        end_time: '',
      },
      eventData: getDefaultAppointmentData(),
      calendarOptions: {
        plugins: [timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        events: [],
        dateClick: this.dateClick,
        eventClick: this.handleEventClick,
        dayHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit' },//european date format
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        locale: 'en-gb',
      },
      isLoading: false,
      error: null,
    };
  },
  mounted(){
    this.fetchAppointments();
    this.$forceUpdate();
  },
  methods: {
    dateClick(info) {
      this.selectedDate = info.dateStr;
      this.newAppointment.date = formatDate(info.dateStr);
      this.showModal();
    },
    showModal() {
      const modal = document.getElementById("crud-modal");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    },
    closeModal() {
      const modal = document.getElementById("crud-modal");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    },
    eventClick({ event }) {
      this.selectedEvent = event;
      this.showEventModal();
    },
    showEventModal() {
      this.isModalVisible = true;
    },
    handleEventClick({ event }) {
    this.selectedEvent = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
    };
    this.showEventModal();
    },
    closeEventModal() {
      const modal = document.getElementById("event-modal");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    },
    showEventModal() {
      const modal = document.getElementById("event-modal");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    },
    formatTime(date){
      if(!date){
        return null;
      }

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, });
    },
    //using the jwt token, we fetch the userID, which we then use to fetch the dentistID
    //the dentistID can then be used to fetch the clinicID, and we are able to create an appointment.
    //with the dentistID we can get the appointments as well
    async fetchDentistAndClinic() {
     const token = Cookies.get("jwtToken");
     if (!token) {
        this.error = "User is not logged in.";
        console.error("JWT token missing.");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub;

      try {
        const dentistResponse = await AppointmentService.getDentistByUserId(userId);

        if (dentistResponse.hasError) {
          this.error = dentistResponse.content.details || "Error fetching dentist.";
          console.error("Error fetching dentist:", dentistResponse.content);
          return;
        }

        const dentistId = dentistResponse.content.id;

        const clinicsResponse = await AppointmentService.getDentistWithClinic(dentistId);

        if (clinicsResponse.hasError) {
          this.error = clinicsResponse.content.details || "Error fetching clinics.";
          console.error("Error fetching clinics:", clinicsResponse.content);
          return;
        }

        if (clinicsResponse.content.clinics && clinicsResponse.content.clinics.length > 0) {
          this.newAppointment.clinicId = clinicsResponse.content.clinics[0].id;
          this.newAppointment.dentistId = dentistId;
        } else {
          this.error = "No clinics found for the dentist.";
          console.error("No clinics found for the dentist.");
        }
        } catch (error) {
            console.error("Error fetching dentist or clinics:", error);
            this.error = "An error occurred.";
        }
    },
    async deleteAppointment() {
      if (!this.selectedEvent) {
        return;
      }

      const appointmentId = this.selectedEvent.id;

      try {
        const response = await AppointmentService.deleteAppointment(appointmentId);

        if (response.hasError) {
          this.error = response.content.details || "An error occurred while deleting the appointment.";
          console.error("Error deleting appointment:", response.content);
        } else {
          console.log("Appointment deleted successfully:", response.content);
          this.fetchAppointments();
          this.closeEventModal();
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        this.error = "An error occurred.";
      }
    },
    async fetchAppointments() {
      this.isLoading = true;
      try {
        const token = Cookies.get("jwtToken");
        if (!token) {
          this.error = "User is not logged in.";
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub;

        const dentistResponse = await AppointmentService.getDentistByUserId(userId);
        if(dentistResponse.hasError){
          this.error = dentistResponse.content.details || "Error fetching dentist.";
          console.error("Error fetching dentist:", dentistResponse.content);
          return;
        }

        const dentistId = dentistResponse.content.id;

        const { hasError, content } = await AppointmentService.getAppointmentByDentist(dentistId);
        if(hasError){
          this.error = content;
          console.error("Error fetching appointments:", content);
          return;
        }
        //the date is a date object, so i needed to convert it to a string in order to use it properly in the calendar
        //also the appointments are nested in an object, so i needed to use Object.entries to get the appointments
        //the date is a key in the object, and the appointments are the values
        const events = Object.entries(content).flatMap(([date, appointments]) =>
          appointments.map(({ appointmentId, start_time, end_time, status }) => {
            const start = new Date(date);
            start.setHours(start_time.split(":")[0]);
            start.setMinutes(start_time.split(":")[1]);

            const end = new Date(date);
            end.setHours(end_time.split(":")[0]);
            end.setMinutes(end_time.split(":")[1]);

            return {
              id: appointmentId,
              start,
              end,
              title: status,
            };
          })
        );
          console.log("Appointments fetched successfully:", events);
      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...events],
      };
      } catch (error) {
        this.error = "An error occurred while fetching appointments.";
        console.error("Error fetching appointments:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async submitAppointment() {
      if (!this.newAppointment.clinicId || !this.newAppointment.dentistId) {
            await this.fetchDentistAndClinic();
        }

        if (!this.newAppointment.date || !this.newAppointment.start_time || !this.newAppointment.end_time) {
            this.error = "Please fill in all required fields.";
            return;
        }

        const appointmentPayload = {
            ...this.newAppointment,
        };

        try {
            const response = await AppointmentService.addAppointment(appointmentPayload);

            if (response.hasError) {
                this.error = response.content.details || "An error occurred while creating the appointment.";
                console.error("Error adding appointment:", response.content);
            } else {
                console.log("Appointment added successfully:", response.content);
                await this.fetchAppointments();
                this.closeModal();
            }
        } catch (error) {
            console.error("Error submitting appointment:", error);
            this.error = "An error occurred.";
        }
    },
  async mounted() {
    await this.fetchAppointments();
  },
},
};
</script>

<template>
  <meta http-equiv="Content-Language" content="en-GB">
  <div>
    <FullCalendar :options="calendarOptions" />
  </div>
  <div
  id="event-modal"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-md max-h-full">
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Appointment Details
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
          Status: {{ selectedEvent?.title || "No Status Available" }}
        </p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Start Time: {{ formatTime(selectedEvent?.start) }}
        </p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          End Time: {{ formatTime(selectedEvent?.end)}}
        </p>
        <div class="mt-4 flex justify-end space-x-4">
          <button
            class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
            @click="deleteAppointment(selectedEvent?.id)"
          >
            Delete Appointment
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  <div
      id="crud-modal"
      tabindex="-1"
      aria-hidden="true"
      class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- found a good looking modal that i used and altered a bit https://flowbite.com/docs/components/modal/ -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Appointment
            </h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeModal"
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
          <form @submit.prevent="submitAppointment" class="p-4 md:p-5">
            <div class="mb-4">
              <label
                for="date"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Day
              </label>
              <input
                v-model="newAppointment.date"
                type="date"
                id="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                disabled
              />
            </div>

            <div class="mb-4">
              <label
                for="start_time"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Start Time
              </label>
              <input
                v-model="newAppointment.start_time"
                type="time"
                id="start_time"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                step="60"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Selected: {{ formatTime(new Date(`1970-01-01T${newAppointment.start_time}:00`)) }}
              </p>
            </div>

            <div class="mb-4">
              <label
                for="end_time"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                End Time
              </label>
              <input
                v-model="newAppointment.end_time"
                type="time"
                id="end_time"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Selected: {{ formatTime(new Date(`1970-01-01T${newAppointment.end_time}:00`)) }}
              </p>
            </div>

            <button
              type="submit"
              class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Add Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
</template>
