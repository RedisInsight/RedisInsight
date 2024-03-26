import { chunk, keyBy } from 'lodash';

type ArrayReplyEntry = string | string[];

const quotesIfNeeded = (str: string) => (str.indexOf(' ') > -1 ? JSON.stringify(str) : str);

// ====================================================================
// Reply converter
// ====================================================================
export const convertArrayReplyToObject = (
  input: ArrayReplyEntry[],
): { [key: string]: any } => {
  const obj = {};

  chunk(input, 2).forEach(([key, value]) => {
    obj[key as string] = value;
  });

  return obj;
};

export const convertIndexInfoAttributeReply = (input: string[]): object => {
  const attribute = convertArrayReplyToObject(input);
  attribute['SORTABLE'] = input.includes('SORTABLE') || undefined;
  attribute['NOINDEX'] = input.includes('NOINDEX') || undefined;
  attribute['CASESENSITIVE'] = input.includes('CASESENSITIVE') || undefined;
  attribute['UNF'] = input.includes('UNF') || undefined;
  attribute['NOSTEM'] = input.includes('NOSTEM') || undefined;

  return attribute;
};

export const convertIndexInfoReply = (input: ArrayReplyEntry[]): object => {
  const infoReply = convertArrayReplyToObject(input);
  infoReply['index_definition'] = convertArrayReplyToObject(infoReply['index_definition']);
  infoReply['attributes'] = infoReply['attributes'].map(convertIndexInfoAttributeReply);

  return infoReply;
};

// ====================================================================
// Context creation
// ====================================================================

export const createIndexCreateStatement = (info: object) => {
  try {
    const definition = info['index_definition'];

    let statement = `FT.CREATE ${quotesIfNeeded(info['index_name'])} ON ${quotesIfNeeded(definition['key_type'])}`;

    if (definition['prefixes'].length) {
      statement += `PREFIX ${definition['prefixes'].length}`;

      definition['prefixes'].forEach((prefix) => {
        statement += ` ${quotesIfNeeded(prefix)}`;
      });
    }

    if (definition.filter) {
      statement += ` FILTER ${definition.filter}`;
    }

    statement += ' SCHEMA';

    info['attributes'].forEach((attr) => {
      statement += ` ${attr.identifier} AS ${attr.attribute} ${attr.type}`;
    });

    return statement;
  } catch (e) {
    // ignore error
    return undefined;
  }
};

export const createIndexAttributeContext = (input: object): object => ({
  ...input,
});

export const createIndexContext = (info: object): object => {
  const context = {
    index_name: info['index_name'],
    create_statement: createIndexCreateStatement(info),
    attributes: {},
  };

  context['attributes'] = keyBy(info['attributes'], 'attribute');

  return context;
};

export const createRedisearchIndexesContextFromArrayReplies = (indexesInfoReplies: string[][]): object => {
  const context = {};

  indexesInfoReplies.forEach((infoReply) => {
    const info = convertIndexInfoReply(infoReply);
    const indexContext = createIndexContext(info);
    context[indexContext['index_name']] = indexContext;
  });

  return context;
};

export const createRedisearchIndexesContextFromObjects = (indexesInfo: object[]): object => {
  const context = {};

  indexesInfo.forEach((info) => {
    const indexContext = createIndexContext(info);
    context[indexContext['index_name']] = indexContext;
  });

  return context;
};
