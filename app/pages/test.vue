<script setup lang="ts">
// --- Props Interface ---
interface Props {
  knowCount: number;
  learningCount: number;
  termsLeft: number;
}

const props = withDefaults(defineProps<Props>(), {
  knowCount: 34,
  learningCount: 15,
  termsLeft: 0,
});

// --- Emits ---
defineEmits<{
  (e: 'back'): void;
  (e: 'practice'): void;
  (e: 'focus'): void;
  (e: 'restart'): void;
}>();

// --- Computed Logic cho Biểu đồ tròn (Donut Chart) ---
const total = computed(
  () => props.knowCount + props.learningCount + props.termsLeft,
);
const percent = computed(() =>
  total.value === 0 ? 0 : Math.round((props.knowCount / total.value) * 100),
);

// Cấu hình SVG Circle
const radius = 40;
const circumference = 2 * Math.PI * radius;

// Tính toán độ dài nét vẽ (stroke) cho phần "Know" (Màu xanh)
const knowOffset = computed(() => {
  const progress = props.knowCount / total.value;
  return circumference - progress * circumference;
});

// Tính toán độ dài nét vẽ cho phần "Learning" (Màu cam)
// Vẽ đè lên hoặc nối tiếp, ở đây ta dùng cách vẽ layer: Background -> Learning -> Know
const learningOffset = computed(() => {
  const progress = (props.knowCount + props.learningCount) / total.value;
  return circumference - progress * circumference;
});
</script>

<template>
  <div
    class="flex min-h-screen w-full place-items-center justify-center bg-[#0a092d] p-6 text-white"
  >
    <div class="w-full max-w-4xl">
      <div class="mb-10 flex items-start justify-between">
        <h1 class="text-3xl font-bold sm:text-4xl">
          Amazing! You're almost there.
        </h1>
        <div class="hidden sm:block">
          <UIcon
            name="i-lucide-party-popper"
            class="h-16 w-16 -rotate-12 text-yellow-300"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-200">How you're doing</h2>

          <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              class="relative flex h-32 w-32 shrink-0 items-center justify-center"
            >
              <svg
                class="h-full w-full -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  :r="radius"
                  fill="transparent"
                  stroke="#1e293b"
                  stroke-width="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  :r="radius"
                  fill="transparent"
                  stroke="#f97316"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="learningOffset"
                  class="transition-all duration-1000 ease-out"
                />
                <circle
                  cx="50"
                  cy="50"
                  :r="radius"
                  fill="transparent"
                  stroke="#34d399"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="knowOffset"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <span class="absolute text-2xl font-bold">{{ percent }}%</span>
            </div>

            <div class="flex w-full flex-col gap-3">
              <div
                class="flex items-center justify-between rounded bg-[#112e33] px-4 py-3 font-medium text-[#34d399]"
              >
                <span>Know</span>
                <span class="font-bold">{{ knowCount }}</span>
              </div>

              <div
                class="flex items-center justify-between rounded bg-[#382015] px-4 py-3 font-medium text-[#fb923c]"
              >
                <span>Still learning</span>
                <span class="font-bold">{{ learningCount }}</span>
              </div>

              <div
                class="flex items-center justify-between rounded bg-[#1e293b] px-4 py-3 font-medium text-gray-400"
              >
                <span>Terms left</span>
                <span class="font-bold">{{ termsLeft }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h2 class="text-xl font-semibold text-gray-200">Next steps</h2>

          <UButton
            size="xl"
            block
            color="primary"
            variant="solid"
            class="rounded-full bg-[#4255ff] py-4 text-base font-bold text-white hover:bg-[#3b4ce6]"
            @click="$emit('practice')"
          >
            <template #leading>
              <UIcon name="i-lucide-rotate-cw" class="h-5 w-5" />
            </template>
            Practice with questions
          </UButton>

          <UButton
            size="xl"
            block
            color="neutral"
            variant="solid"
            class="rounded-full bg-[#2e3856] py-4 text-base font-bold text-white ring-0 hover:bg-[#3a4666]"
            @click="$emit('focus')"
          >
            Focus on {{ learningCount }} Still learning cards
          </UButton>

          <div class="mt-2 flex justify-center">
            <UButton
              variant="link"
              label="Restart Flashcards"
              class="font-semibold text-gray-200 hover:text-white"
              @click="$emit('restart')"
            />
          </div>
        </div>
      </div>

      <div class="mt-12">
        <UButton
          variant="ghost"
          class="p-0 text-gray-300 hover:bg-transparent hover:text-white"
          @click="$emit('back')"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-left" />
          </template>
          Back to last question
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom colors overrides nếu Tailwind config chưa có */
</style>
