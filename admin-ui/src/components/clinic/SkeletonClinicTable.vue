<script lang="js">
export default {
    data() {
        return {
            skeletonRows: 5
        }
    }
}
</script>

<template>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 animate-pulse">
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
          <tr v-for="row in skeletonRows" :key="row" class="bg-white border-b">
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-12"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-40"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-56"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-32"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>