import IORedis from 'ioredis';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
  mockDatabaseRecommendationService,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import {
  mockAddMembersToSetDto, mockDeleteMembersDto,
  mockGetSetMembersDto, mockGetSetMembersResponse,
  mockSetMembers,
} from 'src/modules/browser/__mocks__';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { SetBusinessService } from './set-business.service';
import {
  CreateSetWithExpireDto,
  GetSetMembersDto,
} from '../../dto';
import { BrowserToolService } from '../browser-tool/browser-tool.service';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.isCluster = false;

describe('SetBusinessService', () => {
  let service: SetBusinessService;
  let browserTool;
  let recommendationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<SetBusinessService>(SetBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
    recommendationService = module.get<DatabaseRecommendationService>(DatabaseRecommendationService);
  });

  describe('createSet', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(false);
      service.createSetWithExpiration = jest.fn();
    });
    it('create set with expiration', async () => {
      service.createSetWithExpiration = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.createSet(mockBrowserClientMetadata, {
          ...mockAddMembersToSetDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).toHaveBeenCalled();
    });
    it('create set without expiration', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SAdd, [
          mockAddMembersToSetDto.keyName,
          ...mockAddMembersToSetDto.members,
        ])
        .mockResolvedValue(1);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(true);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ConflictException);
      expect(browserTool.execCommand).toHaveBeenCalledTimes(1);
      expect(browserTool.execMulti).not.toHaveBeenCalled();
    });
    it("try to use 'SADD' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolSetCommands.SAdd,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for createSet", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.createSet(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createSetWithExpiration', () => {
    const dto: CreateSetWithExpireDto = {
      ...mockAddMembersToSetDto,
      expire: 1000,
    };
    it('succeed to create Set data type with expiration', async () => {
      when(browserTool.execMulti)
        .calledWith(mockBrowserClientMetadata, [
          [BrowserToolSetCommands.SAdd, dto.keyName, ...dto.members],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          null,
          [
            [null, mockAddMembersToSetDto.members.length],
            [null, 1],
          ],
        ]);

      const result = await service.createSetWithExpiration(
        mockBrowserClientMetadata,
        dto,
      );
      expect(result).toBe(mockAddMembersToSetDto.members.length);
    });
    it('throw transaction error', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      browserTool.execMulti.mockResolvedValue([transactionError, null]);

      await expect(
        service.createSetWithExpiration(mockBrowserClientMetadata, dto),
      ).rejects.toEqual(transactionError);
    });
  });

  describe('getMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SCard, [
          mockGetSetMembersDto.keyName,
        ])
        .mockResolvedValue(mockSetMembers.length);

      when(browserTool.getRedisClient)
        .calledWith(mockBrowserClientMetadata)
        .mockResolvedValue(nodeClient);
    });
    it('succeed to get members of the set', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolSetCommands.SScan,
          expect.anything(),
        )
        .mockResolvedValue([Buffer.from('0'), mockSetMembers]);

      const result = await service.getMembers(
        mockBrowserClientMetadata,
        mockGetSetMembersDto,
      );

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolSetCommands.SScan,
        expect.anything(),
      );
    });
    it('succeed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: mockSetMembers[0].toString(),
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolSetCommands.SScan,
        expect.anything(),
      );
    });
    it('failed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: mockSetMembers[0].toString(),
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(0);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual({ ...mockGetSetMembersResponse, members: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetSetMembersDto,
        match: 'm\\[a-e\\]mber',
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          'm[a-e]mber',
        ])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockBrowserClientMetadata, dto);

      expect(result).toEqual({
        ...mockGetSetMembersResponse,
        members: [Buffer.from('m[a-e]mber')],
      });
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolSetCommands.SScan,
        expect.anything(),
      );
    });
    // TODO: uncomment after enabling threshold for set scan
    // it('should stop set full scan', async () => {
    //   const dto: GetSetMembersDto = {
    //     ...mockGetMembersDto,
    //     count: REDIS_SCAN_CONFIG.countDefault,
    //     match: '*un-exist-member*',
    //   };
    //   const maxScanCalls = Math.round(
    //     REDIS_SCAN_CONFIG.countThreshold / REDIS_SCAN_CONFIG.countDefault,
    //   );
    //   when(browserTool.execCommand)
    //     .calledWith(
    //       mockBrowserClientMetadata,
    //       BrowserToolSetCommands.SScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getMembers(mockBrowserClientMetadata, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getMembers', async () => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SCard, [
          mockGetSetMembersDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'SCARD' command not for list data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SCARD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCARD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockBrowserClientMetadata, mockGetSetMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should call recommendationService', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolSetCommands.SScan,
          expect.anything(),
        )
        .mockResolvedValue([Buffer.from('0'), mockSetMembers]);

      const result = await service.getMembers(
        mockBrowserClientMetadata,
        mockGetSetMembersDto,
      );
      expect(recommendationService.check).toBeCalledWith(
        mockBrowserClientMetadata,
        RECOMMENDATION_NAMES.INTEGERS_IN_SET,
        {
          members: result.members,
          keyName: result.keyName,
          client: nodeClient,
          databaseId: mockBrowserClientMetadata.databaseId,
        },
      );

      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('addMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeed to add members to the Set data type', async () => {
      const { keyName, members } = mockAddMembersToSetDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SAdd, [
          keyName,
          ...members,
        ])
        .mockResolvedValue(1);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for addMembers', async () => {
      const { keyName, members } = mockAddMembersToSetDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockAddMembersToSetDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(NotFoundException);
      expect(
        browserTool.execCommand,
      ).not.toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolSetCommands.SAdd,
        [keyName, ...members],
      );
    });
    it("try to use 'SADD' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolSetCommands.SAdd,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockBrowserClientMetadata, mockAddMembersToSetDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          mockDeleteMembersDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeeded to delete members from Set data type', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolSetCommands.SRem, [
          keyName,
          ...members,
        ])
        .mockResolvedValue(members.length);

      const result = await service.deleteMembers(
        mockBrowserClientMetadata,
        mockDeleteMembersDto,
      );

      expect(result).toEqual({ affected: members.length });
    });
    it('key with this name does not exist for deleteMembers', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Exists, [
          keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(
        browserTool.execCommand,
      ).not.toHaveBeenCalledWith(
        mockBrowserClientMetadata,
        BrowserToolSetCommands.SRem,
        [keyName, ...members],
      );
    });
    it("try to use 'SREM' command not for set data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SREM',
      };
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolSetCommands.SRem,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SREM',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockBrowserClientMetadata, mockDeleteMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
