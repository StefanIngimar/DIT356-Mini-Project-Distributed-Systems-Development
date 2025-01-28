<script>
import FilterIcon from "@/components/icons/FilterIcon.vue";
import CloseIcon from "@/components/icons/CloseIcon.vue";

import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue"

export default {
    components: {
        FilterIcon,
        CloseIcon,
        ErrorAlert,
        SuccessAlert,
    },
    emits: ["filterDentistsData", "reloadDentistsData"],
    data() {
        return {
            isOpen: false,
            isFiltering: false,
            startDate: null,
            endDate: null,
            error: null,
            success: null,
        };
    },
    methods: {
        resetAlertState() {
            this.error = null;
            this.success = null;
        },
        toggleContainer() {
            this.resetAlertState();
            this.isOpen = !this.isOpen;
        },
        closeContainer() {
            this.resetAlertState();
            this.isOpen = false;
        },
        resetDates() {
            if (this.isFiltering === false) {
                return;
            }

            this.resetAlertState();
            this.startDate = null;
            this.endDate = null;

            this.$emit("reloadDentistsData");

            this.isFiltering = false;
            this.success = "Filter reset";
        },
        filterDates() {
            if (this.startDate == null || this.endDate == null) {
                this.error = "Start and end dates have to be selected";
                return;
            }

            if (this.startDate > this.endDate) {
                this.error = "Start date has to be before end date";
                return;
            }

            this.$emit("filterDentistsData", this.startDate, this.endDate);

            this.isFiltering = true;
            this.isOpen = false;
        },
    },
};
</script>

<template>
    <div class="absolute top-4 left-3 z-40">
        <button
            class="relative w-[40px] h-[40px] flex items-center justify-center bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100"
            @click="toggleContainer"
        >
            <FilterIcon width="25" height="25" />
            <transition name="slide-up">
                <div v-if="isFiltering" class="absolute h-3 w-3 rounded-full bg-slate-700 right-[-3px] top-[-3px]"></div>
            </transition>
        </button>
        <transition name="slide">
            <div
                v-if="isOpen"
                class="absolute top-[50px] left-0 bg-white shadow-lg border border-gray-200 rounded-lg w-[250px] sm:w-[300px] p-4 z-50"
            >
                <div class="flex flex-row justify-between items-center">
                    <h3 class="text-sm font-semibold text-gray-500">
                        Filter Appointment Slots
                    </h3>
                    <button
                        class="text-gray-500 hover:text-gray-700 focus:outline-none"
                        @click="closeContainer"
                    >
                        <CloseIcon fill="#343434" width="25" height="25" />
                    </button>
                </div>

                <hr class="my-4" />
                
                <transition name="slide-up">
                    <div class="pb-4" v-if="error || success">
                        <ErrorAlert v-if="error" :message="error" :withHeader="false" pClass="text-xs"/>
                        <SuccessAlert v-if="success" :message="success" :withHeader="false" pClass="text-xs"/>
                    </div>
                </transition>

                <div>
                    <label
                        class="block text-xs font-medium text-gray-700 mb-1"
                        for="start-date"
                    >
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="start-date"
                        class="block w-full border border-gray-300 rounded-md shadow-sm sm:text-xs p-2 mb-4"
                        v-model="startDate"
                    />
                </div>

                <div>
                    <label
                        class="block text-xs font-medium text-gray-700 mb-1"
                        for="end-date"
                    >
                        End Date
                    </label>
                    <input
                        type="date"
                        id="end-date"
                        class="block w-full border border-gray-300 rounded-md shadow-sm sm:text-xs p-2 mb-4"
                        v-model="endDate"
                    />
                </div>

                <div class="flex justify-between gap-2">
                    <button
                        @click="resetDates"
                        class="text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                        Reset
                    </button>
                    <button
                        @click="filterDates"
                        class="text-sm px-3 py-2 rounded-md bg-blue-100 border border-blue-100 text-blue-600 hover:bg-blue-200"
                    >
                        Filter
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="css" scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s ease-in-out;
}
.slide-enter-from {
    transform: translateX(-100%);
}
.slide-leave-to {
    transform: translateX(-100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
