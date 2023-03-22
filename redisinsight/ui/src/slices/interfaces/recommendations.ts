export interface IRecommendation {
  name: string
  read: boolean
}

export interface IRecommendations {
  recommendations: IRecommendation[]
  totalUnread: number
}
export interface StateRecommendations {
  data: IRecommendations,
  loading: boolean,
  error: string,
  isContentVisible: boolean,
  isHighlighted: boolean,
}
