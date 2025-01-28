<script lang="js">
import bookingService from '@/lib/services/booking';

import BookingsDrawerHeader from "@/components/booking/BookingsDrawerHeader.vue"
import BookingCardsList from "@/components/booking/BookingCardsList.vue"

import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue";

export default {
    components: {
        BookingsDrawerHeader,
        BookingCardsList,
        ErrorAlert,
        SuccessAlert,
    },
    data() {
        return {
            isOpen: false,
            isLoading: false,
            wereBookingsFetched: false,
            bookings: [],
            canceledBooking: {},
            error: null,
            success: null,
        }
    },
    mounted() {
        this.emitter.on("toggleBookingsDrawer", () => {
            this.resetMessagesState();
            this.isOpen = !this.isOpen;
        });
    },
    beforeUnmount() {
        this.emitter.off("toggleBookingsDrawer");
    },
    computed: {
        patientId() {
            return localStorage.getItem('userId')
        }
    },
    watch: {
        async isOpen(val) {
            if (val && this.wereBookingsFetched === false) {
                await this.fetchBookings(this.patientId);
                this.wereBookingsFetched = true;
            }
        }
    },
    methods: {
        resetMessagesState() {
            this.error = null
            this.success = null
        },
        async fetchBookings(patientId) {
            this.isLoading = true
            const { hasError, content } = await bookingService.getBookings(patientId)
            if (hasError) {
                this.resetMessagesState()
                this.error = content.message
            } else {
                this.bookings = Array.isArray(content.bookings) ? content.bookings : [content]
            }
            this.isLoading = false
        },
        async cancelBooking(bookingId) {
            this.isLoading = true
            const { hasError, content } = await bookingService.cancelBooking(bookingId)
            if (hasError) {
                this.resetMessagesState()
                this.error = content.message
            } else {
                this.canceledBooking = content
                this.resetMessagesState()
                this.success = 'Booking canceled successfully'
                this.bookings = this.bookings.filter(booking => booking._id !== bookingId)
            }
            this.isLoading = false
        }
    }
}
</script>

<template>
    <transition name="drawer-slide">
        <div v-if="isOpen"
            class="pb-4 absolute top-0 left-0 h-full w-full sm:w-[450px] md:w-[550px] bg-white z-[45] rounded-r-lg border border-gray-300 shadow-xl overflow-y-auto">
            <BookingsDrawerHeader @closeDrawer="isOpen = false" />
            <transition name="alert-slide">
                <div v-if="this.error || this.success" class="pb-3 px-1">
                    <ErrorAlert v-if="this.error" :message="this.error" :withHeader="false" />
                    <SuccessAlert v-if="this.success" :message="this.success" :withHeader="false" />
                </div>
            </transition>
            <BookingCardsList :bookings="bookings" @cancelBooking="cancelBooking" />
        </div>
    </transition>
</template>

<style lang="css" scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: transform 0.2s ease-in-out;
}

.drawer-slide-enter-from {
    transform: translateX(-100%);
}

.drawer-slide-leave-to {
    transform: translateX(-100%);
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.2s ease-out;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>