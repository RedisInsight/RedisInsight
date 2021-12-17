import { Test, TestingModule } from '@nestjs/testing';
import { MonitorService } from './monitor.service';

describe('MonitorService', () => {
  let service: MonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitorService],
    }).compile();

    service = module.get<MonitorService>(MonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
