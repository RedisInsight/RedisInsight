import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

export const getTooltipContent = (vote: Nullable<Vote>) => (vote === Vote.Like
  ? 'Share your ideas with us.'
  : 'Tell us how we can improve.'
)
