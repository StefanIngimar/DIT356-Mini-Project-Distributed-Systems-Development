<script lang="js">
export default {
    props: {
        width: {
            type: [String, Number],
            default: "20",
        },
        height: {
            type: [String, Number],
            default: "20",
        },
        fill: {
            type: String,
            default: "#FFFFFF",
        },
    },
};
</script>

<template>
    <svg :width="width" :height="height" viewBox="-1.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Dribbble-Light-Preview" transform="translate(-221.000000, -720.000000)" :fill="fill">
                <g id="icons" transform="translate(56.000000, 160.000000)">
                    <path
                        d="M177.75,574 L169.25,574 L169.25,568 C169.25,565.334 171.375,564 173.498937,564 L173.501063,564 C175.625,564 177.75,565.334 177.75,568 L177.75,574 Z M174.5625,577 C174.5625,577.552 174.0865,578 173.5,578 C172.9135,578 172.4375,577.552 172.4375,577 L172.4375,576 L174.5625,576 L174.5625,577 Z M179.875,572 L179.875,568 C179.875,564.447 177.359,562.475 174.5625,562.079 L174.5625,560 L172.4375,560 L172.4375,562.079 C169.641,562.475 167.125,564.447 167.125,568 L167.125,572 C167.125,573.105 166.174062,574 165,574 L165,576 L170.3125,576 L170.3125,577 C170.3125,578.657 171.739437,580 173.5,580 C175.260563,580 176.6875,578.657 176.6875,577 L176.6875,576 L182,576 L182,574 C180.825938,574 179.875,573.105 179.875,572 L179.875,572 Z"
                        id="notification_bell-[#1396]">

                    </path>
                </g>
            </g>
        </g>
    </svg>
</template>