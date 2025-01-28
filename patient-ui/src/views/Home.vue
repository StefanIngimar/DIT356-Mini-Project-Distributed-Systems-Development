<script lang="js">
import loginService from "@/lib/services/login";
import userService from "@/lib/services/user";

import LoginForm from "@/components/home/LoginForm.vue";
import RegisterForm from "@/components/home/RegisterForm.vue";
import InformationBox from "@/components/home/InformationBox.vue";

export default {
    components: {
        LoginForm,
        RegisterForm,
        InformationBox,
    },
    data() {
        return {
            isLoading: false,
            errMessage: undefined,
            successMessage: undefined,
            showLoginForm: true,
        };
    },
    methods: {
        async login(form) {
            this.isLoading = true;
            this.resetMessagesState();

            const response = await loginService.login(
                form.email,
                form.password,
            );
            if (response.hasError) {
                this.errMessage = response.content;
                form.email = undefined;
                form.password = undefined;
            } else {
                this.$router.replace("/map");
            }

            this.isLoading = false;
        },
        async register(form) {
            this.isLoading = true;
            this.resetMessagesState();

            if (form.password !== form.confirmPassword) {
                this.errMessage =
                    "Password and confirm password have to be the same";
                return;
            }

            const response = await userService.register(
                form.firstName,
                form.lastName,
                form.email,
                form.password,
            );
            if (response.hasError) {
                this.errMessage = response.content;
                form.firstName = undefined;
                form.lastName = undefined;
                form.email = undefined;
                form.password = undefined;
                form.confirmPassword = undefined;
            } else {
                this.successMessage =
                    "Account created! Login with the provided credentials below.";
                this.showLoginForm = true;
            }
            this.isLoading = false;
        },
        toggleCurrentForm() {
            this.resetMessagesState();
            this.showLoginForm = !this.showLoginForm;
        },
        resetMessagesState() {
            this.errMessage = undefined;
            this.successMessage = undefined;
        },
    },
};
</script>

<template>
    <div
        class="w-screen min-h-screen flex items-center bg-cover bg-center bg-blue-50 overflow-auto"
    >
        <div
            class="flex flex-col md:flex-row items-center justify-center w-full h-full md:min-h-[750px] bg-blue-100 px-1 py-4 md:p-8"
        >
            <div class="w-full lg:w-1/3 md:w-1/2 h-auto md:h-full">
                <InformationBox />
            </div>
            <div
                class="w-full lg:w-1/3 md:w-1/2 flex flex-col items-center justify-center p-4 md:p-0"
            >
                <LoginForm
                    v-if="showLoginForm === true"
                    :isLoading="isLoading"
                    :errMessage="errMessage"
                    :successMessage="successMessage"
                    @login="login"
                    @toggleForm="toggleCurrentForm"
                />
                <RegisterForm
                    v-else
                    :errMessage="errMessage"
                    :successMessage="successMessage"
                    @register="register"
                    @toggleForm="toggleCurrentForm"
                />
            </div>
        </div>
    </div>
</template>
