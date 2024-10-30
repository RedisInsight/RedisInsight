import {
  AiMessage, AiMessageType, AiIntermediateStep, AiIntermediateStepType,
} from 'src/modules/ai/messages/models';
import { Readable } from 'stream';
import * as MockSocket from 'socket.io-mock';
import { AxiosError } from 'axios';
import { AiMessageDto } from 'src/modules/ai/messages/dto/send.ai.message.dto';
import { mockCloudSession } from 'src/__mocks__/cloud-session';
import { AiMessageEntity } from 'src/modules/ai/messages/entities/ai.message.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { AiModule } from 'src/modules/ai/ai.module';
import { AiAgreementEntity } from 'src/modules/ai/agreements/entities/ai.agreement.entity';
import { AiAgreement } from 'src/modules/ai/agreements/models/ai.agreement';
import { AiDatabaseAgreementEntity } from 'src/modules/ai/agreements/entities/ai.database.agreement.entity';
import { AiDatabaseAgreement } from 'src/modules/ai/agreements/models/ai.database.agreement';

export const mockAiChatId = '0539879dc020add5abb33f6f60a07fe8d5a0b9d61c81c9d79d77f9b1b2f2e239';

export const mockAiChatBadRequestError = {
  message: 'Bad request',
  response: {
    status: 400,
  },
} as AxiosError;

export const mockAiChatUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
} as AxiosError;

export const mockAiChatAccessDeniedError = {
  message: 'Access denied',
  response: {
    status: 403,
  },
} as AxiosError;

export const mockAiChatNotFoundError = {
  message: 'Requested resource was not found',
  response: {
    status: 404,
  },
} as AxiosError;

export const mockAiChatInternalServerError = {
  message: 'Server error',
  response: {
    status: 500,
  },
} as AxiosError;

export const mockHumanMessage1Response = {
  type: AiMessageType.HumanMessage,
  content: 'Question 1',
};

export const mockHumanMessage2Response = {
  type: AiMessageType.HumanMessage,
  content: 'Question 2',
};

export const mockAiMessage1Response = {
  type: AiMessageType.AiMessage,
  content: 'Answer 1',
};
export const mockAiMessage2Response = {
  type: AiMessageType.AiMessage,
  content: 'Answer 2',
};

export const mockAiHistoryApiResponse = [
  mockHumanMessage1Response,
  mockAiMessage1Response,
  mockHumanMessage2Response,
  mockAiMessage2Response,
];

export const mockAiChat = Object.assign(new AiModule(), {
  id: mockAiChatId,
  messages: [
    Object.assign(new AiMessage(), mockHumanMessage1Response),
    Object.assign(new AiMessage(), mockAiMessage1Response),
    Object.assign(new AiMessage(), mockHumanMessage2Response),
    Object.assign(new AiMessage(), mockAiMessage2Response),
  ],
});
export const getMockedReadableStream = () => new Readable();
export const mockAiResponseStream = getMockedReadableStream();

export const mockSendAiChatMessageDto = Object.assign(new AiMessageDto(), {
  content: mockHumanMessage1Response.content,
});

export const mockAiConversationId = 'conversation-id-uuid';
export const mockAiDatabaseId = 'database-id-uuid';
export const mockAiAccountId = 'account-id';

export const mockAiHumanMessage: AiMessage = Object.assign(new AiMessage(), {
  id: 'uuid-for-human-message-1',
  type: AiMessageType.HumanMessage,
  content: 'human message 1',
  conversationId: mockAiConversationId,
  databaseId: mockAiDatabaseId,
  accountId: mockAiAccountId,
});

export const mockAiHumanMessageEntity: AiMessageEntity = Object.assign(new AiMessageEntity(), {
  ...mockAiHumanMessage,
  content: 'human message 1 ENCRYPTED',
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockAiHumanMessage2: AiMessage = Object.assign(new AiMessage(), {
  id: 'uuid-for-human-message-2',
  type: AiMessageType.HumanMessage,
  content: 'human message 2',
  conversationId: mockAiConversationId,
  databaseId: mockAiDatabaseId,
  accountId: mockAiAccountId,
});

export const mockAiHumanMessageEntity2: AiMessageEntity = Object.assign(new AiMessageEntity(), {
  ...mockAiHumanMessage2,
  content: 'human message 2',
  encryption: EncryptionStrategy.PLAIN,
});

export const mockAiAiIntermediateStep: AiIntermediateStep = Object.assign(new AiIntermediateStep(), {
  type: AiIntermediateStepType.TOOL,
  data: 'intermediate tool 1',
});

export const mockAiAiIntermediateStep2: AiIntermediateStep = Object.assign(new AiIntermediateStep(), {
  type: AiIntermediateStepType.TOOL_CALL,
  data: 'intermediate tool call 2',
});

export const mockAiAiResponse: AiMessage = Object.assign(new AiMessage(), {
  id: 'uuid-for-ai-response-1',
  type: AiMessageType.AiMessage,
  content: 'ai response 1',
  steps: [
    mockAiAiIntermediateStep,
    mockAiAiIntermediateStep2,
  ],
  conversationId: mockAiConversationId,
  databaseId: mockAiDatabaseId,
  accountId: mockAiAccountId,
});

export const mockAiAiResponseEntity: AiMessageEntity = Object.assign(new AiMessageEntity(), {
  ...mockAiAiResponse,
  content: 'ai response 1 ENCRYPTED',
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockAiAiResponse2: AiMessage = Object.assign(new AiMessage(), {
  id: 'uuid-for-ai-response-2',
  type: AiMessageType.AiMessage,
  content: 'ai response 2',
  steps: [],
  conversationId: mockAiConversationId,
  databaseId: mockAiDatabaseId,
  accountId: mockAiAccountId,
});

export const mockAiAiResponseEntity2: AiMessageEntity = Object.assign(new AiMessageEntity(), {
  ...mockAiAiResponse2,
  content: 'ai response 2',
  encryption: EncryptionStrategy.PLAIN,
  steps: '[]',
});

export const mockAiHistory = [mockAiHumanMessage, mockAiAiResponse];

export const mockAiIndex = 'idx:bicycle';

export const mockAiIndexInfoReply = [
  'index_name',
  mockAiIndex,
  'index_options',
  [],
  'index_definition',
  [
    'key_type',
    'JSON',
    'prefixes',
    ['bicycle:'],
    'default_score',
    '1',
  ],
  'attributes',
  [
    [
      'identifier',
      '$.description',
      'attribute',
      'description',
      'type',
      'TEXT',
      'WEIGHT',
      '1',
    ],
    [
      'identifier',
      '$.price',
      'attribute',
      'price',
      'type',
      'NUMERIC',
    ],
    [
      'identifier',
      '$.type',
      'attribute',
      'type',
      'type',
      'TAG',
      'SEPARATOR',
      '',
    ],
  ],
  'num_docs',
  '122',
  'max_doc_id',
  '122',
  'num_terms',
  '550',
  'num_records',
  '2964',
  'inverted_sz_mb',
  '0.0145721435546875',
  'vector_index_sz_mb',
  '0',
  'total_inverted_index_blocks',
  '576',
  'offset_vectors_sz_mb',
  '0.0024938583374023438',
  'doc_table_size_mb',
  '0.009075164794921875',
  'sortable_values_size_mb',
  '0',
  'key_table_size_mb',
  '0.0038166046142578125',
  'records_per_doc_avg',
  '24.295082092285156',
  'bytes_per_record_avg',
  '5.1551957130432129',
  'offsets_per_term_avg',
  '0.88225370645523071',
  'offset_bits_per_record_avg',
  '8',
  'hash_indexing_failures',
  '0',
  'indexing',
  '0',
  'percent_indexed',
  '1',
  'gc_stats',
  [
    'bytes_collected',
    '0',
    'total_ms_run',
    '0',
    'total_cycles',
    '0',
    'average_cycle_time_ms',
    '-nan',
    'last_run_time_ms',
    '0',
    'gc_numeric_trees_missed',
    '0',
    'gc_blocks_denied',
    '0',
  ],
  'cursor_stats',
  [
    'global_idle',
    0,
    'global_total',
    0,
    'index_capacity',
    128,
    'index_total',
    0,
  ],
];

export const mockAiIndexInfoObject = {
  index_name: mockAiIndex,
  index_options: [],
  index_definition: { key_type: 'JSON', prefixes: ['bicycle:'], default_score: '1' },
  attributes: [
    {
      identifier: '$.description',
      attribute: 'description',
      type: 'TEXT',
      WEIGHT: '1',
    },
    {
      identifier: '$.price',
      attribute: 'price',
      type: 'NUMERIC',
    },
    {
      identifier: '$.type',
      attribute: 'type',
      type: 'TAG',
      SEPARATOR: '',
    },
  ],
  num_docs: '122',
  max_doc_id: '122',
  num_terms: '550',
  num_records: '2964',
  inverted_sz_mb: '0.0145721435546875',
  vector_index_sz_mb: '0',
  total_inverted_index_blocks: '576',
  offset_vectors_sz_mb: '0.0024938583374023438',
  doc_table_size_mb: '0.009075164794921875',
  sortable_values_size_mb: '0',
  key_table_size_mb: '0.0038166046142578125',
  records_per_doc_avg: '24.295082092285156',
  bytes_per_record_avg: '5.1551957130432129',
  offsets_per_term_avg: '0.88225370645523071',
  offset_bits_per_record_avg: '8',
  hash_indexing_failures: '0',
  indexing: '0',
  percent_indexed: '1',
  gc_stats: [
    'bytes_collected',
    '0',
    'total_ms_run',
    '0',
    'total_cycles',
    '0',
    'average_cycle_time_ms',
    '-nan',
    'last_run_time_ms',
    '0',
    'gc_numeric_trees_missed',
    '0',
    'gc_blocks_denied',
    '0',
  ],
  cursor_stats: [
    'global_idle',
    0,
    'global_total',
    0,
    'index_capacity',
    128,
    'index_total',
    0,
  ],
};

export const mockAiSchema = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/IdxBicycle',
  definitions: {
    IdxBicycle: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'integer' },
        type: { type: 'string' },
        description: { type: 'string' },
      },
      required: [
        'description',
        'price',
        'type',
      ],
      title: 'IdxBicycle',
    },
  },
};

export const mockAiSchemaForHash = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/IdxBicycle',
  definitions: {
    IdxBicycle: {
      type: 'object',
      additionalProperties: false,
      properties: {
        price: { type: 'string', format: 'integer' },
        type: { type: 'string' },
        description: { type: 'string' },
      },
      required: [
        'description',
        'price',
        'type',
      ],
      title: 'IdxBicycle',
    },
  },
};

export const mockAiGetDescriptionTopValuesReply = [
  '3',
  ['1', 'The Freedom offers eco-friendly mobility without compromising on style and performance!'],
  ['1', 'The Explorer conquers rugged trails and mountain peaks with confidence and agility!'],
  ['1', 'The Pioneer leads the way through challenging trails and rocky terrain with confidence!'],
];

export const mockAiGetPriceTopValuesReply = [
  '3',
  ['1', '320'],
  ['1', '329'],
  ['1', '380'],
];

export const mockAiGetTypeTopValuesReply = [
  '3',
  ['1', 'Mountain'],
  ['1', 'City'],
  ['1', 'Kids'],
];

export const mockAiIndexContext = {
  index_name: mockAiIndex,
  create_statement: `FT.CREATE ${mockAiIndex} ON JSON PREFIX 1 bicycle: SCHEMA $.description AS description TEXT $.price AS price NUMERIC $.type AS type TAG`,
  documents_schema: mockAiSchema,
  documents_type: 'JSON',
  attributes: {
    description: {
      identifier: '$.description',
      attribute: 'description',
      type: 'TEXT',
      WEIGHT: '1',
      distinct_count: 3,
      top_values: [
        {
          value: 'The Freedom offers eco-friendly mobility without compromising on style and performance!',
        },
        {
          value: 'The Explorer conquers rugged trails and mountain peaks with confidence and agility!',
        },
        {
          value: 'The Pioneer leads the way through challenging trails and rocky terrain with confidence!',
        },
      ],
    },
    price: {
      identifier: '$.price',
      attribute: 'price',
      type: 'NUMERIC',
      distinct_count: 3,
      top_values: [
        { value: '320' },
        { value: '329' },
        { value: '380' },
      ],
    },
    type: {
      identifier: '$.type',
      attribute: 'type',
      type: 'TAG',
      SEPARATOR: '',
      distinct_count: 3,
      top_values: [
        { value: 'Mountain' },
        { value: 'City' },
        { value: 'Kids' },
      ],
    },
  },
};

export const mockAiFullDbContext = {
  [mockAiIndex]: {
    index_name: mockAiIndex,
    attributes: [
      {
        identifier: '$.description',
        attribute: 'description',
        type: 'TEXT',
        WEIGHT: '1',
      },
      {
        identifier: '$.price',
        attribute: 'price',
        type: 'NUMERIC',
      },
      {
        identifier: '$.type',
        attribute: 'type',
        type: 'TAG',
        SEPARATOR: '',
      },
    ],
    documents_type: 'JSON',
  },
};

export const mockAiJsonReply = JSON.stringify({
  price: 490,
  type: 'Touring',
  description: 'The Wanderer takes you on epic adventures across varied landscapes with comfort and endurance!',
});

export const mockAiHScanReply = [
  0,
  [
    'price', '490',
    'type', 'Touring',
    'description', 'The Wanderer takes you on epic adventures across varied landscapes with comfort and endurance!',
  ],
];

export const mockAiAuth = {
  accountId: mockCloudSession.user.currentAccountId,
  csrf: mockCloudSession.csrf,
  sessionId: mockCloudSession.apiSessionId,
};

export const mockAiSocket = new MockSocket();

export const mockConvAiProvider = jest.fn(() => ({
  auth: jest.fn().mockResolvedValue(mockAiChatId),
  postMessage: jest.fn().mockResolvedValue(mockAiResponseStream),
  getHistory: jest.fn().mockResolvedValue(mockAiHistoryApiResponse),
  reset: jest.fn(),
}));

export const mockAiMessageProvider = jest.fn(() => ({
  getSocket: jest.fn().mockResolvedValue(mockAiSocket.socketClient),
}));

export const mockAiAuthProvider = jest.fn(() => ({
  getAuthData: jest.fn().mockResolvedValue(mockAiAuth),
}));

export const mockAiMessageRepository = jest.fn(() => ({
  list: jest.fn().mockResolvedValue(mockAiHistory),
  createMany: jest.fn(),
  clearHistory: jest.fn(),
}));

export const mockAiContextRepository = jest.fn(() => ({
  getFullDbContext: jest.fn().mockResolvedValue(mockAiFullDbContext),
  setFullDbContext: jest.fn().mockResolvedValue(mockAiFullDbContext),
  getIndexContext: jest.fn().mockResolvedValue(mockAiIndexContext),
  setIndexContext: jest.fn().mockResolvedValue(mockAiIndexContext),
  reset: jest.fn(),
}));

export const mockAiAgreementEntity = Object.assign(new AiAgreementEntity(), {
  accountId: mockAiAccountId,
  consent: true,
});

export const mockAiDatabaseAgreementEntity = Object.assign(new AiDatabaseAgreementEntity(), {
  databaseId: mockAiDatabaseId,
  accountId: mockAiAccountId,
  dataConsent: true,
});

export const mockAiAgreement = Object.assign(new AiAgreement(), mockAiAgreementEntity);

export const mockAiDatabaseAgreement = Object.assign(new AiDatabaseAgreement(), mockAiDatabaseAgreementEntity);

export const mockAiAgreementRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockAiAgreement),
  save: jest.fn().mockResolvedValue(mockAiAgreement),
}));

export const mockAiDatabaseAgreementRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockAiDatabaseAgreement),
  save: jest.fn().mockResolvedValue(mockAiDatabaseAgreement),
}));

export const mockAiAgreementService = jest.fn(() => ({
  getAiAgreement: jest.fn().mockResolvedValue(mockAiAgreement),
}));

export const mockAiDatabaseAgreementService = jest.fn(() => ({
  getAiDatabaseAgreement: jest.fn().mockResolvedValue(mockAiDatabaseAgreement),
}));
