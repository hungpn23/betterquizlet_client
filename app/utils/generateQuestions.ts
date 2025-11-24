export default (
  cards: Card[],
  types: QuestionType[],
  dir: QuestionDirection,
): Question[] => {
  if (cards.length < 4) return [];

  const questions: Question[] = [];

  for (const card of cards) {
    const random = Math.random();
    const type = types[Math.floor(random * types.length)]!;

    let direction: QuestionDirection;
    if (dir === 'both') {
      direction = random < 0.5 ? 'term_to_def' : 'def_to_term';
    } else {
      direction = dir;
    }

    const isTermToDef = direction === 'term_to_def';

    let question: string;
    let answer: string;
    if (isTermToDef) {
      question = card.term;
      answer = card.definition;
    } else {
      question = card.definition;
      answer = card.term;
    }

    let choices: string[] | undefined;
    let correctChoiceIndex: number | undefined;
    if (type === 'multiple_choices') {
      const result = [answer];

      const others = cards.filter((c) => c.id !== card.id);
      const shuffledOthers = shuffle(others);

      for (let i = 0; i < 3; i++) {
        const distractor = shuffledOthers[i]!;

        const distractorAnswer = isTermToDef
          ? distractor.definition
          : distractor.term;

        result.push(distractorAnswer);
      }

      choices = shuffle(result);
      correctChoiceIndex = choices.indexOf(answer);
    }

    questions.push({
      id: card.id,
      streak: card.streak,
      reviewDate: card.reviewDate,
      type,
      direction,
      question,
      answer,
      choices,
      correctChoiceIndex,
    });
  }

  return questions;
};
