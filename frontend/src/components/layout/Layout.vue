<script lang="js" setup>
import Navbar from "./Navbar.vue"
</script>

<template>
    <div>
        <Navbar class="fixed top-0 left-0 w-full z-50 bg-gray-800 shadow-md" />
        <div>
            <slot></slot>
        </div>
    </div>
</template>
