import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationCenterSelector, setIsCenterOpen } from 'uiSrc/slices/app/notifications'

import NotificationCenter from './NotificationCenter'
import PopoverNotification from './PopoverNotification'

import navStyles from '../../styles.module.scss'
import styles from './styles.module.scss'

const NavButton = () => {
  const { isCenterOpen, isNotificationOpen, totalUnread } = useSelector(notificationCenterSelector)

  const dispatch = useDispatch()

  const onClickIcon = () => {
    dispatch(setIsCenterOpen())
  }

  const Btn = (
    <EuiButtonIcon
      className={cx(navStyles.navigationButton, styles.notificationIcon, { [styles.active]: isCenterOpen })}
      iconType="bell"
      iconSize="l"
      aria-label="Notification Menu"
      onMouseDownCapture={onClickIcon}
      data-testid="notification-menu-button"
    />
  )

  return (
    <div className={styles.navBtnWrapper}>
      {!isCenterOpen && !isNotificationOpen ? (<EuiToolTip content="Notification Center" position="right">{Btn}</EuiToolTip>) : Btn}
      {(totalUnread > 0 && !isCenterOpen) && (
        <div className={styles.badgeUnreadCount} data-testid="total-unread-badge">
          {totalUnread > 9 ? '9+' : totalUnread}
        </div>
      )}
    </div>
  )
}

const NotificationMenu = () => (
  <div className={styles.wrapper} data-testid="notification-menu">
    <NavButton />
    <NotificationCenter />
    <PopoverNotification />
  </div>
)

export default NotificationMenu
