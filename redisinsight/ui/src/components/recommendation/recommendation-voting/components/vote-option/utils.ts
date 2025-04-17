import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'
import LikeIcon from 'uiSrc/assets/img/icons/like.svg?react'
import DislikeIcon from 'uiSrc/assets/img/icons/dislike.svg?react'

export const getVotedText = (vote: Nullable<Vote>) =>
  vote === Vote.Like
    ? 'Share your ideas with us.'
    : 'Tell us how we can improve.'

export const voteTooltip = Object.freeze({
  [Vote.Like]: 'Useful',
  [Vote.Dislike]: 'Not Useful',
})

export const iconType = {
  [Vote.Like]: LikeIcon,
  [Vote.Dislike]: DislikeIcon,
}
