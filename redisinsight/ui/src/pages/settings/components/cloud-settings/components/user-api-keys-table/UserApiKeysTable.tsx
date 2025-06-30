import React, { useCallback, useState } from 'react'
import { EuiToolTip, EuiIcon } from '@elastic/eui'
import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { isNull } from 'lodash'

import { formatLongName, Nullable } from 'uiSrc/utils'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import {
  CloudCapiKey,
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'
import { Text } from 'uiSrc/components/base/text'

import CloudStars from 'uiSrc/assets/img/oauth/stars.svg?react'

import {
  EmptyButton,
  IconButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

export interface Props {
  items: Nullable<CloudCapiKey[]>
  loading: boolean
}

const UserApiKeysTable = ({ items, loading }: Props) => {
  const [deleting, setDeleting] = useState('')
  const dispatch = useDispatch()

  const handleCopy = (value: string) => {
    navigator?.clipboard?.writeText(value)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_NAME_COPIED,
    })
  }

  const showPopover = useCallback((id = '') => {
    setDeleting(id)
  }, [])

  const handleClickDeleteApiKey = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED,
      eventData: {
        source: OAuthSocialSource.SettingsPage,
      },
    })
  }

  const handleDeleteApiKey = (id: string, name: string) => {
    setDeleting('')
    dispatch(
      removeCapiKeyAction({ id, name }, () => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
          eventData: {
            source: OAuthSocialSource.SettingsPage,
          },
        })
      }),
    )
  }

  const columns: ColumnDefinition<CloudCapiKey>[] = [
    {
      header: 'API Key Name',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({
        row: {
          original: { name, valid },
        },
      }) => {
        const tooltipContent = formatLongName(name)
        return (
          <div className={styles.nameField}>
            {!valid && (
              <EuiToolTip
                content="This API key is invalid. Remove it from Redis Cloud and create a new one instead."
                anchorClassName={styles.invalidIconAnchor}
              >
                <EuiIcon
                  className={styles.invalidIcon}
                  type="alert"
                  color="danger"
                />
              </EuiToolTip>
            )}
            <EuiToolTip title="API Key Name" content={tooltipContent}>
              <>{name}</>
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      header: 'Created',
      id: 'createdAt',
      accessorKey: 'createdAt',
      enableSorting: true,
      cell: ({
        row: {
          original: { createdAt },
        },
      }) => (
        <EuiToolTip
          content={format(new Date(createdAt), 'HH:mm:ss d LLL yyyy')}
        >
          <>{format(new Date(createdAt), 'd MMM yyyy')}</>
        </EuiToolTip>
      ),
    },
    {
      header: 'Last used',
      id: 'lastUsed',
      accessorKey: 'lastUsed',
      enableSorting: true,
      cell: ({
        row: {
          original: { lastUsed },
        },
      }) => (
        <>
          {lastUsed ? (
            <EuiToolTip
              content={format(new Date(lastUsed), 'HH:mm:ss d LLL yyyy')}
            >
              <>{format(new Date(lastUsed), 'd MMM yyyy')}</>
            </EuiToolTip>
          ) : (
            'Never'
          )}
        </>
      ),
    },
    {
      header: '',
      id: 'actions',
      accessorKey: 'id',
      cell: ({
        row: {
          original: { id, name },
        },
      }) => (
        <div>
          <EuiToolTip
            content="Copy API Key Name"
            anchorClassName={styles.copyBtnAnchor}
          >
            <IconButton
              icon={CopyIcon}
              aria-label="Copy API key"
              onClick={() => handleCopy(name || '')}
              style={{ marginRight: 4 }}
              data-testid={`copy-api-key-${name}`}
            />
          </EuiToolTip>
          <PopoverDelete
            header={
              <>
                {formatLongName(name)} <br /> will be removed from Redis
                Insight.
              </>
            }
            text={
              <>
                {'To delete this API key from Redis Cloud, '}
                <Link
                  target="_blank"
                  color="text"
                  tabIndex={-1}
                  href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </Link>
                {' and delete it manually.'}
              </>
            }
            item={id}
            suffix=""
            deleting={deleting}
            closePopover={() => setDeleting('')}
            updateLoading={loading}
            showPopover={showPopover}
            testid={`remove-key-button-${name}`}
            handleDeleteItem={() => handleDeleteApiKey(id, name)}
            handleButtonClick={handleClickDeleteApiKey}
          />
        </div>
      ),
    },
  ]

  if (isNull(items)) return null

  if (!items?.length) {
    return (
      <>
        <div className={styles.noKeysMessage} data-testid="no-api-keys-message">
          <Title size="XS">
            <EuiIcon className={styles.starsIcon} type={CloudStars} />
            The ultimate Redis starting point
          </Title>
          <Spacer size="s" />
          <Text size="s" className={styles.smallText} color="subdued">
            Cloud API keys will be created and stored when you connect to Redis
            Cloud to create a free trial Cloud database or autodiscover your
            Cloud database.
          </Text>
          <Spacer />
          <div className={styles.actions}>
            <OAuthSsoHandlerDialog>
              {(socialCloudHandlerClick) => (
                <EmptyButton
                  size="small"
                  color="ghost"
                  className={styles.autodiscoverBtn}
                  onClick={(e: React.MouseEvent) =>
                    socialCloudHandlerClick(e, {
                      source: OAuthSocialSource.SettingsPage,
                      action: OAuthSocialAction.Import,
                    })
                  }
                  data-testid="autodiscover-btn"
                >
                  Autodiscover
                </EmptyButton>
              )}
            </OAuthSsoHandlerDialog>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <PrimaryButton
                  size="small"
                  onClick={(e: React.MouseEvent) =>
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.SettingsPage,
                      action: OAuthSocialAction.Create,
                    })
                  }
                  data-testid="create-cloud-db-btn"
                >
                  Create Redis Cloud database
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
          </div>
        </div>
        <Spacer />
      </>
    )
  }

  return (
    <Table
      columns={columns}
      data={items}
      defaultSorting={[
        {
          id: 'createdAt',
          desc: true,
        },
      ]}
      data-testid="api-keys-table"
    />
  )
}

export default UserApiKeysTable
