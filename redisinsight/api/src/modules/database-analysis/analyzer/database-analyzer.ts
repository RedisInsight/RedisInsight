import {
  sortBy, set, get, map,
} from 'lodash';

export class DatabaseAnalyzer {
  async analyze(keys) {
    const analysis = {
      totalMemory: new Map(),
      totalKeys: new Map(),
      topMemoryNamespaces: new Map(),
      topKeysNamespaces: new Map(),
    };

    keys.forEach((key) => {
      // namespaces
      const namespace = key.name.toString().split(':')[0];

      // Keys nsp
      const keysNsp = analysis.topKeysNamespaces.get(namespace) || {
        total: 0,
      };

      keysNsp.total += 1;
      set(keysNsp, ['types', key.type], get(keysNsp, ['types', key.type], 0) + 1);
      analysis.topKeysNamespaces.set(namespace, keysNsp);

      // Memory nsp
      const memoryNsp = analysis.topMemoryNamespaces.get(namespace) || {
        total: 0,
      };

      memoryNsp.total += key.size;
      set(memoryNsp, ['types', key.type], get(memoryNsp, ['types', key.type], 0) + key.size);
      analysis.topMemoryNamespaces.set(namespace, memoryNsp);

      // Total memory
      analysis.totalMemory.set(
        key.type,
        (analysis.totalMemory.get(key.type) || 0) + key.size,
      );

      // Total keys
      analysis.totalKeys.set(
        key.type,
        (analysis.totalKeys.get(key.type) || 0) + key.size,
      );
    });

    return {
      totalKeys: [...analysis.totalKeys.keys()].map((type) => ({
        type,
        total: analysis.totalKeys.get(type),
      })),
      totalMemory: [...analysis.totalMemory.keys()].map((type) => ({
        type,
        total: analysis.totalMemory.get(type),
      })),
      topKeysNsp: (sortBy([...analysis.topKeysNamespaces.keys()].map((nsp) => {
        const data = analysis.topKeysNamespaces.get(nsp);
        return {
          ...data,
          nsp,
          types: map(data.types, (total, type) => ({ type, total })),
        };
      }), ['total'])).reverse().slice(0, 15),
      topMemoryNsp: (sortBy([...analysis.topMemoryNamespaces.keys()].map((nsp) => {
        const data = analysis.topMemoryNamespaces.get(nsp);
        return {
          ...data,
          nsp,
          types: map(data.types, (total, type) => ({ type, total })),
        };
      }), ['total'])).reverse().slice(0, 15),
      topKeysMemory: sortBy(keys, ['size']).reverse().slice(0, 15).map((key) => ({
        ...key,
        name: key.name.toString(),
      })), // todo: add existing
      topKeysLength: sortBy(keys, ['length']).reverse().slice(0, 15).map((key) => ({
        ...key,
        name: key.name.toString(),
      })), // todo: add existing
    };
  }
}
