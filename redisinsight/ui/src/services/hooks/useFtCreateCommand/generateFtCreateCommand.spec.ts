import { generateFtCreateCommand } from './generateFtCreateCommand'

describe('generateFtCreateCommand', () => {
  it('should generate basic FT.CREATE for HASH with TEXT and NUMERIC fields', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:products',
      dataType: 'HASH',
      prefixes: ['products:'],
      schema: [
        { name: 'name', type: 'TEXT', sortable: true },
        { name: 'price', type: 'NUMERIC' },
      ],
    })

    expect(result).toBe(
      [
        'FT.CREATE idx:products',
        'ON HASH',
        'PREFIX 1 "products:"',
        'SCHEMA',
        '"name" TEXT SORTABLE',
        '"price" NUMERIC',
      ].join('\n'),
    )
  })

  it('should support JSON paths with AS aliasing', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:users',
      dataType: 'JSON',
      schema: [
        { name: 'fullName', type: 'TEXT', as: 'name', nostem: true },
        { name: 'age', type: 'NUMERIC', sortable: true },
      ],
    })

    expect(result).toBe(
      [
        'FT.CREATE idx:users',
        'ON JSON',
        'SCHEMA',
        '$.fullName AS name TEXT NOSTEM',
        '$.age NUMERIC SORTABLE',
      ].join('\n'),
    )
  })

  it('should include VECTOR fields with parameters', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:embeddings',
      dataType: 'HASH',
      prefixes: ['vec:'],
      schema: [
        {
          name: 'embedding',
          type: 'VECTOR',
          algorithm: 'FLAT',
          vectorType: 'FLOAT32',
          dim: 768,
          distance: 'L2',
          initialCap: 100,
          blockSize: 200,
        },
      ],
    })

    expect(result).toContain('VECTOR "FLAT"')
    expect(result).toContain('"TYPE" FLOAT32')
    expect(result).toContain('"DIM" 768')
    expect(result).toContain('"DISTANCE_METRIC" "L2"')
    expect(result).toContain('"INITIAL_CAP" 100')
    expect(result).toContain('"BLOCK_SIZE" 200')
  })

  it('should handle empty stopwords', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:noStop',
      dataType: 'HASH',
      schema: [{ name: 'text', type: 'TEXT' }],
      stopwords: [],
    })

    expect(result).toContain('STOPWORDS 0')
  })

  it('should include quoted stopwords', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:stopwords',
      dataType: 'HASH',
      schema: [{ name: 'text', type: 'TEXT' }],
      stopwords: ['the', 'and', 'but'],
    })

    expect(result).toContain('STOPWORDS 3 "the" "and" "but"')
  })
})
