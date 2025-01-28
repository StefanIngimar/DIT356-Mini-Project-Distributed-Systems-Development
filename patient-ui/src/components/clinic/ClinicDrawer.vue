<script lang="js">
import CloseIcon from "@/components/icons/CloseIcon.vue";
import AppointmentPanel from "@/components/appointment/AppointmentPanel.vue";

export default {
    components: {
        AppointmentPanel,
        CloseIcon,
    },
    emits: ["closeDrawer", "refreshClinicDentists"],
    props: {
        clinic: {
            type: [Object, null],
            required: true,
        },
        clinicDentists: {
            type: Array,
            required: true,
        }
    },
    methods: {
      refreshClinicDentists() {
        this.$emit("refreshClinicDentists")
      }
    }
};
</script>

<template>
  <transition name="drawer-slide">
    <div
      v-if="clinic"
      class="pb-4 absolute top-0 right-0 h-full w-full sm:w-[450px] md:w-[550px] bg-white z-40 rounded-r-lg border border-gray-300 shadow-xl overflow-y-auto"
    >
      <div
        class="flex justify-between items-center p-4 border-b border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-700">Clinic Details</h2>
        <button
          type="button"
          @click="$emit('closeDrawer')"
          class="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform ease-in-out duration-100 hover:scale-125"
        >
          <CloseIcon fill="#343434" width="25" height="25" />
        </button>
      </div>

      <div class="p-6 text-center">
        <div class="flex items-center justify-center">
          <img
            :src="clinic.logo_url"
            alt="Clinic Logo"
            class="w-24 h-24 rounded-full border border-gray-200 shadow-sm mb-4 object-cover"
          />
        </div>
        <p class="text-xl font-bold text-gray-800">
          {{ clinic.name }}
        </p>
      </div>

      <div class="px-6">
        <hr class="my-4" />
        <div class="mb-6">
          <p class="text-sm text-gray-500 font-medium mb-1">
            Clinic Description
          </p>
          <p class="text-gray-700">
            {{ clinic.description }}
          </p>
        </div>

        <hr class="my-4" />

        <div class="flex flex-col sm:flex-row gap-6 mb-6">
          <div class="flex-1">
            <p class="text-sm text-gray-500 font-medium mb-1">Address</p>
            <p class="text-gray-700">
              {{ clinic.address.street }}
            </p>
            <p class="text-gray-700">
              {{ clinic.address.city }},
              {{ clinic.address.postal_code }}
            </p>
            <p class="text-gray-700">
              {{ clinic.address.country }}
            </p>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 font-medium mb-1">Contact</p>
            <p class="text-gray-700">
              {{ clinic.contact.email }}
            </p>
            <p class="text-gray-700">
              {{ clinic.contact.phone_number }}
            </p>
          </div>
        </div>

        <hr class="my-4" />

        <div>
          <AppointmentPanel :dentists="clinicDentists" @refreshClinicDentists="refreshClinicDentists" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="css" scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.2s ease-in-out;
}
.drawer-slide-enter-from {
  transform: translateX(100%);
}
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
