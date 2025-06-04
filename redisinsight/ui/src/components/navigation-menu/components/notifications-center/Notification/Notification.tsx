import { EuiText, EuiTitle } from '@elastic/eui'
import { EuiTitleSize } from '@elastic/eui/src/components/title/title'
import cx from 'classnames'
import { format } from 'date-fns'
import parse from 'html-react-parser'
import React from 'react'

import { NOTIFICATION_DATE_FORMAT } from 'uiSrc/constants/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { truncateText } from 'uiSrc/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import styles from '../styles.module.scss'

export interface Props {
  notification: IGlobalNotification
  titleSize?: EuiTitleSize
}

const Notification = (props: Props) => {
  const { notification, titleSize = 'xs' } = props

  return (
    <>
      <EuiTitle
        size={titleSize}
        className={styles.notificationTitle}
        data-testid="notification-title"
      >
        <span>{notification.title}</span>
      </EuiTitle>

      <EuiText
        size="s"
        color="subdued"
        className={cx('notificationHTMLBody', styles.notificationBody)}
        data-testid="notification-body"
      >
        {parse(notification.body)}
      </EuiText>

      <Row className={styles.notificationFooter} align="center" justify="start">
        <FlexItem>
          <EuiText size="xs" color="subdued" data-testid="notification-date">
            {format(notification.timestamp * 1000, NOTIFICATION_DATE_FORMAT)}
          </EuiText>
        </FlexItem>
        {notification.category && (
          <FlexItem>
            <RiBadge
              variant="light"
              className={styles.category}
              style={{ backgroundColor: notification.categoryColor ?? '#666' }}
              data-testid="notification-category"
              label={truncateText(notification.category, 32)}
            />
          </FlexItem>
        )}
      </Row>
    </>
  )
}

export default Notification
