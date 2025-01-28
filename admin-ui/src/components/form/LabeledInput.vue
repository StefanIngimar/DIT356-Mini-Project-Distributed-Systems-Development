<script lang="js">
export default {
  props: {
    inputName: {
      type: String
    },
    inputType: {
      type: String
    },
    text: {
      type: String
    },
    modelValue: {
      type: [String, Number]
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    divClass: {
      type: String,
      default: "pb-3"
    }
  },
  emits: ['update:modelValue']
}
</script>

<template>
  <div :class="divClass">
    <label class="block text-sm font-medium text-gray-700" :for="inputName">{{ text }}</label>
    <input
      :type="inputType"
      :name="inputName"
      :value="modelValue"
      :required="isRequired"
      :disabled="isDisabled"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
    />
  </div>
</template>