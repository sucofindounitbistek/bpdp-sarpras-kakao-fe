<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="class"
    aria-hidden="true"
  >
    <!-- Siluet buah kakao lonjong berujung lancip dengan tekstur alur memanjang dan tangkai -->
    <path d="M4.5 16.5c2-6 7.5-11.5 13-11.5s5 3 2 9-9.5 9-13 7.5z" />
    <path d="M7.5 14.5c1.5-4 5-8.5 9-9.5" />
    <path d="M10.5 17.5c2-3.5 5.5-6.5 8-6.5" />
    <path d="M18.5 5l2.5-2.5" />
  </svg>
</template>
