import { EuiPopover, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { format } from 'date-fns'
import parse from 'html-react-parser'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchNotificationsAction,
  notificationCenterSelector,
  setIsCenterOpen,
  unreadNotificationsAction
} from 'uiSrc/slices/app/notifications'

import styles from './styles.module.scss'

const NotificationCenter = () => {
  const { isCenterOpen, notifications } = useSelector(notificationCenterSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (isCenterOpen) {
      dispatch(fetchNotificationsAction(
        (totalUnread) => {
          totalUnread && dispatch(unreadNotificationsAction())
        }
      ))
    }
  }, [isCenterOpen])

  const hasNotifications = !!notifications.length

  return (
    <EuiPopover
      anchorPosition="rightUp"
      isOpen={isCenterOpen}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverCenterWrapper)}
      anchorClassName={styles.popoverAnchor}
      closePopover={() => dispatch(setIsCenterOpen(false))}
      button={<div className={styles.popoverAnchor} />}
      initialFocus={false}
    >
      <div className={styles.popoverNotificationCenter} data-testid="notification-center">
        <EuiTitle size="xs" className={styles.title}>
          <span>Notification Center</span>
        </EuiTitle>
        {!hasNotifications && (
          <div className={styles.noItemsText}>
            <EuiText color="subdued" data-testud="no-notifications-text">No notifications to display.</EuiText>
          </div>
        )}
        {hasNotifications && (
          <div className={styles.notificationsList} data-testid="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.timestamp}
                className={cx(styles.notificationItem, { [styles.unread]: !notification.read })}
                data-testid={`notification-item-${notification.read ? 'read' : 'unread'}`}
              >
                <EuiText size="m" className={styles.notificationTitle} data-testid="notification-title">{notification.title}</EuiText>
                <EuiText
                  size="s"
                  color="subdued"
                  className={cx('notificationHTMLBody', styles.notificationBody)}
                  data-testid="notification-body"
                >
                  {parse(notification.body)}
                </EuiText>
                <EuiText
                  size="xs"
                  color="subdued"
                  textAlign="right"
                  className={styles.notificationDate}
                  data-testid="notification-date"
                >
                  {format(notification.timestamp, 'dd MMM yyyy')}
                </EuiText>
              </div>
            ))}
          </div>
        )}
      </div>
    </EuiPopover>
  )
}

export default NotificationCenter
