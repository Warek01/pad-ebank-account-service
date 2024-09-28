import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { User } from './user.entity';
import { Currency } from '@/generated/proto/shared';

@Entity('cards')
export class Card {
  @PrimaryColumn({ length: 255 })
  code: string;

  @Column({ length: 3 })
  cvv: string;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency = Currency.USD;

  @Column({ type: 'double precision' })
  currencyAmount: number = 0;

  @Column()
  isBlocked: boolean = false;

  @OneToOne(() => User, (user) => user.card)
  @JoinColumn()
  user: Relation<User>;
}
