import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

export interface IRecommendation {
  id: string
  name: string
  read: boolean
  tutorial: string
  vote: Nullable<Vote>
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
