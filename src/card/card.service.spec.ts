import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { Card, User } from '@/entities';

describe('CardService', () => {
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a card for a user', () => {
    const mockUser: User = {
      email: 'test@gmail.com',
      fullName: 'Test User',
      password: 'test',
      createdAt: new Date('2024-11-20T13:18:00Z'),
      card: null!,
    };
    const card = service.createCard(mockUser);

    expect(card).toBeInstanceOf(Card);
    expect(card.user).toEqual(mockUser);
    expect(card.cvv).toHaveLength(3);
    expect(card.code.split(' ').length).toBe(4);
  });
});
