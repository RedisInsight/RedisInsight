import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { getTruncatedName } from 'uiSrc/utils'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import styles from './styles.module.scss'

export interface Props {
  name: string
}

const UserAvatar = () => {
  const { data } = useSelector(oauthCloudUserSelector)
  return (
    <div
      role="presentation"
      className={styles.profileBtn}
    >
      {getTruncatedName(data?.name) || 'R'}
    </div>
  )
}

export default memo(UserAvatar)
