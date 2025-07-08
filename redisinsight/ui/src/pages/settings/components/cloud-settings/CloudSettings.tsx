import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DeleteIcon } from 'uiSrc/components/base/icons'
import {
  getCapiKeysAction,
  oauthCapiKeysSelector,
  removeAllCapiKeysAction,
} from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover } from 'uiSrc/components/base'
import UserApiKeysTable from './components/user-api-keys-table'

import styles from './styles.module.scss'

const CloudSettings = () => {
  const { loading, data } = useSelector(oauthCapiKeysSelector)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCapiKeysAction())
  }, [])

  const handleClickDelete = () => {
    setIsDeleteOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED,
    })
  }

  const handleDeleteAllKeys = () => {
    setIsDeleteOpen(false)
    dispatch(
      removeAllCapiKeysAction(() => {
        sendEventTelemetry({
          event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVED,
        })
      }),
    )
  }

  return (
    <div className={styles.container}>
      <Title className={styles.title} size="XS">
        API user keys
      </Title>
      <Spacer size="s" />
      <Row gap="m" responsive>
        <FlexItem grow>
          <Text size="s" className={styles.smallText} color="subdued">
            The list of API user keys that are stored locally in Redis Insight.{' '}
            <br />
            API user keys grant programmatic access to Redis Cloud. <br />
            {'To delete API keys from Redis Cloud, '}
            <Link
              target="_blank"
              color="text"
              href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
            >
              sign in to Redis Cloud
            </Link>
            {' and delete them manually.'}
          </Text>
        </FlexItem>
        <FlexItem grow={false}>
          <RiPopover
            anchorPosition="downCenter"
            ownFocus
            isOpen={isDeleteOpen}
            closePopover={() => setIsDeleteOpen(false)}
            panelPaddingSize="l"
            panelClassName={styles.deletePopover}
            button={
              <PrimaryButton
                size="small"
                onClick={handleClickDelete}
                disabled={loading || !data?.length}
                data-testid="delete-key-btn"
              >
                Remove all API keys
              </PrimaryButton>
            }
          >
            <div className={styles.popoverDeleteContainer}>
              <Text size="m" component="div">
                <h4>All API user keys will be removed from Redis Insight.</h4>
                {'To delete API keys from Redis Cloud, '}
                <Link
                  target="_blank"
                  color="text"
                  tabIndex={-1}
                  href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </Link>
                {' and delete them manually.'}
              </Text>
              <Spacer />
              <div className={styles.popoverFooter}>
                <DestructiveButton
                  size="small"
                  icon={DeleteIcon}
                  onClick={handleDeleteAllKeys}
                  className={styles.popoverDeleteBtn}
                  data-testid="delete-key-confirm-btn"
                >
                  Remove all API keys
                </DestructiveButton>
              </div>
            </div>
          </RiPopover>
        </FlexItem>
      </Row>
      <Spacer />
      <UserApiKeysTable items={data} loading={loading} />
    </div>
  )
}

export default CloudSettings
