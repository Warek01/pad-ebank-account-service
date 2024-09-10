import { Injectable } from '@nestjs/common';

import { Card, User } from '@ebank-account/entities';

@Injectable()
export class CardService {
  constructor() {}

  createCard(user: User) {
    const card = new Card();

    card.cvv = Math.random().toString().slice(-4, -1);
    card.code = Array(4)
      .fill(0)
      .map(() => Math.random().toString().slice(-5, -1))
      .join(' ');
    card.user = user;

    return card;
  }
}
