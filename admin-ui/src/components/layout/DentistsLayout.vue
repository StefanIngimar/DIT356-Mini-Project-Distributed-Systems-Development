<script lang="js">
import Tabs from "@/components/navigation/Tabs.vue"
import TabLink from "@/components/navigation/TabLink.vue"

export default {
    components: {
        Tabs, TabLink,
    },
    data() {
        return {
            tabs: [
                {href: "/dentists/new", name:"Add Dentist"},
            ]
        }
    }
}
</script>

<template>
  <Tabs>
    <TabLink
      v-for="tab in tabs"
      :key="tab.name"
      :href="tab.href"
      :name="tab.name"
    />
  </Tabs>
  <div class="h-full">
    <RouterView />
  </div>
</template>
