import React, { useState } from 'react'
import { EuiPopover } from '@elastic/eui'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import cx from 'classnames'
import { isNull } from 'lodash'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import DatabaseNotOpened from 'uiSrc/components/messages/database-not-opened'

import { Link } from 'uiSrc/components/base/link/Link'
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
  const location = useLocation()

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const href = getRedirectionPage(url, instanceId, location.pathname)
    if (href) {
      history.push(href)
      return
    }

    if (isNull(href)) {
      setIsPopoverOpen(true)
    }
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
        scrollLock: true,
      }}
      button={
        <Link
          color="text"
          href="/"
          onClick={handleLinkClick}
          className={styles.link}
          data-testid="redisinsight-link"
        >
          {text}
        </Link>
      }
    >
      <DatabaseNotOpened />
    </EuiPopover>
  )
}

export default RedisInsightLink
