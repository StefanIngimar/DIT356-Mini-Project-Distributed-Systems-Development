<script lang="js">
import BookingCard from "@/components/booking/BookingCard.vue"

export default {
    components: {
        BookingCard
    },
    props: {
        bookings: {
            type: Array,
            required: true,
        },
    },
    methods: {
        cancelBooking(id) {
            this.$emit("cancel-booking", id);
        },
    },
};
</script>


<template>
    <div class="p-4 flex flex-col gap-2">
        <div v-if="bookings.length" v-for="booking in bookings" :key="booking._id"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <BookingCard :booking="booking" @cancelBooking="cancelBooking"/>
        </div>
        <div v-else class="flex items-center justify-center text-sm text-gray-400 font-semibold">
            <p>You have no bookings yet</p>
        </div>
    </div>
</template>