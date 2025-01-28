<script lang="js">
import SideNav from "@/components/navigation/SideNav.vue";

export default {
    components: {
        SideNav,
    },
};
</script>

<template>
    <div class="flex flex-row w-full h-full">
        <SideNav />
        <main
            class="relative w-full min-h-screen h-full flex flex-col bg-gray-50 overflow-hidden"
        >
            <div class="relative w-full h-full p-4 overflow-visible">
                <slot></slot>
            </div>
        </main>
    </div>
</template>