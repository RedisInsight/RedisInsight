import {
  expect,
  describe,
  before,
  Joi,
  deps,
  requirements,
  generateInvalidDataTestCases,
  validateInvalidDataTestCase,
  getMainCheckFn,
} from '../deps';

const {
  server, request, constants, rte, localDb,
} = deps;

// endpoint to test
const endpoint = (instanceId = constants.TEST_INSTANCE_ID) => request(server)
  .post(`/${constants.API.DATABASES}/${instanceId}/redisearch/info`);

// input data schema
const dataSchema = Joi.object({
  index: Joi.string().required(),
}).strict();

const validInputData = {
  index: constants.TEST_SEARCH_HASH_INDEX_1,
};

const responseSchema = Joi.object({
  index_name: Joi.string().required(),
  index_options: Joi.object({}),
  index_definition: Joi.object({
    key_type: Joi.string(),
    prefixes: Joi.array(),
    default_score: Joi.string(),
  }),
  attributes: Joi.array().items({
    identifier: Joi.string(),
    attribute: Joi.string(),
    type: Joi.string(),
    WEIGHT: Joi.string(),
    SORTABLE: Joi.string(),
    NOINDEX: Joi.string(),
    CASESENSITIVE: Joi.string(),
    UNF: Joi.string(),
    NOSTEM: Joi.string(),
    SEPARATOR: Joi.string(),
  }),
  num_docs: Joi.string(),
  max_doc_id: Joi.string(),
  num_terms: Joi.string(),
  num_records: Joi.string(),
  inverted_sz_mb: Joi.string(),
  vector_index_sz_mb: Joi.string(),
  total_inverted_index_blocks: Joi.string(),
  offset_vectors_sz_mb: Joi.string(),
  doc_table_size_mb: Joi.string(),
  sortable_values_size_mb: Joi.string(),
  tag_overhead_sz_mb: Joi.string(),
  text_overhead_sz_mb: Joi.string(),
  total_index_memory_sz_mb: Joi.string(),
  key_table_size_mb: Joi.string(),
  geoshapes_sz_mb: Joi.string(),
  records_per_doc_avg: Joi.string(),
  bytes_per_record_avg: Joi.string(),
  offsets_per_term_avg: Joi.string(),
  offset_bits_per_record_avg: Joi.string(),
  hash_indexing_failures: Joi.string(),
  total_indexing_time: Joi.string(),
  indexing: Joi.string(),
  percent_indexed: Joi.string(),
  number_of_uses: Joi.number(),
  cleaning: Joi.number(),
  gc_stats: Joi.object(),
  cursor_stats: Joi.object(),
  dialect_stats: Joi.object(),
  'Index Errors': Joi.object(),
  'field statistics': Joi.array().items({
    identifier: Joi.string(),
    attribute: Joi.string(),
    'Index Errors': Joi.object(),
  }),
}).required().strict();
const mainCheckFn = getMainCheckFn(endpoint);

describe('POST /databases/:id/redisearch/info', () => {
  requirements('!rte.bigData', 'rte.modules.search');
  before(async () => {
    await rte.data.generateRedisearchIndexes(true);
    await localDb.createTestDbInstance(rte, {}, { id: constants.TEST_INSTANCE_ID_2 });
  });

  describe('Validation', () => {
    generateInvalidDataTestCases(dataSchema, validInputData).forEach(
      validateInvalidDataTestCase(endpoint, dataSchema),
    );
  });

  describe('Common', () => {
    [
      {
        name: 'Should get info index',
        data: validInputData,
        responseSchema,
        checkFn: async ({ body }) => {
          expect(body.index_name).to.eq(constants.TEST_SEARCH_HASH_INDEX_1);
          expect(body.index_definition?.key_type).to.eq('HASH');
        },
      },
      {
        name: 'Should throw error if non-existent index provided',
        data: {
          index: 'Invalid index',
        },
        statusCode: 500,
        responseBody: {
          message: 'Unknown Index name',
          error: 'Internal Server Error',
          statusCode: 500,
        },
      },
    ].forEach(mainCheckFn);
  });
});
