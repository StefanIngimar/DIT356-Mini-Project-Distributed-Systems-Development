<script lang="js">
import ChevronIcon from "@/components/icons/ChevronIcon.vue";
import UserInfoBarDropdown from "@/components/user/UserInfoBarDropdown.vue";

export default {
    components: {
        ChevronIcon,
        UserInfoBarDropdown,
    },
    data() {
        return {
            isDropdownOpen: false,
        };
    },
    computed: {
        userEmail() {
            return localStorage.getItem("userEmail");
        },
        userFullName() {
            return localStorage.getItem("userFullName");
        },
    },
    methods: {
        toggleUserInfoDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },
        closeDropdown() {
            this.isDropdownOpen = false;
        },
    },
};
</script>

<template>
    <div
        class="h-full relative p-1 flex flex-row justify-end items-center gap-1"
    >
        <button @click="toggleUserInfoDropdown" class="group">
            <div class="flex flex-row items-center gap-4">
                <div class="flex flex-col items-end">
                    <p class="font-medium text-gray-800">{{ userFullName }}</p>
                    <p class="text-gray-500 text-sm">{{ userEmail }}</p>
                </div>
                <div
                    class="p-2 bg-blue-100 flex items-center justify-center rounded-full shadow border border-gray-300"
                >
                    <img
                        src="/images/user-placeholder.png"
                        width="25px"
                        height="25px"
                    />
                </div>
                <div
                    class="pr-2 text-gray-400 transform transition group-hover:text-blue-500"
                >
                    <ChevronIcon width="15" height="15" fill="currentColor" />
                </div>
            </div>
        </button>
        <UserInfoBarDropdown
            :isDropdownOpen="isDropdownOpen"
            @closeDropdown="closeDropdown"
        />
    </div>
</template>
