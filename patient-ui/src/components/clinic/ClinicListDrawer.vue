<script lang="js">
import ListIcon from "@/components/icons/ListIcon.vue";

import ClinicListDrawerHeader from "./ClinicListDrawerHeader.vue";
import ClinicListEntry from "./ClinicListEntry.vue";

export default {
    components: {
        ListIcon,
        ClinicListDrawerHeader,
        ClinicListEntry,
    },
    emits: ["navigateToClinic"],
    props: {
        clinics: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            isDrawerOpen: false,
            searchQuery: undefined,
            currentClinics: this.clinics,
        };
    },
    watch: {
        clinics: {
            immediate: true,
            handler(newClinics) {
                this.currentClinics = newClinics;
            },
        },
    },
    methods: {
        toggleDrawer() {
            this.isDrawerOpen = !this.isDrawerOpen;
        },
        closeDrawer() {
            this.isDrawerOpen = false;
        },
        navigateToClinic(clinic) {
            this.$emit("navigateToClinic", clinic);
        },
        searchClinics(searchQuery) {
          if (searchQuery === "" || searchQuery === null || searchQuery === undefined) {
              this.currentClinics = this.clinics;
          } else {
              this.currentClinics = this.clinics.filter(clinic =>
                  clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
          }
        }
    },
};
</script>

<template>
  <div>
    <button
      class="absolute top-4 right-3 z-40 w-[40px] h-[40px] flex items-center justify-center bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100"
      @click="toggleDrawer"
    >
      <ListIcon fill="black" />
    </button>
    <transition name="drawer-slide">
      <div
        v-if="isDrawerOpen"
        class="pb-4 absolute top-0 right-0 h-full w-full sm:w-[450px] md:w-[550px] bg-white z-40 rounded-r-lg border border-gray-300 shadow-xl overflow-y-auto"
      >
        <ClinicListDrawerHeader
          @closeDrawer="closeDrawer"
          @searchClinics="searchClinics"
        />
        <div class="mt-2 flex flex-col gap-2 overflow-auto">
          <div v-for="clinic in currentClinics" class="px-2">
            <ClinicListEntry
              :clinic="clinic"
              @navigateToClinic="navigateToClinic"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
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
