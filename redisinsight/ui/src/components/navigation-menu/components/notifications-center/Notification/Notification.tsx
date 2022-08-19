import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'
import { EuiTitleSize } from '@elastic/eui/src/components/title/title'
import cx from 'classnames'
import { format } from 'date-fns'
import parse from 'html-react-parser'
import React from 'react'

import { NOTIFICATION_DATE_FORMAT } from 'uiSrc/constants/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { truncateText } from 'uiSrc/utils'

import styles from '../styles.module.scss'

export interface Props {
  notification: IGlobalNotification
  titleSize?: EuiTitleSize
}

const Notification = (props: Props) => {
  const { notification, titleSize = 'xs' } = props

  return (
    <>
      <EuiTitle size={titleSize} className={styles.notificationTitle} data-testid="notification-title">
        <span>{notification.title}</span>
      </EuiTitle>

      <EuiText size="s" color="subdued" className={cx('notificationHTMLBody', styles.notificationBody)} data-testid="notification-body">
        {parse(notification.body)}
      </EuiText>

      <EuiFlexGroup className={styles.notificationFooter} alignItems="center" justifyContent="flexStart" gutterSize="none">
        <EuiFlexItem grow={false}>
          <EuiText
            size="xs"
            color="subdued"
            data-testid="notification-date"
          >
            {format(notification.timestamp * 1000, NOTIFICATION_DATE_FORMAT)}
          </EuiText>
        </EuiFlexItem>
        {notification.category && (
          <EuiFlexItem grow={false}>
            <EuiBadge
              className={styles.category}
              style={{ backgroundColor: notification.categoryColor ?? '#666' }}
            >
              {truncateText(notification.category, 32)}
            </EuiBadge>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  )
}

export default Notification
