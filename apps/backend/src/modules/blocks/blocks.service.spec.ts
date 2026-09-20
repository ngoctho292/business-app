import { Test, TestingModule } from '@nestjs/testing';
import { BlocksService } from './blocks.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BlocksService Unit Tests', () => {
  let service: BlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlocksService],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject if a block tries to be its own parent', async () => {
    const blockId = '11111111-1111-1111-1111-111111111111';
    // Mock existing block
    jest.spyOn(service as any, 'detectCycle').mockResolvedValue(true);

    try {
      // Mock db findFirst
      const db = require('../../db').db;
      jest.spyOn(db.query.blocks, 'findFirst').mockResolvedValue({
        id: blockId,
        parent_id: null,
        props: {},
      });

      await service.updateBlock(blockId, { parent_id: blockId });
      fail('Should have thrown BadRequestException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toContain('cannot be its own parent');
    }
  });
});
