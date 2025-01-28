<script lang="js">
import LabeledInput from "@/components/form/LabeledInput.vue";
import LabeledSelect from "@/components/form/LabeledSelect.vue";
import LoadingSpinner from "../core/LoadingSpinner.vue";
import ErrorAlert from "@/components/home/alert/ErrorAlert.vue";
import SuccessAlert from "@/components/home/alert/SuccessAlert.vue";

export default {
    components: {
        LabeledInput,
        LabeledSelect,
        LoadingSpinner,
        ErrorAlert,
        SuccessAlert,
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
    data() {
        return {
            form: {
                firstName: undefined,
                lastName: undefined,
                email: undefined,
                password: undefined,
                confirmPassword: undefined,
            },
        };
    },
    methods: {
        onRegister() {
            this.$emit("register", this.form);
        },
    },
};
</script>

<template>
    <div
        class="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8 w-full h-auto"
    >
        <div class="pb-8">
            <h3 class="pb-3 text-gray-800 font-semibold text-3xl">
                Create Patient Account
            </h3>
            <p class="text-sm text-gray-500">
                Create your patient account now and get access to the best
                dentists in Gothenburg
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
            <form class="pb-8" @submit.prevent="onRegister">
                <div class="flex flex-row gap-2">
                    <LabeledInput
                        divClass="pb-6 w-full"
                        inputName="first-name"
                        inputType="text"
                        text="First name"
                        :isRequired="true"
                        v-model="form.firstName"
                        labelClass="block mb-2 text-sm font-medium text-gray-700"
                        inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                    />
                    <LabeledInput
                        divClass="pb-6 w-full"
                        inputName="last-name"
                        inputType="text"
                        text="Last name"
                        :isRequired="true"
                        v-model="form.lastName"
                        labelClass="block mb-2 text-sm font-medium text-gray-700"
                        inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                    />
                </div>
                <LabeledInput
                    divClass="pb-6"
                    inputName="email"
                    inputType="email"
                    text="Email"
                    :isRequired="true"
                    v-model="form.email"
                    labelClass="block mb-2 text-sm font-medium text-gray-700"
                    inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                />
                <LabeledInput
                    divClass="pb-6"
                    inputName="password"
                    inputType="password"
                    text="Password"
                    :isRequired="true"
                    v-model="form.password"
                    labelClass="block mb-2 text-sm font-medium text-gray-700"
                    inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                />
                <LabeledInput
                    divClass="pb-6"
                    inputName="repeat-password"
                    inputType="password"
                    text="Confirm password"
                    :isRequired="true"
                    v-model="form.confirmPassword"
                    labelClass="block mb-2 text-sm font-medium text-gray-700"
                    inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                />
                <div class="flex items-center justify-center">
                    <LoadingSpinner v-if="isLoading" />
                    <button
                        v-else
                        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded shadow-md transition-transform transform hover:scale-105"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
        <div>
            <p class="text-sm text-gray-400">
                Have an account already?
                <button
                    class="text-blue-500 font-bold hover:text-blue-600 transition-colors ease-in-out"
                    @click="$emit('toggleForm')"
                >
                    Login here!
                </button>
            </p>
        </div>
    </div>
</template>
