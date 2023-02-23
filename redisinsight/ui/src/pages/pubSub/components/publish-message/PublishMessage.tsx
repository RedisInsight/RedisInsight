import {
  EuiBadge,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon
} from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { appContextPubSub, setPubSubFieldsContext } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { publishMessageAction } from 'uiSrc/slices/pubsub/pubsub'
import { ReactComponent as UserIcon } from 'uiSrc/assets/img/icons/user.svg'

import styles from './styles.module.scss'

const HIDE_BADGE_TIMER = 3000

const PublishMessage = () => {
  const { channel: channelContext, message: messageContext } = useSelector(appContextPubSub)
  const { connectionType } = useSelector(connectedInstanceSelector)

  const [channel, setChannel] = useState<string>(channelContext)
  const [message, setMessage] = useState<string>(messageContext)
  const [isShowBadge, setIsShowBadge] = useState<boolean>(false)
  const [affectedClients, setAffectedClients] = useState<number>(0)

  const fieldsRef = useRef({ channel, message })
  const timeOutRef = useRef<NodeJS.Timeout>()

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setPubSubFieldsContext(fieldsRef.current))
    timeOutRef.current && clearTimeout(timeOutRef.current)
  }, [])

  useEffect(() => {
    fieldsRef.current = { channel, message }
  }, [channel, message])

  useEffect(() => {
    if (isShowBadge) {
      timeOutRef.current = setTimeout(() => {
        isShowBadge && setIsShowBadge(false)
      }, HIDE_BADGE_TIMER)

      return
    }

    timeOutRef.current && clearTimeout(timeOutRef.current)
  }, [isShowBadge])

  const onSuccess = (affected: number) => {
    setMessage('')
    setAffectedClients(affected)
    setIsShowBadge(true)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setIsShowBadge(false)
    dispatch(publishMessageAction(instanceId, channel, message, onSuccess))
  }

  return (
    <EuiForm className={styles.container} component="form" onSubmit={onFormSubmit}>
      <EuiFlexItem className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}>
        <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
          <EuiFlexItem className={styles.channelWrapper} grow>
            <EuiFormRow fullWidth>
              <EuiFieldText
                fullWidth
                name="channel"
                id="channel"
                placeholder="Enter Channel Name"
                value={channel}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setChannel(e.target.value)}
                autoComplete="off"
                data-testid="field-channel-name"
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem className={styles.messageWrapper} grow>
            <EuiFormRow fullWidth>
              <>
                <EuiFieldText
                  fullWidth
                  className={cx(styles.messageField, { [styles.showBadge]: isShowBadge })}
                  name="message"
                  id="message"
                  placeholder="Enter Message"
                  value={message}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  autoComplete="off"
                  data-testid="field-message"
                />
                <EuiBadge className={cx(styles.badge, { [styles.show]: isShowBadge })} data-testid="affected-clients-badge">
                  <EuiIcon className={styles.iconCheckBadge} type="check" />
                  {connectionType !== ConnectionType.Cluster && (
                    <>
                      <span className={styles.affectedClients} data-testid="affected-clients">{affectedClients}</span>
                      <EuiIcon className={styles.iconUserBadge} type={UserIcon || 'user'} />
                    </>
                  )}
                </EuiBadge>
              </>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexGroup responsive={false} justifyContent="flexEnd" style={{ marginTop: 6 }}>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            color="secondary"
            type="submit"
            data-testid="publish-message-submit"
          >
            Publish
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  )
}

export default PublishMessage
