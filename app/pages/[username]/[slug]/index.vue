<script setup lang="ts">
import type {
  DropdownMenuItem,
  FormErrorEvent,
  FormSubmitEvent,
} from '@nuxt/ui';
import { CardStatus } from '~/utils/enums';
import { formatDistanceToNowStrict } from 'date-fns';
import { DeckWithCardsSchema } from '~~/shared/types/deck';

// --- Hooks ---
const toast = useToast();
const router = useRouter();
const route = useRoute();
const { token, data: user } = useAuth();

// --- Form State ---

const formErrorMsg = ref('');
const isEditing = ref(false);
const isSaving = ref(false);
const form = useTemplateRef('form');

const deckState = reactive<Partial<DeckWithCards>>({});

// --- Learning State ---
const isFlipped = ref(false);
const shortcutPressed = ref(false);
const correctAnswersCount = ref(0);
const flashcard = ref<Card | undefined>(undefined);

const learnState = reactive<FlashcardState>({
  totalCards: 0,
  queue: [],
  answers: [],
  retryQueue: [],
});

// --- Computed Properties ---

const deckId = computed(() => {
  const q = route.query.deckId;

  return Array.isArray(q) ? q[0] : q;
});

const deckSlug = computed(() => {
  const slug = route.params.slug;

  return Array.isArray(slug) ? slug[0] : slug;
});

const progress = computed(() => {
  if (!learnState.totalCards) return 0;

  return (correctAnswersCount.value / learnState.totalCards) * 100;
});

const DeckSettingOptions = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil-line',
      disabled: isEditing.value,
      onSelect: startEditing,
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: onDeckDelete,
    },
  ],
]);

const StudyOptions = computed(() => [
  {
    label: 'Flashcards',
    icon: 'i-lucide-file-plus',
    to: `/${user.value?.username}/${deckSlug.value}/flashcards?deckId=${deckId.value}`,
  },
  {
    label: 'Learn',
    icon: 'i-lucide-book-marked',
    to: `/${user.value?.username}/${deckSlug.value}/learn?deckId=${deckId.value}`,
  },
  {
    label: 'Test',
    icon: 'i-lucide-book-check',
    to: `/${user.value?.username}/${deckSlug.value}/test?deckId=${deckId.value}`,
  },
  {
    label: 'Comming soon',
    icon: '',
    to: `#`,
  },
]);

// --- Fetching Data ---

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
    resetFormState(newRes);

    shortcutPressed.value = false;
    correctAnswersCount.value = 0;
    learnState.answers = [];
    learnState.retryQueue = [];
    learnState.queue = structuredClone(newRes.cards).filter(
      (c) => !c.nextReviewDate || Date.parse(c.nextReviewDate) < Date.now(),
    );
    learnState.totalCards = learnState.queue.length;
    flashcard.value = learnState.queue.shift();

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

if (fetchStatus.value === 'error') {
}

// --- Form Functions ---

function startEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  resetFormState(res.value);
  form.value?.clear();
  formErrorMsg.value = '';

  toast.add({
    title: 'Editing canceled successfully.',
    color: 'success',
    duration: 2000,
  });
}

function resetFormState(newRes?: DeckWithCards) {
  if (newRes) {
    deckState.name = newRes.name;
    deckState.description = newRes.description || '';
    deckState.cards = structuredClone(newRes.cards);
  }
}

function addCardFirst() {
  deckState.cards?.unshift({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    correctCount: 0,
    nextReviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added first successfully.',
    color: 'success',
    duration: 2000,
  });
}

function addCardLast() {
  deckState.cards?.push({
    id: `temp ${crypto.randomUUID()}` as UUID,
    term: '',
    definition: '',
    correctCount: 0,
    nextReviewDate: undefined,
    status: CardStatus.NEW,
  });

  toast.add({
    title: 'Added last successfully.',
    color: 'success',
    duration: 2000,
  });
}

function deleteCard(cardId?: UUID) {
  deckState.cards = deckState.cards?.filter((c) => c.id !== cardId);
}

async function onDeckDelete() {
  $fetch(`/api/decks/${deckId.value}`, {
    method: 'DELETE',
    headers: {
      Authorization: token.value || '',
    },
  })
    .then(() => {
      router.push(`/home`);
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error deleting deck',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });
    });
}

async function onSubmit(event: FormSubmitEvent<DeckWithCards>) {
  if (isSaving.value) return;
  isSaving.value = true;

  $fetch(`/api/decks/${deckId.value}`, {
    method: 'PATCH',
    headers: {
      Authorization: token.value || '',
    },
    body: event.data,
  })
    .then(async () => {
      isEditing.value = false;
      await refreshDeckData();

      toast.add({
        title: 'Changes saved successfully.',
        color: 'success',
        duration: 2000,
      });
    })
    .catch((error: ErrorResponse) => {
      toast.add({
        title: 'Error saving changes',
        description: JSON.stringify(error.data || 'Unknown error'),
        color: 'error',
        duration: 2000,
      });

      return;
    })
    .finally(() => {
      formErrorMsg.value = '';
      isSaving.value = false;
    });
}

async function onError(event: FormErrorEvent) {
  const formError = event.errors.find((e) => e.name === '');

  formErrorMsg.value = formError
    ? formError.message
    : 'Please fill in all required fields.';
}

// --- Learning Logic Functions ---

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
  isCorrect ? correctAnswersCount.value++ : learnState.retryQueue.push(updated);

  // handle answers
  const index = learnState.answers.findIndex((a) => a.id === updated.id);
  if (index !== -1) {
    learnState.answers[index] = updated;
  } else {
    learnState.answers.push(updated);
  }

  // handle flashcards
  if (!learnState.queue.length) {
    if (!learnState.retryQueue.length) {
      flashcard.value = undefined;
      return;
    }

    learnState.queue = learnState.retryQueue;
    learnState.retryQueue = [];
  }

  // next flashcard
  flashcard.value = learnState.queue.shift();
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

async function ignoreNextReviewDate() {
  await refreshDeckData();
  learnState.queue = structuredClone(res.value?.cards || []);
  learnState.totalCards = learnState.queue.length;
  flashcard.value = learnState.queue.shift();
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
  <SkeletonDeckDetailPage
    v-if="fetchStatus === 'pending' || fetchStatus === 'idle'"
  />

  <UPage v-else>
    <UContainer>
      <UButton
        to="/home"
        class="hover:text-primary mt-2 cursor-pointer px-0 text-base hover:underline"
        variant="link"
        icon="i-lucide-move-left"
        label="Back to home"
      />

      <UForm
        :schema="DeckWithCardsSchema"
        :state="deckState"
        ref="form"
        @submit="onSubmit"
        @error="onError"
      >
        <UPageHeader :ui="{ title: 'flex-1' }" class="py-0 pb-8">
          <div class="mt-4 flex flex-col-reverse gap-4 lg:flex-col">
            <!-- Learning Options -->
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <UButton
                v-for="{ label, icon, to } in StudyOptions"
                :key="label"
                :to="to"
                class="flex place-content-center place-items-center py-3 hover:scale-102 hover:shadow"
                variant="subtle"
              >
                <UIcon :name="icon" class="size-5" />

                <h3 class="truncate text-lg font-medium">{{ label }}</h3>
              </UButton>
            </div>

            <!-- Flashcard Study -->
            <div v-if="flashcard" class="flex flex-col gap-2">
              <UProgress v-model="progress" :ui="{ base: 'bg-elevated' }" />

              <UCard
                :ui="{
                  body: 'grow flex place-items-center text-left text-2xl font-semibold px-6 sm:px-12 sm:text-3xl',
                }"
                variant="soft"
                class="bg-elevated flex min-h-[50dvh] w-full flex-col place-items-center divide-none text-center shadow-md"
                @click="throttledToggleFlip"
              >
                {{ !isFlipped ? flashcard?.term : flashcard?.definition }}
              </UCard>

              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <UButton
                  :to="`/${user?.username}`"
                  variant="link"
                  color="neutral"
                  class="w-fit p-0"
                >
                  <div class="flex place-items-center gap-2">
                    <UAvatar :src="user?.avatarUrl || ''" size="xl" />

                    <div class="flex flex-col">
                      <p class="text-muted text-sm font-normal text-pretty">
                        Created by
                      </p>

                      <p class="text-highlighted text-base font-medium">
                        {{ user?.username }}
                      </p>
                    </div>
                  </div>
                </UButton>

                <div
                  class="order-first col-span-full flex place-content-center place-items-center gap-3 sm:order-0 sm:col-span-1"
                >
                  <UButton
                    label="Skip"
                    icon="i-heroicons-x-mark"
                    size="lg"
                    variant="subtle"
                    color="error"
                    class="cursor-pointer transition-transform hover:shadow active:scale-90"
                    @click="throttledHandleAnswer(false)"
                  />

                  <UButton
                    label="Next"
                    icon="i-heroicons-check"
                    size="lg"
                    variant="subtle"
                    class="cursor-pointer transition-transform hover:shadow active:scale-90"
                    @click="throttledHandleAnswer(true)"
                  />
                </div>

                <div class="flex place-content-end place-items-center gap-2">
                  <UButton
                    class="cursor-pointer"
                    color="neutral"
                    icon="i-lucide-shuffle"
                    variant="ghost"
                    size="lg"
                  />

                  <UDropdownMenu :items="DeckSettingOptions">
                    <UButton
                      class="cursor-pointer"
                      color="neutral"
                      icon="i-lucide-settings"
                      variant="ghost"
                      size="lg"
                    />
                  </UDropdownMenu>
                </div>
              </div>

              <div
                v-if="!shortcutPressed"
                class="hidden w-full place-content-center place-items-center gap-2 rounded-md p-2 text-current sm:px-4 lg:flex"
              >
                <span
                  class="inline-flex place-content-center place-items-center gap-2 rounded-md border border-current px-2 py-0.5 font-bold"
                >
                  <UIcon class="size-5" name="i-lucide-keyboard" />
                  <span>Shortcuts</span>
                </span>

                Press <Kbd label="Space" /> to flip,
                <Kbd :icon="{ name: 'i-lucide-move-right' }" /> to move next,
                <Kbd :icon="{ name: 'i-lucide-move-left' }" /> to skip.
              </div>
            </div>

            <!-- Finished component -->
            <UEmpty
              v-else
              :actions="[
                {
                  to: '/home',
                  icon: 'i-lucide-house',
                  label: 'Home',
                  color: 'success' as const,
                  variant: 'subtle' as const,
                  class: 'cursor-pointer hover:scale-102 hover:shadow',
                },
                {
                  icon: 'i-lucide-fast-forward',
                  label: 'Ignore & continue',
                  color: 'neutral' as const,
                  variant: 'subtle' as const,
                  class: 'cursor-pointer hover:scale-102 hover:shadow',
                  onClick: ignoreNextReviewDate,
                },
                {
                  icon: 'i-lucide-refresh-cw',
                  label: 'Refresh progress',
                  color: 'error' as const,
                  variant: 'outline' as const,
                  class: 'cursor-pointer hover:scale-102 hover:shadow',
                  onClick: refreshDeckProgress,
                },
              ]"
              variant="naked"
              icon="i-lucide-party-popper"
              title="You're all caught up — nothing to review now."
              description="Optimize your retention by strictly adhering to the next review date."
              size="xl"
            />
          </div>

          <!-- Title and Description -->
          <template #title>
            <UFormField name="name">
              <UInput
                v-model="deckState.name"
                :disabled="!isEditing"
                :ui="{
                  base: `${!isEditing ? 'p-0' : ''} text-highlighted text-2xl font-bold text-pretty sm:text-3xl disabled:opacity-100 disabled:cursor-default`,
                }"
                :variant="isEditing ? 'subtle' : 'ghost'"
                class="w-full"
                autoresize
              />
            </UFormField>

            <UFormField
              :class="`${isEditing ? 'mt-3' : ''}`"
              name="description"
            >
              <UTextarea
                v-model="deckState.description"
                :rows="1"
                :maxrows="10"
                :disabled="!isEditing"
                :ui="{
                  base: `${!isEditing ? 'p-0' : ''} text-muted text-base font-normal text-pretty disabled:opacity-100 disabled:cursor-default`,
                }"
                :variant="isEditing ? 'subtle' : 'ghost'"
                class="w-full"
                autoresize
              />
            </UFormField>
          </template>
        </UPageHeader>

        <UPageBody class="mt-4">
          <div class="flex flex-col gap-4">
            <div class="flex place-content-between place-items-center gap-4">
              <h2
                class="flex place-items-center gap-1 text-xl font-bold text-pretty sm:text-2xl"
              >
                Terms ({{ deckState.cards?.length || 0 }})

                <UIcon
                  v-if="!learnState.answers.length"
                  class="text-success size-6"
                  name="i-lucide-check"
                />

                <span
                  v-else
                  class="ml-2 place-self-end-safe text-base font-normal text-current/75 sm:text-lg"
                >
                  Saving...
                </span>
              </h2>

              <div v-if="isEditing" class="flex gap-2 place-self-end">
                <UButton
                  class="cursor-pointer"
                  label="Cancel"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="outline"
                  :disabled="isSaving"
                  @click="cancelEditing"
                />

                <UButton
                  :loading="isSaving"
                  :label="isSaving ? 'Saving...' : 'Save Changes'"
                  class="cursor-pointer"
                  color="primary"
                  icon="i-lucide-save"
                  loading-icon="i-lucide-loader-circle"
                  type="submit"
                />
              </div>
            </div>

            <UAlert
              v-if="formErrorMsg"
              icon="i-lucide-alert-triangle"
              color="error"
              variant="soft"
              title="Validation Error"
              :description="formErrorMsg"
            />

            <UButton
              v-if="isEditing"
              :disabled="isSaving"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardFirst"
            />

            <TransitionGroup name="list" appear>
              <UCard
                v-for="(c, index) in deckState.cards"
                :key="c.id"
                variant="subtle"
              >
                <div
                  :class="`mb-1 flex place-content-between place-items-center gap-2 ${isEditing ? 'px-0' : 'px-2.5'}`"
                >
                  <UBadge
                    :label="c.status"
                    :color="
                      {
                        known: 'success' as const,
                        learning: 'warning' as const,
                        new: 'info' as const,
                      }[c.status]
                    "
                    class="capitalize"
                    variant="subtle"
                  />

                  <UButton
                    v-if="isEditing"
                    class="cursor-pointer"
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    @click="deleteCard(c.id)"
                  />

                  <span
                    v-else-if="
                      !isEditing &&
                      c.nextReviewDate &&
                      c.status === CardStatus.KNOWN
                    "
                    class="text-right text-sm text-balance"
                  >
                    Next review

                    {{
                      formatDistanceToNowStrict(c.nextReviewDate, {
                        addSuffix: true,
                        unit: 'day',
                        roundingMethod: 'ceil',
                      })
                    }}
                  </span>
                </div>

                <div class="flex flex-col sm:flex-row">
                  <UFormField class="sm:flex-1" :name="`cards.${index}.term`">
                    <UTextarea
                      v-model="c.term"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-lg sm:text-xl disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>

                  <USeparator class="m-2 sm:hidden" />

                  <USeparator
                    orientation="vertical"
                    class="m-2 hidden h-auto sm:block"
                  />

                  <UFormField
                    class="sm:flex-1"
                    :name="`cards.${index}.definition`"
                  >
                    <UTextarea
                      v-model="c.definition"
                      :rows="1"
                      :maxrows="10"
                      :disabled="!isEditing"
                      :ui="{
                        base: 'text-lg sm:text-xl disabled:opacity-100 disabled:cursor-default',
                      }"
                      :variant="isEditing ? 'outline' : 'ghost'"
                      class="w-full"
                      autoresize
                    />
                  </UFormField>
                </div>
              </UCard>
            </TransitionGroup>

            <UButton
              v-if="isEditing"
              :disabled="isSaving"
              class="cursor-pointer place-self-center px-4"
              label="Add a card"
              icon="i-lucide-plus"
              variant="subtle"
              size="xl"
              @click="addCardLast"
            />

            <div v-if="isEditing" class="flex gap-2 place-self-end">
              <UButton
                class="cursor-pointer"
                label="Cancel"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                :disabled="isSaving"
                @click="cancelEditing"
              />

              <UButton
                :loading="isSaving"
                :label="isSaving ? 'Saving...' : 'Save Changes'"
                class="cursor-pointer"
                color="primary"
                icon="i-lucide-save"
                loading-icon="i-lucide-loader-circle"
                type="submit"
              />
            </div>
          </div>
        </UPageBody>
      </UForm>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
