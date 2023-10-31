import { IRedisClusterNode } from 'src/models';

/**
 * @deprecated todo: remove
 */
export const convertBulkStringsToObject = (
  info: string,
  entitiesSeparator = '\r\n',
  KVSeparator = ':',
): any => {
  const entities = info.split(entitiesSeparator);
  try {
    const obj = {};
    entities.forEach((line: string) => {
      if (line && line.split) {
        const keyValuePair = line.split(KVSeparator);
        if (keyValuePair.length > 1) {
          const key = keyValuePair.shift();
          obj[key] = keyValuePair.join(KVSeparator);
        }
      }
    });
    return obj;
  } catch (e) {
    return {};
  }
};

export const convertRedisInfoReplyToObject = (info: string): any => {
  try {
    const result = {};
    const sections = info.match(/(?<=#\s+).*?(?=[\n,\r])/g);
    const values = info.split(/#.*?[\n,\r]/g);
    values.shift();
    sections.forEach((section: string, index: number) => {
      result[section.toLowerCase()] = convertBulkStringsToObject(
        values[index].trim(),
      );
    });
    return result;
  } catch (e) {
    return {};
  }
};

/**
 * @deprecated
 */
export const parseClusterNodes = (info: string): IRedisClusterNode[] => {
  const lines = info.split('\n');
  try {
    const nodes = [];
    lines.forEach((line: string) => {
      if (line && line.split) {
        // fields = [id, endpoint, flags, master, pingSent, pongRecv, configEpoch, linkState, slot]
        const fields = line.split(' ');
        const [
          id,
          endpoint,,
          master,,,,
          linkState,
          slot,
        ] = fields;
        const host = endpoint.split(':')[0];
        const port = endpoint.split(':')[1].split('@')[0];
        nodes.push({
          id,
          host,
          port: parseInt(port, 10),
          replicaOf: master !== '-' ? master : undefined,
          linkState,
          slot,
        });
      }
    });
    return nodes;
  } catch (e) {
    return [];
  }
};
