import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDeckStore = defineStore('deck', () => {
  // --- Composables ---
  const route = useRoute();
  const { token, data: _user } = useAuth();
  const toast = useToast();

  // --- State ---
  const isIgnoreDate = ref(false);

  // --- Getters ---
  const deckId = computed(() => {
    const id = route.query.deckId;
    return Array.isArray(id) ? id[0] : id;
  });
  console.log('🚀 ~ deckId:', deckId.value);

  // const deckSlug = computed(() => {
  //   const s = route.params.slug;
  //   return Array.isArray(s) ? s[0] : s;
  // });

  // const username = computed(() => {
  //   const n = route.params.username;
  //   return Array.isArray(n) ? n[0] : n;
  // });

  // const isOwner = computed(() => {
  //   return user.value?.username === username.value;
  // });

  // --- Define fetch composable ---
  const {
    data: deck,
    status,
    error,
    refresh: refetch,
    execute: _,
  } = useLazyFetch<DeckWithCards, ErrorResponse>(
    () => `/api/decks/${deckId.value}`,
    {
      headers: { Authorization: token.value || '' },
      server: false,
      immediate: false,
    },
  );

  // --- Actions ---
  async function fetchDeck(id?: string) {
    console.log(id);

    // if (!deckId.value || deck.value) return;

    // await execute();
    console.log('FETCH DECK SUCCESSFULLY!');
  }

  function updateCard(updatedCard: Card) {
    if (!deck.value) return;

    const index = deck.value.cards.findIndex((c) => c.id === updatedCard.id);
    if (index !== -1) {
      deck.value.cards[index] = updatedCard;
    }
  }

  // OK
  async function restartDeck() {
    if (!deckId.value) return;

    await $fetch(`/api/decks/restart/${deckId.value}`, {
      method: 'POST',
      headers: { Authorization: token.value || '' },
    })
      .then(async () => {
        await refetch();

        toast.add({
          title: 'Progress restarted.',
          description: 'You can now start learning from scratch.',
          color: 'success',
        });
      })
      .catch((err: ErrorResponse) => {
        toast.add({
          title: 'Error restarting deck.',
          description: JSON.stringify(err.data?.message || 'Unknown error.'),
          color: 'error',
        });
      });
  }

  return {
    // State
    deck,
    status,
    error,
    isIgnoreDate,

    // Getters
    deckId,
    // deckSlug,
    // username,
    // isOwner,

    // Actions
    refetch,
    fetchDeck,
    updateCard,
    restartDeck,
  };
});

// Enable HMR (Hot Module Replacement) for better DX
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeckStore, import.meta.hot));
}
