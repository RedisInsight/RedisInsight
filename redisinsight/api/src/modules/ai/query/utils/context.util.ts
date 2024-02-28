import { RedisClient, RedisClientNodeRole } from 'src/modules/redis/client';
import { uniq } from 'lodash';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';

export const getRediSearchIndexes = async (client: RedisClient) => {
  const nodes = await client.nodes(RedisClientNodeRole.PRIMARY);

  const res = await Promise.all(nodes.map(async (node) => node.sendCommand(
    ['FT._LIST'],
    {
      replyEncoding: 'utf8',
    },
  )));

  return uniq([].concat(...res));
};

export const getIndexAttributes = async (client: RedisClient, index: string) => {
  const res = convertArrayReplyToObject(await client.sendCommand(['ft.info', index], {
    replyEncoding: 'utf8',
  }) as string[]);

  return res?.attributes.map(convertArrayReplyToObject);
};

export const getAttributeContext = async (client: RedisClient, index: string, attribute: any) => {
  const context = {
    ...attribute,
    distinct_count: 0,
    top_values: [],
  };

  switch (attribute.type.toUpperCase()) {
    case 'TEXT':
    case 'TAG':
    case 'NUMERIC':
    case 'GEO':
      try {
        const [distinct, ...top] = await client.sendCommand([
          'FT.AGGREGATE',
          index,
          '*',
          'GROUPBY',
          '1',
          `@${attribute.attribute}`,
          'REDUCE',
          'COUNT',
          '0',
          'AS',
          'count',
          'SORTBY',
          '2',
          '@count',
          'DESC',
          'MAX',
          '5',
        ], { replyEncoding: 'utf8' }) as [string, ...string[]];

        context.distinct_count = parseInt(distinct, 10);
        context['top_values'] = [top?.map(([, value,, count]) => ({ value, count }))];
      } catch (e) {
        // ignore error
      }

      return context;
    default:
      return context;
  }
};

const quotesIfNeeded = (str: string) => {
  return str.indexOf(' ') > -1 ? JSON.stringify(str) : str;
};

const getIndexCreateStatement = async (client: RedisClient, index: string) => {
  try {
    const info = convertArrayReplyToObject(await client.sendCommand(['ft.info', index], {
      replyEncoding: 'utf8',
    }) as string[]);

    const attributes = info?.attributes.map(convertArrayReplyToObject);
    const definition = convertArrayReplyToObject(info?.index_definition);

    let statement = `FT.CREATE ${quotesIfNeeded(info['index_name'])} ON ${quotesIfNeeded(definition['key_type'])} PREFIX ${definition.prefixes.length}`;

    definition.prefixes.forEach((prefix) => {
      statement += ` ${quotesIfNeeded(prefix)}`;
    });

    if (definition.filter) {
      statement += ` FILTER ${definition.filter}`;
    }

    statement += ' SCHEMA';

    attributes.forEach((attr) => {
      statement += ` ${attr.identifier} AS ${attr.attribute} ${attr.type}`;
    });

    return statement;
  } catch (e) {
    // ignore error
  }
};

export const getIndexContext = async (client: RedisClient, index: string) => {
  const context = {
    index_name: index,
    create_statement: await getIndexCreateStatement(client, index),
    attributes: {},
  };

  const attributes = await getIndexAttributes(client, index);

  await Promise.all(attributes.map(async (attr) => {
    context.attributes[attr.attribute] = await getAttributeContext(client, index, attr);
  }));

  return context;
};

export const getFullDbContext = async (client: RedisClient): Promise<object> => {
  const context = {};

  const indexes = await getRediSearchIndexes(client);

  await Promise.all(indexes.map(async (index) => {
    context[index] = await getIndexContext(client, index);
  }));

  return context;
};
