import { EuiButton, EuiButtonIcon, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { clearPubSubMessages, pubSubSelector, toggleSubscribeTriggerPubSub } from 'uiSrc/slices/pubsub/pubsub'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import UserInCircle from 'uiSrc/assets/img/icons/user_in_circle.svg?react'
import SubscribedIconDark from 'uiSrc/assets/img/pub-sub/subscribed.svg'
import SubscribedIconLight from 'uiSrc/assets/img/pub-sub/subscribed-lt.svg'
import NotSubscribedIconDark from 'uiSrc/assets/img/pub-sub/not-subscribed.svg'
import NotSubscribedIconLight from 'uiSrc/assets/img/pub-sub/not-subscribed-lt.svg'

import styles from './styles.module.scss'

const SubscriptionPanel = () => {
  const { messages, isSubscribed, loading, count } = useSelector(pubSubSelector)

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [channels, setChannels] = useState('')

  const toggleSubscribe = () => {
    dispatch(toggleSubscribeTriggerPubSub(channels))
  }

  const onClickClear = () => {
    dispatch(clearPubSubMessages())
    sendEventTelemetry({
      event: TelemetryEvent.PUBSUB_MESSAGES_CLEARED,
      eventData: {
        databaseId: instanceId,
        messages: count
      }
    })
  }

  const subscribedIcon = theme === Theme.Dark ? SubscribedIconDark : SubscribedIconLight
  const notSubscribedIcon = theme === Theme.Dark ? NotSubscribedIconDark : NotSubscribedIconLight

  const displayMessages = count !== 0 || isSubscribed

  return (
    <EuiFlexGroup className={styles.container} alignItems="center" justifyContent="spaceBetween" gutterSize="s" responsive={false}>
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
        <EuiFlexGroup alignItems="center" gutterSize="none" responsive={false}>
          <EuiFlexItem grow={false} className={styles.channels}>
            <EuiFieldText
              value={channels}
              disabled={isSubscribed}
              className={styles.channels}
              onChange={(e) => setChannels(e.target.value)}
              placeholder="Enter Channel to Subscribe"
              aria-label="channel names for filtering"
              data-testid="channels-input"
            />
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
              data-testid="subscribe-btn"
              disabled={loading}
            >
              { isSubscribed ? 'Unsubscribe' : 'Subscribe' }
            </EuiButton>
          </EuiFlexItem>
          {!!messages.length && (
            <EuiFlexItem grow={false} style={{ marginLeft: 8 }}>
              <EuiToolTip
                content="Clear Messages"
                anchorClassName={cx('inline-flex')}
              >
                <EuiButtonIcon
                  iconType="eraser"
                  onClick={onClickClear}
                  aria-label="clear pub sub"
                  data-testid="clear-pubsub-btn"
                />
              </EuiToolTip>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default SubscriptionPanel
