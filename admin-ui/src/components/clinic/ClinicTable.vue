<script lang="js">
export default {
    props: {
        clinics: {
            type: Array,
            default: []
        }
    }
}
</script>

<template>
  <div class="p-6 relative overflow-x-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3">ID</th>
          <th scope="col" class="px-6 py-3">Name</th>
          <th scope="col" class="px-6 py-3">Description</th>
          <th scope="col" class="px-6 py-3">Address</th>
          <th scope="col" class="px-6 py-3">Country</th>
          <th scope="col" class="px-6 py-3">Email</th>
          <th scope="col" class="px-6 py-3">Phone Number</th>
          <th scope="col" class="px-6 py-3">Coordinates</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!clinics.length">
          <td class="p-4 text-center" colspan="8">No clinics were added yet</td>
        </tr>
        <tr v-else v-for="clinic in clinics" class="bg-white border-b">
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
          >
            {{ clinic.id }}
          </th>
          <td class="px-6 py-4">{{ clinic.name }}</td>
          <td class="px-6 py-4">{{ clinic.description }}</td>
          <td class="px-6 py-4">
            {{ clinic.address.street }} {{ clinic.address.city }}
            {{ clinic.address.postal_code }}
          </td>
          <td class="px-6 py-4">{{ clinic.address.country }}</td>
          <td class="px-6 py-4">{{ clinic.contact.email }}</td>
          <td class="px-6 py-4">{{ clinic.contact.phone_number }}</td>
          <td class="px-6 py-4">
            {{ clinic.address.longitude }}; {{ clinic.address.latitude }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
