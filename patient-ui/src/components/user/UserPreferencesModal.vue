<script lang="js">
import UserPreferenceAppointmentTab from "./UserPreferenceAppointmentTab.vue";
import UserPreferencesModalHeader from "./UserPreferencesModalHeader.vue";

export default {
    components: {
        UserPreferenceAppointmentTab,
        UserPreferencesModalHeader,
    },
    data() {
        return {
            isOpen: false,
        };
    },
    mounted() {
        this.emitter.on("openUserPreferencesModal", () => {
            this.isOpen = true;
        });
    },
    methods: {
        closeModal() {
            this.isOpen = false;
        },
    },
};
</script>

<template>
  <transition>
    <div
      v-if="isOpen"
      class="absolute inset-0 z-50 flex items-start justify-center pt-24 bg-black bg-opacity-50"
    ></div>
  </transition>
  <transition name="slide-up">
    <div
      class="absolute inset-0 z-50 flex items-start justify-center pt-24"
      v-if="isOpen"
    >
      <div
        class="bg-white w-[90%] max-w-lg rounded shadow-lg p-6 text-gray-800"
      >
        <UserPreferencesModalHeader @closeModal="closeModal" />

        <UserPreferenceAppointmentTab />
      </div>
    </div>
  </transition>
</template>

<style lang="css" scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
