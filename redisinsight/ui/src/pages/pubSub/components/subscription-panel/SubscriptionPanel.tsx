import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { PUB_SUB_DEFAULT_CHANNEL } from 'uiSrc/pages/pubSub/PubSubPage'
import { pubSubSelector, toggleSubscribeTriggerPubSub } from 'uiSrc/slices/pubsub/pubsub'

import { ReactComponent as UserInCircle } from 'uiSrc/assets/img/icons/user_in_circle.svg'
import SubscribedIconDark from 'uiSrc/assets/img/pub-sub/subscribed.svg'
import SubscribedIconLight from 'uiSrc/assets/img/pub-sub/subscribed-lt.svg'
import NotSubscribedIconDark from 'uiSrc/assets/img/pub-sub/not-subscribed.svg'
import NotSubscribedIconLight from 'uiSrc/assets/img/pub-sub/not-subscribed-lt.svg'

import styles from './styles.module.scss'

const SubscriptionPanel = () => {
  const { isSubscribed, loading, count } = useSelector(pubSubSelector)

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const toggleSubscribe = () => {
    dispatch(toggleSubscribeTriggerPubSub([PUB_SUB_DEFAULT_CHANNEL]))
  }

  const subscribedIcon = theme === Theme.Dark ? SubscribedIconDark : SubscribedIconLight
  const notSubscribedIcon = theme === Theme.Dark ? NotSubscribedIconDark : NotSubscribedIconLight

  const displayMessages = count !== 0 || isSubscribed

  return (
    <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" gutterSize="s" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup alignItems="center" gutterSize="none" responsive={false}>
          <EuiFlexItem grow={false} className={styles.iconSubscribe}>
            <EuiIcon
              className={styles.iconUser}
              type={isSubscribed ? subscribedIcon : notSubscribedIcon}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText color="subdued" size="s" data-testid="subscribe-status-text">
              You are { !isSubscribed && 'not' } subscribed
            </EuiText>
          </EuiFlexItem>
          {displayMessages && (
            <EuiFlexItem grow={false} style={{ marginLeft: 12 }}>
              <EuiText color="subdued" size="s" data-testid="messages-count">Messages: {count}</EuiText>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>

      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton
          fill={!isSubscribed}
          size="s"
          color="secondary"
          className={styles.buttonSubscribe}
          type="submit"
          onClick={toggleSubscribe}
          iconType={isSubscribed ? 'minusInCircle' : UserInCircle}
          data-testid="btn-submit"
          disabled={loading}
        >
          { isSubscribed ? 'Unsubscribe' : 'Subscribe' }
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default SubscriptionPanel
