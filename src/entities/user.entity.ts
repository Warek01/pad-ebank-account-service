import {
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { Card } from './card.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ length: 255 })
  email: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 255 })
  password: string;

  @OneToOne(() => Card, (card) => card.user)
  card: Relation<Card>;
}
