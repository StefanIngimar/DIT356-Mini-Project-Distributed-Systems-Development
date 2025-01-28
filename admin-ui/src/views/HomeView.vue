<script lang="js">
import dashboardService from '@/lib/services/dashboard';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {
        clinics: 0,
        dentists: 0,
        bookedAppointments: 0,
        pendingAppointments: 0,
        availableTimeSlots: 0,
      },
      isModalVisible: false,
      modalTitle: '',
      modalContent: '',
      modalDetails: [],
    };
  },
  methods: {
    async fetchClinics() {
      try {
        const response = await dashboardService.getClinics();
        this.stats.clinics = response.length;
      } catch (error) {
        console.error(error);
      }
    },

    async fetchDentists() {
      try {
        const response = await dashboardService.getDentists();
        this.stats.dentists = response.length;
      } catch (error) {
        console.error(error);
      }
    },

    async fetchClinicsById() {
      try {
        const response = await dashboardService.getClinicsById();
        console.log("Clinics response:", response);
        this.stats.clinics = response.length;
      } catch (error) {
        console.error(error);
      }
    },

    async fetchBookedAppointments() {
      try {
        const response = await dashboardService.getBookings();
        console.log("Bookings response:", response);
        const bookings = response?.bookings;
        const confirmedBookings = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
          );
        const notConfirmedBookings = bookings.filter(
        (booking) => booking.status === "PENDING"
          );
        this.stats.bookedAppointments = confirmedBookings.length;
        this.stats.pendingAppointments = notConfirmedBookings.length;
      } catch (error) {
        console.error(error);
      }
    },

    async fetchAvailableTimes() {
      try {
        const response = await dashboardService.getAppointments();
        console.log("Appointments response:", response);
        const freeAppointments = response.filter((appointment) => appointment.status === 'FREE');
        this.stats.availableTimeSlots = freeAppointments.length;
      } catch (error) {
        console.error(error);
      }
    },

    async handleCardClick(key){
      const limit = 20;
      if(key === "clinics"){
        this.modalTitle = "Clinic Details";
        const response = await dashboardService.getClinics();
        this.modalDetails = response.slice(0, limit).map((clinic) => `${clinic.name} - ${clinic.address.city}`);
      } 
      
      else if(key === "dentists"){
        this.modalTitle = "Dentist Details";
        try{
        const response = await dashboardService.getDentists();
        const dentists = response.slice(0, limit);
        const modalDetailsPromises = dentists.map(async (dentist) => {
          let clinicName = '';
          try{
            const clinicResponse = await dashboardService.getDentistWithClinic(dentist.id);
            clinicName = clinicResponse.clinics?.[0]?.name || 'Unknown Clinic';
          } catch (error) {
            console.error(error);
          }
          return `${dentist.first_name} ${dentist.last_name} - ${clinicName}`;
        });
        this.modalDetails = await Promise.all(modalDetailsPromises);
      }catch (error) {
        console.error(error);
      }
      } 
      
      else if(key === "bookedAppointments"){
        this.modalTitle = "Booked Appointments";
        const response = await dashboardService.getBookings();
        const bookings = response?.bookings || [];
        const confirmedBookings = bookings.filter(
          (booking) => booking.status === "CONFIRMED"
        );
        this.modalDetails = confirmedBookings.slice(0, limit).map((booking) => `${booking.patient.first_name} ${booking.patient.last_name} - ${booking.timeslot.start_time || "Undefined"}`);
      } 
      
      else if(key === "pendingAppointments"){
        this.modalTitle = "Pending Appointments";
        const response = await dashboardService.getBookings();
        const bookings = response?.bookings;
        const notConfirmedBookings = bookings.filter(
          (booking) => booking.status === "PENDING"
        );
        this.modalDetails = notConfirmedBookings.slice(0, limit).map((booking) => `${booking.patient.first_name} ${booking.patient.last_name} - ${booking.timeslot.start_time || "Undefined"}`);
      } 
      
      else if(key === "availableTimeSlots"){
        try{
        this.modalTitle = "Available Times";
        const response = await dashboardService.getAppointments();
        const freeAppointments = response.filter((appointment) => appointment.status === 'FREE');
        const modalDetailsPromises = freeAppointments.slice(0, limit).map(async (appointment) => {
          const clinicId = appointment.clinicId;
          let clinicName = '';

          if(clinicId){ 
            try{
            const clinicResponse = await dashboardService.getClinicsById(clinicId);
            clinicName = clinicResponse?.name || 'Unknown Clinic';
          } catch (error) {
            console.error(error);
          }
        }
        return `${clinicName}: ${appointment.start_time || "Undefined"} - ${appointment.end_time || "Undefined"}`;
      });
      this.modalDetails = await Promise.all(modalDetailsPromises);
      } catch (error) {
        console.error(error);
      }} 
      
      else {
        this.modalTitle = key.replace(/([A-Z])/g, " $1").toLowerCase();
        this.modalContent = `No additional details available for ${key}`;
        this.modalDetails = [];
      }
      this.isModalVisible = true;
      },
      closeModal(){
        this.isModalVisible = false;
        this.modalTitle = '';
        this.modalContent = '';
        this.modalDetails = [];
    },
  },
  mounted() {
    this.fetchClinics();
    this.fetchDentists();
    this.fetchBookedAppointments();
    this.fetchAvailableTimes();
  },
};
</script>
<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(value, key) in stats"
        :key="key"
        @click="handleCardClick(key)"
        class="bg-white shadow-lg rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100 transition"
      >
        <h2 class="text-xl font-semibold text-gray-700 capitalize">
          {{ key.replace(/([A-Z])/g, " $1").toLowerCase() }}
        </h2>
        <p class="text-3xl font-bold text-indigo-600">{{ value }}</p>
      </div>
    </div>
  </div>

  <div
      v-if="isModalVisible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg w-1/2 max-w-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ modalTitle }}</h2>
          <button
            class="text-gray-500 hover:text-gray-800"
            @click="closeModal"
          >
            &times;
          </button>
        </div>
        <p v-if="modalContent">{{ modalContent }}</p>
        <ul v-if="modalDetails.length">
          <li v-for="(detail, index) in modalDetails" :key="index" class="mb-2">
            {{ detail }}
          </li>
        </ul>
        <button
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          @click="closeModal"
        >
          Close
        </button>
      </div>
    </div>
</template>