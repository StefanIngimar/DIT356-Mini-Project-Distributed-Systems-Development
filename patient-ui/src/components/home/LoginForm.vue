<script lang="js">
import LabeledInput from "@/components/form/LabeledInput.vue";
import LoadingSpinner from "../core/LoadingSpinner.vue";
import ErrorAlert from "@/components/home/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/home/alert/SuccessAlert.vue";

export default {
    components: {
        LabeledInput,
        LoadingSpinner,
        ErrorAlert,
        SuccessAlert,
    },
    data() {
        return {
            form: {
                email: undefined,
                password: undefined,
            },
        };
    },
    props: {
        isLoading: {
            type: Boolean,
            required: true,
        },
        errMessage: {
            type: String,
            default: "",
        },
        successMessage: {
            type: String,
            default: "",
        },
    },
    methods: {
        onLogin() {
            this.$emit("login", this.form);
        },
    },
};
</script>

<template>
    <div
        class="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg max-w-lg p-8 w-full h-auto"
    >
        <div class="pb-6 text-left">
            <h3 class="text-3xl font-bold text-gray-800 mb-3">
                Login To Your Patient Profile
            </h3>
            <p class="text-sm text-gray-500">
                Login to see available dentists and manage appointments
            </p>
        </div>

        <div
            v-if="errMessage || successMessage"
            class="pb-8 w-full flex flex-col gap-2"
        >
            <ErrorAlert
                v-if="errMessage"
                :withHeader="false"
                :message="errMessage"
            />
            <SuccessAlert
                v-if="successMessage"
                :withHeader="false"
                :message="successMessage"
            />
        </div>

        <div class="w-full">
            <form class="pb-6" @submit.prevent="onLogin">
                <LabeledInput
                    divClass="pb-4"
                    inputName="email"
                    inputType="email"
                    text="Email"
                    :isRequired="true"
                    v-model="form.email"
                    labelClass="block mb-2 text-sm font-medium text-gray-700"
                    inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                />
                <LabeledInput
                    divClass="pb-4"
                    inputName="password"
                    inputType="password"
                    text="Password"
                    :isRequired="true"
                    v-model="form.password"
                    labelClass="block mb-2 text-sm font-medium text-gray-700"
                    inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                />
                <div class="flex justify-center">
                    <LoadingSpinner v-if="isLoading" />
                    <button
                        v-else
                        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded shadow-md transition-transform transform hover:scale-105"
                    >
                        Login
                    </button>
                </div>
            </form>

            <div class="text-center">
                <p class="text-sm text-gray-500">
                    Don't have an account yet?
                    <button
                        class="text-blue-500 font-bold hover:text-blue-600 transition-colors ease-in-out"
                        @click="$emit('toggleForm')"
                    >
                        Create one here!
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>
