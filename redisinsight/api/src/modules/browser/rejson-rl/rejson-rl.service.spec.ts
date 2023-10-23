import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import { when } from 'jest-when';
import {
  mockRedisConsumer,
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RejsonRlService } from './rejson-rl.service';

const testKey = Buffer.from('somejson');
const testSerializedObject = JSON.stringify({ some: 'object' });
const testPath = '.';
const testExpire = 30;

describe('JsonService', () => {
  let service: RejsonRlService;
  let browserTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejsonRlService,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get<RejsonRlService>(RejsonRlService);
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });

  describe('getJson', () => {
    const mockRedisCallsForSafeResponse = (
      path,
      key,
      type,
      value,
      cardinality = 0,
    ) => {
      when(browserTool.execCommand)
        .calledWith(
          mockBrowserClientMetadata,
          BrowserToolRejsonRlCommands.JsonType, [
            testKey,
            path,
          ],
          'utf8',
        ).mockReturnValue(type);

      if (value !== undefined) {
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonGet,
            [
              testKey,
              path,
            ],
            'utf8',
          ).mockReturnValue(JSON.stringify(value));
      }

      switch (type) {
        case 'array':
          when(browserTool.execCommand)
            .calledWith(
              mockBrowserClientMetadata,
              BrowserToolRejsonRlCommands.JsonArrLen,
              [testKey, path],
              'utf8',
            )
            .mockReturnValue(cardinality);
          break;
        case 'object':
          when(browserTool.execCommand)
            .calledWith(
              mockBrowserClientMetadata,
              BrowserToolRejsonRlCommands.JsonObjLen,
              [testKey, path],
              'utf8',
            )
            .mockReturnValue(cardinality);
          break;
        default:
      }
    };

    describe('full json download', () => {
      beforeEach(() => {
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, testPath],
          )
          .mockReturnValue(10);
      });

      it('should throw BadRequest error when no key found in the database', async () => {
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, testPath],
          )
          .mockResolvedValue(null);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
          fail();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(
            `There is no such path: "${testPath}" in key: "${testKey}"`,
          );
        }
      });
      it('should throw BadRequest error when incorrect type of a key', async () => {
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockResolvedValue(null);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
            forceRetrieve: true,
          });
          fail();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
        }
      });
      it('should throw BadRequest when try to force get not existing path/key', async () => {
        const replyError: ReplyError = {
          ...mockRedisWrongTypeError,
          command: 'JSON.DEBUG',
        };
        browserTool.execCommand.mockRejectedValue(replyError);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
          fail();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
        }
      });
      it('should throw BadRequest error when module not loaded for getJson', async () => {
        const replyError: ReplyError = {
          name: 'ReplyError',
          message: `unknown command ${BrowserToolRejsonRlCommands.JsonGet}`,
          command: BrowserToolRejsonRlCommands.JsonGet,
        };
        browserTool.execCommand.mockRejectedValue(replyError);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
          fail();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(
            ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
          );
        }
      });
      it('should throw InternalError when some unexpected error happened', async () => {
        browserTool.execCommand.mockRejectedValue(new Error()); // no message here

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
          fail();
        } catch (err) {
          expect(err).toBeInstanceOf(InternalServerErrorException);
        }
      });
      it('should return data (string)', async () => {
        const testData = 'some string';
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (number)', async () => {
        const testData = 3.14;
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (integer)', async () => {
        const testData = 123;
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (boolean)', async () => {
        const testData = true;
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (null)', async () => {
        const testData = null;
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (array)', async () => {
        const testData = [
          1,
          'str',
          false,
          null,
          0.98,
          [1, 2],
          { some: 'field' },
        ];
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return data (object)', async () => {
        const testData = {
          someStr: 'field',
          someArr: [],
          someBool: true,
          someNumber: 12.22,
          someInt: 1222,
        };
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
      it('should return full json data when forceRetrieve is true', async () => {
        const testData = {
          someStr: 'field',
          someArr: [],
          someBool: true,
          someNumber: 12.22,
          someInt: 1222,
        };

        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, testPath],
          )
          .mockReturnValue(1025);

        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          forceRetrieve: true,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
    });

    describe('user has no PERM for JSON.DEBUG', () => {
      beforeEach(() => {
        const replyError: ReplyError = {
          ...mockRedisNoPermError,
          command: 'JSON.DEBUG',
        };

        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, testPath],
          )
          .mockRejectedValue(replyError);
      });

      it('should return data (string)', async () => {
        const testData = 'some string';
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });

      it('should return full json value even if size is above the limit', async () => {
        const testData = { arr: [randomBytes(2000).toString('hex')] };
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));

        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonType, [
              testKey,
              testPath,
            ],
            'utf8',
          ).mockReturnValue('object');

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testData,
        });
      });
    });
    describe('partial json download', () => {
      beforeEach(() => {
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, testPath],
          )
          .mockReturnValue(1025);
      });

      it('should return full string value even if size is above the limit', async () => {
        const testData = randomBytes(2000).toString('hex');
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonGet, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue(JSON.stringify(testData));
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonType, [
              testKey,
              testPath,
            ],
            'utf8',
          ).mockReturnValue('string');

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          data: testData,
          type: 'string',
        });
      });
      it('should return array with scalar values and safe struct types descriptions', async () => {
        const testData = [
          12,
          3.14,
          'str',
          false,
          null,
          [1, 2, 3],
          { key1: 'value1', key2: 'value2' },
        ];
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonType,
            [
              testKey,
              testPath,
            ],
            'utf8',
          ).mockReturnValue('array');
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonArrLen,
            [testKey, testPath],
            'utf8',
          )
          .mockReturnValue(7);

        mockRedisCallsForSafeResponse('[0]', 0, 'integer', testData[0]);
        mockRedisCallsForSafeResponse('[1]', 1, 'number', testData[1]);
        mockRedisCallsForSafeResponse('[2]', 2, 'string', testData[2]);
        mockRedisCallsForSafeResponse('[3]', 3, 'boolean', testData[3]);
        mockRedisCallsForSafeResponse('[4]', 4, 'null', testData[4]);
        mockRedisCallsForSafeResponse('[5]', 5, 'array', undefined, 3);
        mockRedisCallsForSafeResponse('[6]', 6, 'object', undefined, 2);

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          type: 'array',
          data: [
            {
              key: 0,
              path: '[0]',
              cardinality: 1,
              type: 'integer',
              value: testData[0],
            },
            {
              key: 1,
              path: '[1]',
              cardinality: 1,
              type: 'number',
              value: testData[1],
            },
            {
              key: 2,
              path: '[2]',
              cardinality: 1,
              type: 'string',
              value: testData[2],
            },
            {
              key: 3,
              path: '[3]',
              cardinality: 1,
              type: 'boolean',
              value: testData[3],
            },
            {
              key: 4,
              path: '[4]',
              cardinality: 1,
              type: 'null',
              value: testData[4],
            },
            {
              key: 5,
              path: '[5]',
              cardinality: 3,
              type: 'array',
            },
            {
              key: 6,
              path: '[6]',
              cardinality: 2,
              type: 'object',
            },
          ],
        });
      });
      it('should return array with scalar values in a custom path', async () => {
        const path = '["customPath"]';
        const testData = [12, 'str'];
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, path],
          )
          .mockReturnValue(1025);
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonType,
            [
              testKey,
              path,
            ],
            'utf8',
          ).mockReturnValue('array');
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonArrLen,
            [testKey, path],
            'utf8',
          ).mockReturnValue(2);

        mockRedisCallsForSafeResponse(
          `${path}[0]`,
          0,
          'integer',
          testData[0],
        );
        mockRedisCallsForSafeResponse(
          `${path}[1]`,
          1,
          'string',
          testData[1],
        );

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path,
        });

        expect(result).toEqual({
          downloaded: false,
          path,
          type: 'array',
          data: [
            {
              key: 0,
              path: `${path}[0]`,
              cardinality: 1,
              type: 'integer',
              value: testData[0],
            },
            {
              key: 1,
              path: `${path}[1]`,
              cardinality: 1,
              type: 'string',
              value: testData[1],
            },
          ],
        });
      });
      it('should return object with scalar values and safe struct types descriptions', async () => {
        const testData = {
          fInt: 12,
          fNum: 3.14,
          fStr: 'str',
          fBool: false,
          fNull: null,
          fArr: [1, 2, 3],
          fObj: { key1: 'value1', key2: 'value2' },
        };

        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
            testKey,
            testPath,
          ], 'utf8')
          .mockReturnValue('object');
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonObjKeys,
            [testKey, testPath],
            'utf8',
          )
          .mockReturnValue(Object.keys(testData));

        mockRedisCallsForSafeResponse(
          '["fInt"]',
          'fInt',
          'integer',
          testData.fInt,
        );
        mockRedisCallsForSafeResponse(
          '["fNum"]',
          'fNum',
          'number',
          testData.fNum,
        );
        mockRedisCallsForSafeResponse(
          '["fStr"]',
          'fStr',
          'string',
          testData.fStr,
        );
        mockRedisCallsForSafeResponse(
          '["fBool"]',
          'fBool',
          'boolean',
          testData.fBool,
        );
        mockRedisCallsForSafeResponse(
          '["fNull"]',
          'fNull',
          'null',
          testData.fNull,
        );
        mockRedisCallsForSafeResponse(
          '["fArr"]',
          'fArr',
          'array',
          undefined,
          3,
        );
        mockRedisCallsForSafeResponse(
          '["fObj"]',
          'fObj',
          'object',
          undefined,
          2,
        );

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          type: 'object',
          data: [
            {
              key: 'fInt',
              path: '["fInt"]',
              cardinality: 1,
              type: 'integer',
              value: testData.fInt,
            },
            {
              key: 'fNum',
              path: '["fNum"]',
              cardinality: 1,
              type: 'number',
              value: testData.fNum,
            },
            {
              key: 'fStr',
              path: '["fStr"]',
              cardinality: 1,
              type: 'string',
              value: testData.fStr,
            },
            {
              key: 'fBool',
              path: '["fBool"]',
              cardinality: 1,
              type: 'boolean',
              value: testData.fBool,
            },
            {
              key: 'fNull',
              path: '["fNull"]',
              cardinality: 1,
              type: 'null',
              value: testData.fNull,
            },
            {
              key: 'fArr',
              path: '["fArr"]',
              cardinality: 3,
              type: 'array',
            },
            {
              key: 'fObj',
              path: '["fObj"]',
              cardinality: 2,
              type: 'object',
            },
          ],
        });
      });
      it('should return object with scalar values in a custom path', async () => {
        const path = '["customPath"]';
        const testData = {
          fInt: 12,
          fStr: 'str',
        };

        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonDebug,
            ['MEMORY', testKey, path],
          )
          .mockReturnValue(1025);
        when(browserTool.execCommand)
          .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonType, [
            testKey,
            path,
          ], 'utf8')
          .mockReturnValue('object');
        when(browserTool.execCommand)
          .calledWith(
            mockBrowserClientMetadata,
            BrowserToolRejsonRlCommands.JsonObjKeys,
            [testKey, path],
            'utf8',
          )
          .mockReturnValue(Object.keys(testData));

        mockRedisCallsForSafeResponse(
          `${path}["fInt"]`,
          'fInt',
          'integer',
          testData.fInt,
        );
        mockRedisCallsForSafeResponse(
          `${path}["fStr"]`,
          'fStr',
          'string',
          testData.fStr,
        );

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path,
        });

        expect(result).toEqual({
          downloaded: false,
          path,
          type: 'object',
          data: [
            {
              key: 'fInt',
              path: `${path}["fInt"]`,
              cardinality: 1,
              type: 'integer',
              value: testData.fInt,
            },
            {
              key: 'fStr',
              path: `${path}["fStr"]`,
              cardinality: 1,
              type: 'string',
              value: testData.fStr,
            },
          ],
        });
      });
    });
  });
  describe('create', () => {
    beforeEach(() => {
      browserTool.execCommand.mockReturnValue('OK');
    });
    it('should throw Conflict error when key is already in the database', async () => {
      browserTool.execCommand.mockReturnValue(null);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NAME_EXIST);
      }
    });
    it('should throw Forbidden error when no perms for an action for create', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should throw BadRequest error when module not loaded for create', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonSet}`,
        command: BrowserToolRejsonRlCommands.JsonSet,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }
    });
    it('should silently handle key expire error and log it', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolRejsonRlCommands.JsonSet, [
          testKey,
          testPath,
          testSerializedObject,
          'NX',
        ])
        .mockReturnValue('OK');
      when(browserTool.execCommand)
        .calledWith(mockBrowserClientMetadata, BrowserToolKeysCommands.Expire, [
          testKey,
          testExpire,
        ])
        .mockRejectedValue(replyError);

      await service.create(mockBrowserClientMetadata, {
        keyName: testKey,
        data: testSerializedObject,
        expire: testExpire,
      });
      expect(browserTool.execCommand).lastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Expire,
        [testKey, testExpire],
      );
    });

    it('should successful create key', async () => {
      await service.create(mockBrowserClientMetadata, {
        keyName: testKey,
        data: testSerializedObject,
      });
    });
  });
  describe('jsonSet', () => {
    beforeEach(() => {
      browserTool.execCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists for jsonSet', async () => {
      browserTool.execCommand.mockReturnValue(0);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded for jsonSet', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonSet}`,
        command: BrowserToolRejsonRlCommands.JsonSet,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }
    });
    it('should throw NotFound error when try to set to the incorrect path', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: 'json.set',
        message: "ERR index '[7]' out of range at level 1 in path",
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.PATH_NOT_EXISTS());
      }
    });
    it('should throw Forbidden error when no perms for an action for jsonSet', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful modify data', async () => {
      await service.jsonSet(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
        data: testSerializedObject,
      });

      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Exists,
        [testKey],
      );
      expect(browserTool.execCommand).lastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolRejsonRlCommands.JsonSet,
        [testKey, testPath, testSerializedObject],
      );
    });
  });
  describe('arrAppend', () => {
    beforeEach(() => {
      browserTool.execCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists', async () => {
      browserTool.execCommand.mockReturnValue(0);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonArrAppend}`,
        command: BrowserToolRejsonRlCommands.JsonArrAppend,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }
    });
    it('should throw Forbidden error when no perms for an action', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful modify data', async () => {
      await service.arrAppend(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
        data: [testSerializedObject, testSerializedObject],
      });

      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Exists,
        [testKey],
      );
      expect(browserTool.execCommand).lastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolRejsonRlCommands.JsonArrAppend,
        [testKey, testPath, testSerializedObject, testSerializedObject],
      );
    });
  });
  describe('remove', () => {
    beforeEach(() => {
      browserTool.execCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists', async () => {
      browserTool.execCommand.mockReturnValue(0);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonDel}`,
        command: BrowserToolRejsonRlCommands.JsonDel,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('RedisJSON'),
        );
      }
    });
    it('should throw Forbidden error when no perms for an action', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      browserTool.execCommand.mockRejectedValue(replyError);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful remove path', async () => {
      await service.remove(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
      });

      expect(browserTool.execCommand).toHaveBeenNthCalledWith(
        1,
        mockBrowserClientMetadata,
        BrowserToolKeysCommands.Exists,
        [testKey],
      );
      expect(browserTool.execCommand).lastCalledWith(
        mockBrowserClientMetadata,
        BrowserToolRejsonRlCommands.JsonDel,
        [testKey, testPath],
      );
    });
  });
});
