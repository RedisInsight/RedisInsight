export interface IRecommendation {
  name: string
  read: boolean
}

export interface StateRecommendations {
  data: {
    recommendations: IRecommendation[]
    totalUnread: number
  },
  loading: boolean,
  error: string,
  isContentVisible: boolean,
}
