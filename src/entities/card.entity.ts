import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { Currency } from '@/enums/currency.enum';
import { User } from '@/entities/user.entity';

@Entity('cards')
export class Card {
  @PrimaryColumn({ length: 255 })
  code: string;

  @Column({ length: 3 })
  cvv: string;

  @Column({ type: 'enum', enum: Currency, enumName: 'currency' })
  currency: Currency = Currency.Usd;

  @Column({ type: 'double precision' })
  currencyAmount: number = 0;

  @Column()
  isBlocked: boolean = false;

  @Column({
    name: 'created_at',
    type: 'timestamp without time zone',
  })
  createdAt: Date = new Date();

  @OneToOne(() => User, (user) => user.card)
  @JoinColumn()
  user: Relation<User>;
}
