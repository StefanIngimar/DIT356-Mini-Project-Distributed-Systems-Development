<script lang="js">
export default {
  props: {
    width: {
      type: String,
      default: '20'
    },
    height: {
      type: String,
      default: '20'
    },
    fill: {
      type: String,
      default: '#FFFFFF'
    }
  }
}
</script>

<template>
  <svg 
    :width="width"
    :height="height"
    viewBox="0 0 16 16"
    :fill="fill"
    xmlns="http://www.w3.org/2000/svg" 
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <title>Patient Bookings</title>
      <path d="m 6.5 0 c -3.578125 0 -6.5 2.921875 -6.5 6.5 s 2.921875 6.5 6.5 6.5 c 0.167969 0 0.335938 -0.007812 0.5 -0.019531 v -2.007813 c -0.164062 0.019532 -0.332031 0.027344 -0.5 0.027344 c -2.496094 0 -4.5 -2.003906 -4.5 -4.5 s 2.003906 -4.5 4.5 -4.5 s 4.5 2.003906 4.5 4.5 c 0 0.167969 -0.007812 0.335938 -0.027344 0.5 h 2.007813 c 0.011719 -0.164062 0.019531 -0.332031 0.019531 -0.5 c 0 -3.578125 -2.921875 -6.5 -6.5 -6.5 z m 0 3 c -0.277344 0 -0.5 0.222656 -0.5 0.5 v 2.5 h -1.5 c -0.277344 0 -0.5 0.222656 -0.5 0.5 s 0.222656 0.5 0.5 0.5 h 2 c 0.277344 0 0.5 -0.222656 0.5 -0.5 v -3 c 0 -0.277344 -0.222656 -0.5 -0.5 -0.5 z m 4.5 5 v 3 h -3 v 2 h 3 v 3 h 2 v -3 h 3 v -2 h -3 v -3 z m 0 0" 
      :fill="fill"></path>
    </g>
  </svg>
</template>
