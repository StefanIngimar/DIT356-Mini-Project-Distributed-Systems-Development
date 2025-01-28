<script lang="js">
import { SideNav, TopBar } from "@/components/navigation";

import UserPreferencesModal from "../user/UserPreferencesModal.vue";
import NotificationPopUpBox from "../notification/NotificationPopUpBox.vue";
import BookingsDrawer from "@/components/booking/BookingsDrawer.vue";

export default {
    components: {
        SideNav,
        TopBar,
        UserPreferencesModal,
        NotificationPopUpBox,
        BookingsDrawer,
    },
};
</script>

<template>
    <div class="flex flex-row w-full h-full">
        <main
            class="relative w-full min-h-screen h-full flex flex-col bg-gray-50 overflow-hidden"
        >
            <TopBar />
            <UserPreferencesModal />
            <NotificationPopUpBox />
            <div class="relative w-full h-full p-4 overflow-visible">
                <BookingsDrawer />
                <slot></slot>
            </div>
        </main>
    </div>
</template>
