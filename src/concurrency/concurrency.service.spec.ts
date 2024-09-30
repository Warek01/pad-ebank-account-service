import { Test, TestingModule } from '@nestjs/testing';
import { ConcurrencyService } from './concurrency.service';
import { ConfigModule } from '@nestjs/config';
import { describe } from 'node:test';

describe('ConcurrencyService', () => {
  let service: ConcurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcurrencyService],
      imports: [ConfigModule.forRoot()],
      exports: [],
      controllers: [],
    }).compile();

    service = module.get<ConcurrencyService>(ConcurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Initial tests', () => {
    it('should be empty', () => {
      expect(service.runningTasksCount).toBe(0);
    });

    it('should be able to register', () => {
      expect(service.canRegister()).toBe(true);
    });

    it('should have 0 running tasks on multiple unregisters', () => {
      service.unregister();
      service.unregister();
      service.unregister();

      expect(service.runningTasksCount).toBe(0);
      expect(service.canRegister()).toBe(true);
    });
  });

  it('should register', () => {
    service.register();
    service.register();
    service.register();
    expect(service.runningTasksCount === 3);
  });

  it('should deny registration on multiple running tasks', () => {
    service.register();
    service.register();
    service.register();
    expect(service.canRegister()).toBe(false);
  });

  it('should work register and unregister', () => {
    const registrations = [1, 2, 3];
    const unregisters = [2, 1, 0];

    expect(service.runningTasksCount).toBe(0);
    expect(service.canRegister()).toBe(true);

    for (const count of registrations) {
      service.register();
      expect(service.runningTasksCount).toBe(count);
      expect(service.canRegister()).toBe(count < 2);
    }

    for (const count of unregisters) {
      service.unregister();
      expect(service.runningTasksCount).toBe(count);
      expect(service.canRegister()).toBe(count < 2);
    }
  });
});
