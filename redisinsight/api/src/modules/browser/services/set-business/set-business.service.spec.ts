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
  mockStandaloneDatabaseEntity,
} from 'src/__mocks__';
import config from 'src/utils/config';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { ReplyError } from 'src/models';
import {
  BrowserToolKeysCommands,
  BrowserToolSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { SetBusinessService } from './set-business.service';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  GetSetMembersDto,
  GetSetMembersResponse,
} from '../../dto';
import { BrowserToolService } from '../browser-tool/browser-tool.service';

const REDIS_SCAN_CONFIG = config.get('redis_scan');

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockStandaloneDatabaseEntity.id,
};

const mockAddMemberDto: AddMembersToSetDto = {
  keyName: 'testSet',
  members: ['Lorem ipsum dolor sit amet.'],
};

const mockDeleteMembersDto: DeleteMembersFromSetDto = {
  keyName: mockAddMemberDto.keyName,
  members: mockAddMemberDto.members,
};

const mockGetMembersDto: GetSetMembersDto = {
  keyName: mockAddMemberDto.keyName,
  cursor: 0,
  count: REDIS_SCAN_CONFIG.countDefault || 15,
  match: '*',
};

const mockSetMembers: string[] = ['member'];

const mockGetSetMembersResponse: GetSetMembersResponse = {
  keyName: mockGetMembersDto.keyName,
  nextCursor: 0,
  total: mockSetMembers.length,
  members: mockSetMembers,
};

describe('SetBusinessService', () => {
  let service: SetBusinessService;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetBusinessService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<SetBusinessService>(SetBusinessService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });

  describe('createSet', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddMemberDto.keyName,
        ])
        .mockResolvedValue(false);
      service.createSetWithExpiration = jest.fn();
    });
    it('create set with expiration', async () => {
      service.createSetWithExpiration = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.createSet(mockClientOptions, {
          ...mockAddMemberDto,
          expire: 1000,
        }),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).toHaveBeenCalled();
    });
    it('create set without expiration', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SAdd, [
          mockAddMemberDto.keyName,
          ...mockAddMemberDto.members,
        ])
        .mockResolvedValue(1);

      await expect(
        service.createSet(mockClientOptions, mockAddMemberDto),
      ).resolves.not.toThrow();
      expect(service.createSetWithExpiration).not.toHaveBeenCalled();
    });
    it('key with this name exist', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddMemberDto.keyName,
        ])
        .mockResolvedValue(true);

      await expect(
        service.createSet(mockClientOptions, mockAddMemberDto),
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
          mockClientOptions,
          BrowserToolSetCommands.SAdd,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.createSet(mockClientOptions, mockAddMemberDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for createSet", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.createSet(mockClientOptions, mockAddMemberDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createSetWithExpiration', () => {
    const dto: CreateSetWithExpireDto = {
      ...mockAddMemberDto,
      expire: 1000,
    };
    it('succeed to create Set data type with expiration', async () => {
      when(browserTool.execMulti)
        .calledWith(mockClientOptions, [
          [BrowserToolSetCommands.SAdd, dto.keyName, ...dto.members],
          [BrowserToolKeysCommands.Expire, dto.keyName, dto.expire],
        ])
        .mockResolvedValue([
          null,
          [
            [null, mockAddMemberDto.members.length],
            [null, 1],
          ],
        ]);

      const result = await service.createSetWithExpiration(
        mockClientOptions,
        dto,
      );
      expect(result).toBe(mockAddMemberDto.members.length);
    });
    it('throw transaction error', async () => {
      const transactionError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SADD',
      };
      browserTool.execMulti.mockResolvedValue([transactionError, null]);

      await expect(
        service.createSetWithExpiration(mockClientOptions, dto),
      ).rejects.toEqual(transactionError);
    });
  });

  describe('getMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SCard, [
          mockGetMembersDto.keyName,
        ])
        .mockResolvedValue(mockSetMembers.length);
    });
    it('succeed to get members of the set', async () => {
      when(browserTool.execCommand)
        .calledWith(
          mockClientOptions,
          BrowserToolSetCommands.SScan,
          expect.anything(),
        )
        .mockResolvedValue([0, mockSetMembers]);

      const result = await service.getMembers(
        mockClientOptions,
        mockGetMembersDto,
      );

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(browserTool.execCommand).toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolSetCommands.SScan,
        expect.anything(),
      );
    });
    it('succeed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetMembersDto,
        match: mockSetMembers[0],
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockClientOptions, dto);

      expect(result).toEqual(mockGetSetMembersResponse);
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
        BrowserToolSetCommands.SScan,
        expect.anything(),
      );
    });
    it('failed to find exact member in the set', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetMembersDto,
        match: mockSetMembers[0],
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          dto.match,
        ])
        .mockResolvedValue(0);

      const result = await service.getMembers(mockClientOptions, dto);

      expect(result).toEqual({ ...mockGetSetMembersResponse, members: [] });
    });
    it('should not call scan when math contains escaped glob', async () => {
      const dto: GetSetMembersDto = {
        ...mockGetMembersDto,
        match: 'm\\[a-e\\]mber',
      };
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SIsMember, [
          dto.keyName,
          'm[a-e]mber',
        ])
        .mockResolvedValue(1);

      const result = await service.getMembers(mockClientOptions, dto);

      expect(result).toEqual({
        ...mockGetSetMembersResponse,
        members: ['m[a-e]mber'],
      });
      expect(browserTool.execCommand).not.toHaveBeenCalledWith(
        mockClientOptions,
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
    //       mockClientOptions,
    //       BrowserToolSetCommands.SScan,
    //       expect.anything(),
    //     )
    //     .mockResolvedValue(['200', []]);
    //
    //   await service.getMembers(mockClientOptions, dto);
    //
    //   expect(browserTool.execCommand).toHaveBeenCalledTimes(maxScanCalls + 1);
    // });
    it('key with this name does not exist for getMembers', async () => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SCard, [
          mockGetMembersDto.keyName,
        ])
        .mockResolvedValue(0);

      await expect(
        service.getMembers(mockClientOptions, mockGetMembersDto),
      ).rejects.toThrow(NotFoundException);
    });
    it("try to use 'SCARD' command not for list data type", async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        command: 'SCARD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockClientOptions, mockGetMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for getMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SCARD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.getMembers(mockClientOptions, mockGetMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddMemberDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeed to add members to the Set data type', async () => {
      const { keyName, members } = mockAddMemberDto;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SAdd, [
          keyName,
          ...members,
        ])
        .mockResolvedValue(1);

      await expect(
        service.addMembers(mockClientOptions, mockAddMemberDto),
      ).resolves.not.toThrow();
    });
    it('key with this name does not exist for addMembers', async () => {
      const { keyName, members } = mockAddMemberDto;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockAddMemberDto.keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.addMembers(mockClientOptions, mockAddMemberDto),
      ).rejects.toThrow(NotFoundException);
      expect(
        browserTool.execCommand,
      ).not.toHaveBeenCalledWith(
        mockClientOptions,
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
          mockClientOptions,
          BrowserToolSetCommands.SAdd,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockClientOptions, mockAddMemberDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for addMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SADD',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.addMembers(mockClientOptions, mockAddMemberDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMembers', () => {
    beforeEach(() => {
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          mockDeleteMembersDto.keyName,
        ])
        .mockResolvedValue(true);
    });
    it('succeeded to delete members from Set data type', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolSetCommands.SRem, [
          keyName,
          ...members,
        ])
        .mockResolvedValue(members.length);

      const result = await service.deleteMembers(
        mockClientOptions,
        mockDeleteMembersDto,
      );

      expect(result).toEqual({ affected: members.length });
    });
    it('key with this name does not exist for deleteMembers', async () => {
      const { members, keyName } = mockDeleteMembersDto;
      when(browserTool.execCommand)
        .calledWith(mockClientOptions, BrowserToolKeysCommands.Exists, [
          keyName,
        ])
        .mockResolvedValue(false);

      await expect(
        service.deleteMembers(mockClientOptions, mockDeleteMembersDto),
      ).rejects.toThrow(NotFoundException);
      expect(
        browserTool.execCommand,
      ).not.toHaveBeenCalledWith(
        mockClientOptions,
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
          mockClientOptions,
          BrowserToolSetCommands.SRem,
          expect.anything(),
        )
        .mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockClientOptions, mockDeleteMembersDto),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions for deleteMembers", async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SREM',
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      await expect(
        service.deleteMembers(mockClientOptions, mockDeleteMembersDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
