import React, { useState } from 'react'
import { EuiLink, EuiPopover } from '@elastic/eui'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import DatabaseNotOpened from 'uiSrc/components/messages/database-not-opened'

import styles from './styles.module.scss'

export interface Props {
  url: string
  text: string
}

const RedisInsightLink = (props: Props) => {
  const { url, text } = props

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!instanceId) {
      setIsPopoverOpen(true)
      return
    }

    const href = getRedirectionPage(url, instanceId)
    if (href) {
      history.push(href)
      return
    }

    history.push('/')
  }

  return (
    <EuiPopover
      ownFocus
      initialFocus={false}
      className={styles.popoverAnchor}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
      anchorClassName={styles.popoverAnchor}
      anchorPosition="upLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      focusTrapProps={{
        scrollLock: true
      }}
      button={(
        <EuiLink
          color="text"
          external={false}
          href="/"
          onClick={handleLinkClick}
          className={styles.link}
          data-testid="redisinsight-link"
        >
          {text}
        </EuiLink>
      )}
    >
      <DatabaseNotOpened />
    </EuiPopover>
  )
}

export default RedisInsightLink
