import { ref, computed } from 'vue';

export function useFormWizard(totalSteps: number, validateStep?: (stepIndex: number) => boolean | Promise<boolean>) {
  const currentStepIndex = ref(0);

  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === totalSteps - 1);
  const currentStep = computed(() => currentStepIndex.value + 1);

  async function goNext() {
    if (validateStep) {
      const isValid = await validateStep(currentStepIndex.value);
      if (!isValid) return false;
    }
    if (!isLastStep.value) {
      currentStepIndex.value++;
      return true;
    }
    return false;
  }

  function goBack() {
    if (!isFirstStep.value) {
      currentStepIndex.value--;
      return true;
    }
    return false;
  }

  function goToStep(index: number) {
    if (index >= 0 && index < totalSteps) {
      currentStepIndex.value = index;
    }
  }

  return {
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStep,
  };
}
