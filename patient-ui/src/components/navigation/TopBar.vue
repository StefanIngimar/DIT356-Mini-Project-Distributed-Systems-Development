<script lang="js">
import UserInfoBar from "@/components/user/UserInfoBar.vue"
import BookingsDrawerButton from "@/components/booking/BookingsDrawerButton.vue"

import NotificationButton from "@/components/notification/NotificationButton.vue"
import NotificationDropdown from "@/components/notification/NotificationDropdown.vue";

export default {
    components: {
        UserInfoBar,
        BookingsDrawerButton,
        NotificationButton,
        NotificationDropdown,
    }
}
</script>

<template>
    <div
        class="flex flex-row justify-between items-center pl-7 pr-4 w-full h-[65px] bg-white border-b-[1px] border-gray-200 shadow">
        <div class="flex flex-row gap-2">
            <BookingsDrawerButton />
            <NotificationButton />
            <NotificationDropdown />
        </div>
        <UserInfoBar />
    </div>
</template>