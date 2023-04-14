import { GraphVisualizationStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const isRecommendationReachedTests: any[] = [
  ['test', false],
  ['info', false],
  ['123', false],
  ['aoeutaoheu', false],
  ['GRAPH.QUERY', true],
  ['graph.query', true],
  ['GRAPH.query test 123', true],
  ['GRAPH.profile 123', true],
]

describe('GraphVisualizationStrategy', () => {
  let strategy: GraphVisualizationStrategy;

  beforeEach(async () => {
    strategy = new GraphVisualizationStrategy();
  });

  describe('isRecommendationReached', () => {
    it.each(isRecommendationReachedTests)('for input: %s (command), should be output: %s',
    async (command, expected) => {
      const result = await strategy.isRecommendationReached(command)
      expect(result).toBe(expected)
    })
  });
});
