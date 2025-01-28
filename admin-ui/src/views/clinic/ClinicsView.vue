<script lang="js">
import dentistClinicService from "@/lib/services/dentistClinic.js"

import ClinicTable from "@/components/clinic/ClinicTable.vue"
import SkeletonClinicTable from "@/components/clinic/SkeletonClinicTable.vue"

export default {
    components: {
        ClinicTable,
        SkeletonClinicTable,
    },
    data() {
        return {
            isLoading: false,
            error: undefined,
            clinics: [],
        }
    },
    async mounted() {
        await this.fetchClinics()
    },
    methods: {
        async fetchClinics() {
            this.isLoading = true;
            const { hasError, content } = await dentistClinicService.getClinics();
            if (hasError) {
                this.error = content;
            } else {
                this.clinics = Array.isArray(content) ? content : [content]
            }
            this.isLoading = false;
        }
    }
}
</script>

<template>
  <div class="w-full">
    <SkeletonClinicTable v-if="isLoading"/>
    <ClinicTable v-else :clinics="clinics"/>
  </div>
</template>
