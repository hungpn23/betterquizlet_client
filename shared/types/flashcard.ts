import type { Card, CardAnswer } from './card';

export type FlashcardState = {
  totalCards: number;
  queue: Card[];
  answers: CardAnswer[];
  retryQueue: Card[];
};
