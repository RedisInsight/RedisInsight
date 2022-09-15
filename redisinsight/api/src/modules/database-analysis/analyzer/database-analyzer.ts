import {
  sortBy, set, get, map,
} from 'lodash';

export class DatabaseAnalyzer {
  async analyze(keys) {
    const analysis = {
      namespaces: new Map(),
      totalMemory: new Map(),
      totalKeys: new Map(),
    };

    keys.forEach((key) => {
      // namespaces
      const nsp = key.name.toString().split(':')[0];

      const namespace = analysis.namespaces.get(nsp) || {
        memory: 0,
        keys: 0,
        types: new Map(),
      };

      namespace.keys += 1;
      namespace.memory += key.memory;

      const namespaceType = namespace.types.get(key.type) || {
        memory: 0,
        keys: 0,
      };

      namespaceType.keys += 1;
      namespaceType.memory += key.memory;

      namespace.types.set(key.type, namespaceType);
      analysis.namespaces.set(nsp, namespace);

      // Total memory
      analysis.totalMemory.set(
        key.type,
        (analysis.totalMemory.get(key.type) || 0) + key.memory,
      );

      // Total keys
      analysis.totalKeys.set(
        key.type,
        (analysis.totalKeys.get(key.type) || 0) + 1,
      );
    });

    console.log('___nsp', analysis.namespaces)
    return {
      // totalKeys: [...analysis.totalKeys.keys()].map((type) => ({
      //   type,
      //   total: analysis.totalKeys.get(type),
      // })),
      // totalMemory: [...analysis.totalMemory.keys()].map((type) => ({
      //   type,
      //   total: analysis.totalMemory.get(type),
      // })),
      topKeysNsp: (sortBy([...analysis.namespaces.keys()].map((nsp) => {
        const summary = analysis.namespaces.get(nsp);
        return {
          nsp,
          ...summary,
          types: sortBy([...summary.types.keys()].map((type) => {
            const typeSummary = summary.types.get(type);
            // console.log('___type', type, typeSummary)
            return {
              type,
              ...typeSummary,
            };
          }), ['keys']).reverse(),
        };
      }), ['keys'])).reverse().slice(0, 15),
      topMemoryNsp: (sortBy([...analysis.namespaces.keys()].map((nsp) => {
        const summary = analysis.namespaces.get(nsp);
        return {
          nsp,
          ...summary,
          types: sortBy([...summary.types.keys()].map((type) => {
            const typeSummary = summary.types.get(type);
            // console.log('___type', type, typeSummary)
            return {
              type,
              ...typeSummary,
            };
          }), ['memory']).reverse(),
        };
      }), ['keys'])).reverse().slice(0, 15),
      // topKeysMemory: sortBy(keys, ['size']).reverse().slice(0, 15).map((key) => ({
      //   ...key,
      //   name: key.name.toString(),
      // })), // todo: add existing
      // topKeysLength: sortBy(keys, ['length']).reverse().slice(0, 15).map((key) => ({
      //   ...key,
      //   name: key.name.toString(),
      // })), // todo: add existing
    };
  }
}
