<script lang="js">
import { getToday, getThreeDaysAhead } from "@/lib/calendar/core";

import ChevronIcon from "@/components/icons/ChevronIcon.vue";
import CalendarChevron from "./CalendarChevron.vue";
import DentistProfileBox from "../dentist/DentistProfileBox.vue";

export default {
    components: {
        ChevronIcon,
        CalendarChevron,
        DentistProfileBox,
    },
    props: {
        dentist: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            today: getToday(),
            currentDaysRange: getThreeDaysAhead(getToday()),
            calendarMoves: 0,
            minVacantSlots: 3,
            maxAppointmentDayCountInRange: 3,
        };
    },
    mounted() {
        this.maxAppointmentDayCountInRange =
            this.calculateTotalNumberOfAppointmentsInDay();
    },
    emits: ["bookAppointment"],
    methods: {
        formatDate(date) {
            const options = {
                weekday: "short",
                month: "short",
                day: "numeric",
            };
            return new Date(date).toLocaleDateString(undefined, options);
        },
        getDayFromShortDate(date) {
            return this.formatDate(date).split(",")[0];
        },
        getMonthDateFromShortDate(date) {
            return this.formatDate(date).split(",")[1];
        },
        normalizeTimeSlots(timeSlots, day) {
            let normalized = [];
            const takenSlots = this.filterTimeSlots(timeSlots, day);

            normalized.push(...takenSlots);
            const expectedToCurrentSlotsDifference =
                this.maxAppointmentDayCountInRange - takenSlots.length;
            if (expectedToCurrentSlotsDifference > 0) {
                for (let i = 0; i < expectedToCurrentSlotsDifference; i++) {
                    normalized.push({
                        status: "vacant",
                    });
                }
            }

            return normalized;
        },
        filterTimeSlots(timeSlots, date) {
            return timeSlots.filter(slot => {
                const slotDate = new Date(slot.date).toISOString().split("T")[0];
                return slotDate === date 
            })
        },
        calculateTotalNumberOfAppointmentsInDay() {
            let total = [];
            this.currentDaysRange.forEach((day) => {
                let filteredTimeSlots = this.filterTimeSlots(
                    this.dentist.time_slots,
                    day,
                );
                if (!filteredTimeSlots.length) {
                    filteredTimeSlots = [];
                }

                const aggregate = filteredTimeSlots.reduce((acc, timeslot) => {
                    acc[timeslot.day_of_week] =
                        (acc[timeslot.day_of_week] || 0) + 1;
                    return acc;
                }, {});

                total.push(
                    Math.max(
                        Math.max(...Object.values(aggregate)),
                        this.minVacantSlots,
                    ),
                );
            });

            return Math.max(...total);
        },
        moveCalendarRange(factor) {
            if (factor > 0) {
                this.calendarMoves += 1;
            } else {
                this.calendarMoves -= 1;
            }

            const current = new Date(this.today);
            current.setDate(this.today.getDate() + factor);

            this.today = current;
            this.currentDaysRange = getThreeDaysAhead(this.today);
            this.maxAppointmentDayCountInRange =
                this.calculateTotalNumberOfAppointmentsInDay();
        },
    },
};
</script>

<template>
    <div class="pb-4">
        <DentistProfileBox :dentist="dentist" />
    </div>
    <div
        class="p-1 flex flex-row w-full justify-evenly items-top overflow-scroll min-h-[160px] max-h-[220px]"
    >
        <div v-if="calendarMoves > 0">
            <CalendarChevron
                @clicked="moveCalendarRange"
                :factor="-4"
                rotation="90"
            />
        </div>
        <div v-for="date in currentDaysRange" :key="date">
            <div
                class="flex flex-col py-1 text-xs font-semibold text-gray-500 text-center border-b border-gray-200"
            >
                <p>{{ getDayFromShortDate(date) }}</p>
                <p>{{ getMonthDateFromShortDate(date) }}</p>
            </div>
            <div
                v-for="timeslot in normalizeTimeSlots(dentist.time_slots, date)"
                :key="timeslot.start_time"
                class="text-sm my-1 flex flex-col items-center"
            >
                <button
                    v-if="timeslot.status.toLowerCase() === 'free'"
                    class="h-[30px] w-[65px] sm:w-[70px] md:w-[80px] flex flex-row justify-center py-1 px-2 rounded transform transition-transform duration-100 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105"
                    @click="$emit('bookAppointment', dentist, timeslot)"
                >
                    {{ timeslot.start_time }}
                </button>
                <p
                    v-else-if="timeslot.status.toLowerCase() === 'vacant'"
                    class="h-[30px] w-[65px] sm:w-[70px] md:w-[80px] flex items-center justify-center py-1 px-2 rounded bg-gray-100 text-gray-400"
                >
                    -
                </p>
                <p
                    v-else
                    class="h-[30px] w-[65px] sm:w-[70px] md:w-[80px] flex flex-row items-center justify-center py-1 px-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed line-through text-center"
                >
                    {{ timeslot.start_time }}
                </p>
            </div>
        </div>
        <div>
            <CalendarChevron
                @clicked="moveCalendarRange"
                :factor="4"
                rotation="270"
            />
        </div>
    </div>
</template>
