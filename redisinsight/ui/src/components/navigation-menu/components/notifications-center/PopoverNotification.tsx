import { EuiButtonIcon, EuiPopover, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { format } from 'date-fns'
import parse from 'html-react-parser'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationCenterSelector, setIsCenterOpen, setIsNotificationOpen } from 'uiSrc/slices/app/notifications'

import styles from './styles.module.scss'

const CLOSE_NOTIFICATION_TIME = 6000

const PopoverNotification = () => {
  const { isNotificationOpen, isCenterOpen, lastReceivedNotification } = useSelector(notificationCenterSelector)
  const [isHovering, setIsHovering] = useState(false)
  const [isShowNotification, setIsShowNotification] = useState(false)

  const timeOutRef = useRef<NodeJS.Timeout>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (isShowNotification && isCenterOpen) {
      onCloseNotification()
      return
    }

    // if notification center is opened - wait closing and show notification
    if (isNotificationOpen && !isCenterOpen) {
      setTimeout(() => {
        setIsShowNotification(isNotificationOpen)
      }, 300)
    }
  }, [isNotificationOpen, isCenterOpen])

  useEffect(() => {
    if (isShowNotification) {
      if (isHovering) {
        timeOutRef.current && clearTimeout(timeOutRef.current)
        return
      }

      timeOutRef.current = setTimeout(onCloseNotification, CLOSE_NOTIFICATION_TIME)
    }
  }, [isShowNotification, isHovering])

  const onCloseNotification = () => {
    setIsShowNotification(false)
    dispatch(setIsNotificationOpen(false))
  }

  const onMouseUpPopover = () => {
    if (!window.getSelection()?.toString()) {
      dispatch(setIsCenterOpen())
    }
  }

  return (
    <>
      {lastReceivedNotification && (
        <EuiPopover
          initialFocus={false}
          anchorPosition="rightUp"
          isOpen={isShowNotification}
          closePopover={() => {}}
          anchorClassName={styles.popoverAnchor}
          panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverNotificationTooltip)}
          button={<div className={styles.popoverAnchor} />}
          onMouseUp={onMouseUpPopover}
        >
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={styles.popoverNotification}
            data-testid="notification-popover"
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              aria-label="Close notification"
              className={styles.closeBtn}
              onMouseUp={(e: React.MouseEvent) => e.stopPropagation()}
              onClick={onCloseNotification}
              data-testid="close-notification-btn"
            />

            <EuiTitle size="xs" className={styles.notificationTitle} data-testid="notification-title">
              <span>{lastReceivedNotification.title}</span>
            </EuiTitle>

            <EuiText size="s" color="subdued" className={cx('notificationHTMLBody', styles.notificationBody)} data-testid="notification-body">
              {parse(lastReceivedNotification.body)}
            </EuiText>

            <EuiText size="xs" color="subdued" textAlign="right" className={styles.notificationDate} data-testid="notification-date">
              {format(lastReceivedNotification.timestamp, 'dd MMM yyyy')}
            </EuiText>
          </div>
        </EuiPopover>
      )}
    </>
  )
}

export default PopoverNotification
