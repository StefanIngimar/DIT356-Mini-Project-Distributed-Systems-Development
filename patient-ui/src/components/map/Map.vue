<script setup lang="js">
import { ref, onMounted } from "vue";
import {
    VMap,
    VMapZoomControl,
    VMapTileLayer,
    VMapDivMarker,
} from "vue-map-ui";

import ClinicDrawer from "@/components/clinic/ClinicDrawer.vue";
import ClinicListDrawer from "@/components/clinic/ClinicListDrawer.vue";
import ClinicMapMarker from "@/components/clinic/ClinicMapMarker.vue";
import MapFilterBox from "@/components/map/MapFilterBox.vue";

import { GOTHENBURG_COORDS } from "@/lib/map/coordinates.js";

import dentistClinic from "@/lib/services/dentistClinic.js";

const mapCenter = ref([...Object.values(GOTHENBURG_COORDS)]);
const zoomLevel = ref(13);

const clinics = ref([]);
const loaded = ref(false);

onMounted(async () => {
    clinics.value = await getClinics(null);
    loaded.value = true;
});

async function getClinics(queryParams) {
    const response = await dentistClinic.getClinics(queryParams);
    if (response.hasError) {
        return [];
    }
    return response.content;
}

async function reloadClinicsData() {
  clinics.value = await getClinics(null);
}

async function refreshClinicsByAppointmentAvailability(startDate, endDate) {
  clinics.value = await getClinics({
    "start_date": startDate,
    "end_date": endDate,
  });
}

async function getClinicDentistsWithTheirAppointmentSlots(clinicId, queryParams) {
    const response = await dentistClinic.getClinicDentistsWithTheirAppointmentSlots(clinicId, queryParams)
    if (response.hasError) {
        return []
    }
    return response.content
}

const currentlySelectedClinic = ref(null);
const currentClinicDentistsWithTheirAppointmentSlots = ref([])

async function refreshCurrentClinicDentists() {
    currentClinicDentistsWithTheirAppointmentSlots.value = await getClinicDentistsWithTheirAppointmentSlots(currentlySelectedClinic.value.id, null)
}

async function onMarkerClick(clinic) {
    currentlySelectedClinic.value = clinic;
    currentClinicDentistsWithTheirAppointmentSlots.value = await getClinicDentistsWithTheirAppointmentSlots(clinic.id, null)
}

function closeDrawer() {
    currentlySelectedClinic.value = null;
}

async function onClinicListEvent(clinic) {
    currentlySelectedClinic.value = clinic;
    currentClinicDentistsWithTheirAppointmentSlots.value = await getClinicDentistsWithTheirAppointmentSlots(clinic.id)
}

const markerTooltip = ref(null);

function onMarkerMouseOver(clinic) {
    markerTooltip.value = clinic;
}

function onMarkerMouseLeave() {
    markerTooltip.value = null;
}
</script>

<template>
  <div v-if="loaded" class="relative flex flex-row rounded">
    <VMap
      :center="mapCenter"
      :zoom="zoomLevel"
      :minZoom="5"
      :maxZoom="18"
      class="h-[calc(100vh-100px)] min-h-[calc(100vh-100px)] w-full p-0 m-0 z-30 rounded shadow-md border-[1px] border-gay-200"
    >
      <VMapTileLayer
        :url="'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'"
        :attribution="'© OpenStreetMap contributors & CARTO'"
      />
      <VMapZoomControl position="bottomleft" />

      <VMapDivMarker
        v-for="clinic in clinics"
        :key="clinic.id"
        :latlng="[clinic.address.latitude, clinic.address.longitude]"
        icon-class="relative"
        :icon-size="[45, 45]"
        :icon-anchor="[10, 23]"
        @click="() => onMarkerClick(clinic)"
        @mouseover="() => onMarkerMouseOver(clinic)"
        @mouseout="() => onMarkerMouseLeave()"
      >
        <ClinicMapMarker :markerTooltip="markerTooltip" :clinic="clinic" />
      </VMapDivMarker>
    </VMap>

    <MapFilterBox 
      @reloadDentistsData="reloadClinicsData"
      @filterDentistsData="refreshClinicsByAppointmentAvailability"
    />

    <ClinicListDrawer
      :clinics="clinics"
      @navigateToClinic="onClinicListEvent"
    />
    <ClinicDrawer
      :clinic="currentlySelectedClinic"
      :clinicDentists="currentClinicDentistsWithTheirAppointmentSlots"
      @closeDrawer="closeDrawer"
      @refreshClinicDentists="refreshCurrentClinicDentists"
    />
  </div>
</template>

<style lang="css" scoped>
.tooltip-pointer {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  z-index: 10;
}
</style>
