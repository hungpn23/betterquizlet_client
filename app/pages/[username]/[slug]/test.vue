<script setup lang="ts">
const deckState = reactive<Partial<DeckWithCards>>({});

const isFlipped = ref(false);
const shortcutPressed = ref(false);
const correctAnswersCount = ref(0);
const flashcard = ref<Card | undefined>(undefined);

const learnState = reactive<FlashcardState>({
  totalCards: 0,
  flashcards: [],
  answers: [],
  retryCards: [],
});

const progress = computed(() => {
  if (!learnState.totalCards) return 0;

  return (correctAnswersCount.value / learnState.totalCards) * 100;
});

const deckId = computed(() => {
  const q = useRoute().query.deckId;

  return Array.isArray(q) ? q[0] : q;
});

const toast = useToast();
const router = useRouter();
const { token, data: user } = useAuth();
const {
  data: res,
  error,
  status: fetchStatus,
  refresh: refreshDeckData,
} = await useLazyFetch<DeckWithCards, ErrorResponse>(
  `/api/decks/${deckId.value}`,
  {
    headers: {
      Authorization: token.value || '',
    },
    server: false,
  },
);

// --- Watchers ---

watch(res, (newRes) => {
  if (newRes) {
    shortcutPressed.value = false;
    correctAnswersCount.value = 0;
    learnState.answers = [];
    learnState.retryCards = [];
    // learnState.flashcards = structuredClone(newRes.cards).filter(
    //   (c) => !c.nextReviewDate || Date.parse(c.nextReviewDate) < Date.now(),
    // );
    learnState.flashcards = structuredClone(newRes.cards);
    learnState.totalCards = learnState.flashcards.length;
    flashcard.value = learnState.flashcards.shift();

    console.log('🔥🔥🔥 flashcard.value', flashcard.value);

    toast.add({
      title: 'Flashcard data initialized successfully.',
      color: 'success',
      duration: 2000,
    });
  }
});

watch(flashcard, () => {
  isFlipped.value = false;
});

watch(fetchStatus, (newStatus) => {
  if (newStatus === 'error') {
    toast.add({
      title: 'Error fetching decks',
      description: JSON.stringify(error.value?.data || 'Unknown error'),
      color: 'error',
      duration: 2000,
    });
  }
});

watchDebounced(learnState, saveAnswers, {
  debounce: 1000,
  maxWait: 3000,
  deep: true,
});

function toggleFlip() {
  if (!flashcard.value) return;
  if (!shortcutPressed.value) shortcutPressed.value = true;

  isFlipped.value = !isFlipped.value;
}

function handleAnswer(isCorrect: boolean) {
  if (!flashcard.value) return;

  const updated = Object.assign(
    {},
    flashcard.value,
    calcCardState({
      ...flashcard.value,
      isCorrect,
    }),
  );

  // handle isCorrect & retryCards
  isCorrect ? correctAnswersCount.value++ : learnState.retryCards.push(updated);

  // handle answers
  const index = learnState.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learnState.answers[index] = updated;
  } else {
    learnState.answers.push(updated);
  }

  // handle flashcards
  if (!learnState.flashcards.length) {
    if (!learnState.retryCards.length) {
      flashcard.value = undefined;
      return;
    }

    learnState.flashcards = learnState.retryCards;
    learnState.retryCards = [];
  }

  // next flashcard
  flashcard.value = learnState.flashcards.shift();
}

async function refreshDeckProgress() {
  $fetch(`/api/decks/refresh/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
  })
    .then(async () => {
      await refreshDeckData();

      toast.add({
        title: 'refreshDeckProgress successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error refreshing deck!',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    });
}

async function saveAnswers() {
  if (learnState.answers.length === 0) return;

  $fetch(`/api/study/save-answer/${deckId.value}`, {
    method: 'POST',
    headers: {
      Authorization: token.value || '',
    },
    body: { answers: learnState.answers },
  })
    .then(() => {
      const map = new Map(learnState.answers.map((a) => [a.id, a]));

      if (deckState.cards?.length) {
        for (const c of deckState.cards) {
          const answer = map.get(c.id);

          if (answer) {
            Object.assign(c, {
              ...answer,
              status: calcCardStatus(answer.nextReviewDate),
            });
          }
        }
      }

      learnState.answers = [];

      toast.add({
        title: 'Auto saveAnswers successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      console.error('Failed to save answers:', error.data);
    });
}

// --- Shortcuts/Side Effects ---

const throttledToggleFlip = useThrottleFn(toggleFlip, 200);
const throttledHandleAnswer = useThrottleFn(handleAnswer, 200);

defineShortcuts({
  ' ': throttledToggleFlip,
  arrowright: () => throttledHandleAnswer(true),
  arrowleft: () => throttledHandleAnswer(false),
});
</script>

<template>
  <UContainer>
    <div v-if="flashcard" class="mt-6 flex flex-col gap-2 sm:mt-12">
      <UProgress v-model="progress" />

      <UCard
        :ui="{
          body: 'grow flex place-items-center text-left text-2xl font-semibold px-6 sm:px-12 sm:text-3xl',
        }"
        variant="soft"
        class="bg-elevated flex min-h-[60dvh] w-full flex-col place-items-center divide-none text-center"
        @click="throttledToggleFlip"
      >
        {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
      </UCard>

      <div class="flex place-content-center place-items-center gap-3">
        <UButton
          label="Skip"
          icon="i-heroicons-x-mark"
          size="lg"
          variant="subtle"
          color="error"
          class="cursor-pointer transition-transform duration-200 ease-in-out active:scale-90"
          @click="throttledHandleAnswer(false)"
        />

        <UButton
          label="Next"
          icon="i-heroicons-check"
          size="lg"
          variant="subtle"
          class="cursor-pointer transition-transform active:scale-95"
          @click="throttledHandleAnswer(true)"
        />
      </div>

      <div
        v-if="!shortcutPressed"
        class="flex w-full place-content-center place-items-center gap-2 rounded-md p-2 text-current sm:px-4"
      >
        <span
          class="hidden place-content-center place-items-center gap-2 rounded-md border border-current px-2 py-0.5 font-bold sm:inline-flex"
        >
          <UIcon class="size-5" name="i-lucide-keyboard" />
          <span>Shortcuts</span>
        </span>

        Press <Kbd label="Space" /> to flip,
        <Kbd :icon="{ name: 'i-lucide-move-right' }" /> to move next,
        <Kbd :icon="{ name: 'i-lucide-move-left' }" /> to skip.
      </div>
    </div>
  </UContainer>
</template>
