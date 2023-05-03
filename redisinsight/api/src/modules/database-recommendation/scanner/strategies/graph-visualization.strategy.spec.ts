import { GraphVisualizationStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const isRecommendationReachedTests: any[] = [
  ['test', { isReached: false }],
  ['info', { isReached: false }],
  ['123', { isReached: false }],
  ['aoeutaoheu', { isReached: false }],
  ['GRAPH.QUERY', { isReached: true }],
  ['graph.query', { isReached: true }],
  ['GRAPH.query test 123', { isReached: true }],
  ['GRAPH.profile 123', { isReached: true }],
];

describe('GraphVisualizationStrategy', () => {
  let strategy: GraphVisualizationStrategy;

  beforeEach(async () => {
    strategy = new GraphVisualizationStrategy();
  });

  describe('isRecommendationReached', () => {
    it.each(isRecommendationReachedTests)('for input: %s (command), should be output: %s',
      async (command, expected) => {
        const result = await strategy.isRecommendationReached(command);
        expect(result).toEqual(expected);
      });
  });
});
