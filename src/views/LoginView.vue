<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { loginSchema } from '@/schemas/auth.schema';
import Card from '@/components/ui/Card.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import { LOCALIZATION } from '@/config/localization';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  email: '',
  password: '',
});

const errors = ref<Record<string, string>>({});
const isLoading = ref(false);

const handleSSOLogin = () => {
  const iamUrl = import.meta.env.VITE_IAM_FRONTEND_URL || 'https://bpdp-iam-dev.scitechnology.id';
  window.location.href = `${iamUrl}/login`;
};

const handleLogin = async () => {
  errors.value = {};
  const validation = loginSchema.safeParse(form.value);

  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!errors.value[field]) {
        errors.value[field] = issue.message;
      }
    });
    toast.error(LOCALIZATION.login.toast.validationError, LOCALIZATION.login.toast.validationTitle);
    return;
  }

  isLoading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    authStore.setAuth('sample-jwt-token-12345', {
      id: '1',
      name: 'Administrator Kelapa',
      email: form.value.email,
      role: 'PEMOHON',
    });

    toast.success(LOCALIZATION.login.toast.loginSuccess, LOCALIZATION.login.toast.loginTitle);
    router.push('/dashboard');
  } catch (err: any) {
    toast.error(err.message || LOCALIZATION.login.toast.loginError, LOCALIZATION.login.toast.loginErrorTitle);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card custom-class="w-full max-w-md shadow-xl">
      <template #header>
        <div class="flex flex-col items-center text-center gap-1">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#066C2A] font-bold text-xl mb-2">
            🍃
          </div>
          <h1 class="text-2xl font-semibold text-slate-900 font-apple-display-lg">
            {{ LOCALIZATION.login.page.title }}
          </h1>
          <p class="text-sm text-slate-500 font-apple-caption">
            {{ LOCALIZATION.login.page.subtitle }}
          </p>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <Button
          type="button"
          variant="primary"
          size="lg"
          @click="handleSSOLogin"
          custom-class="w-full bg-[#066C2A] hover:bg-[#055722] text-white flex items-center justify-center gap-2 shadow-md"
        >
          <span>🔐</span> Masuk dengan Akun BPDP IAM
        </Button>

        <div class="relative my-1">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-white px-2 text-slate-400">Atau masuk dengan kredensial lokal</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <Input
            id="email"
            :label="LOCALIZATION.login.form.email.label"
            type="email"
            v-model="form.email"
            :placeholder="LOCALIZATION.login.form.email.placeholder"
            required
            :error="errors.email"
          />

          <Input
            id="password"
            :label="LOCALIZATION.login.form.password.label"
            type="password"
            v-model="form.password"
            :placeholder="LOCALIZATION.login.form.password.placeholder"
            required
            :error="errors.password"
          />

          <Button
            type="submit"
            variant="outline"
            size="lg"
            :loading="isLoading"
            custom-class="w-full mt-2"
          >
            {{ LOCALIZATION.login.form.submit }}
          </Button>
        </form>
      </div>
    </Card>
  </div>
</template>
