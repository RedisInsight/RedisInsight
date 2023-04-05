export interface IRecommendationStrategy {
  isRecommendationReached(data: any): Promise<boolean>
}
