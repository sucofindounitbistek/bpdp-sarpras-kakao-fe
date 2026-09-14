<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { LOCALIZATION } from '@/config/localization';

const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card custom-class="w-full max-w-md text-center p-8">
      <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-4">
        🚫
      </div>
      <h1 class="text-2xl font-semibold text-slate-900 font-apple-display-md mb-2">
        {{ LOCALIZATION.accessDenied.title }}
      </h1>
      <p class="text-sm text-slate-500 font-apple-caption mb-6">
        {{ LOCALIZATION.accessDenied.description }}
      </p>
      <Button variant="primary" @click="router.push('/dashboard')" custom-class="w-full">
        {{ LOCALIZATION.accessDenied.button }}
      </Button>
    </Card>
  </div>
</template>
