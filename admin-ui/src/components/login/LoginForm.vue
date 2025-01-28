<script lang="js">
import ErrorAlert from "@/components/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/alert/SuccessAlert.vue";

import LabeledInput from "@/components/form/LabeledInput.vue";

export default {
    components: {
        ErrorAlert,
        SuccessAlert,
        LabeledInput,
    },
    props: {
        errMessage: {
            type: String,
            default: "",
        },
        successMessage: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            form: {
                email: undefined,
                password: undefined,
            },
        };
    },
    methods: {
        onLogin() {
            this.$emit("login", this.form);
        },
    },
};
</script>

<template>
    <div class="p-4 border border-gray-200 shadow-lg rounded">
        <div class="pb-8">
            <h3 class="text-slate-700 font-semibold text-3xl text-center">
                Admin Panel
            </h3>
        </div>
        <div v-if="errMessage" class="pb-8">
            <ErrorAlert :withHeader="false" :message="errMessage" />
        </div>
        <div v-if="successMessage" class="pb-8">
            <SuccessAlert :withHeader="false" :message="successMessage" />
        </div>
        <form class="pb-8" @submit.prevent="onLogin">
            <LabeledInput
                divClass="pb-6"
                inputName="email"
                inputType="email"
                text="Email"
                :isRequired="true"
                v-model="form.email"
            />
            <LabeledInput
                divClass="pb-6"
                inputName="password"
                inputType="password"
                text="Password"
                :isRequired="true"
                v-model="form.password"
            />
            <div class="flex items-center justify-center">
                <button
                    type="submit"
                    class="py-2 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition ease-in-out rounded-sm"
                >
                    Login
                </button>
            </div>
        </form>
    </div>
</template>
