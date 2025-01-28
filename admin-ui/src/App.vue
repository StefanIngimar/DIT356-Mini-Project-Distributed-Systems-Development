<script setup>
import Layout from "@/components/layout/Layout.vue";
</script>

<template>
  <div>
    <Layout v-if="$route.meta.withLayout === true">
      <RouterView />
    </Layout>

    <RouterView v-else />
  </div>
</template>
