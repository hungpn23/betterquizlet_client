import { CardStatus } from './enums';

export default (reviewDate?: string) => {
  const today = new Date();

  if (!reviewDate) {
    return CardStatus.NEW;
  } else if (new Date(reviewDate) > today) {
    return CardStatus.KNOWN;
  } else {
    return CardStatus.LEARNING;
  }
};
