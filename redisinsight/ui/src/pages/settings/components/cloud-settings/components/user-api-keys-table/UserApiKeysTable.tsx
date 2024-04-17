import React, { useCallback, useState } from 'react'
import {
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
  PropertySort
} from '@elastic/eui'
import { format } from 'date-fns'
import cx from 'classnames'
import { useDispatch } from 'react-redux'
import { isNull } from 'lodash'
import { formatLongName, Maybe, Nullable } from 'uiSrc/utils'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { CloudCapiKey, OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'

import { ReactComponent as CloudStars } from 'uiSrc/assets/img/oauth/stars.svg'

import styles from './styles.module.scss'

export interface Props {
  items: Nullable<CloudCapiKey[]>
  loading: boolean
}

const UserApiKeysTable = ({ items, loading }: Props) => {
  const [sort, setSort] = useState<Maybe<PropertySort>>({ field: 'createdAt', direction: 'desc' })
  const [deleting, setDeleting] = useState('')

  const dispatch = useDispatch()

  const handleCopy = (value: string) => {
    navigator?.clipboard?.writeText(value)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_NAME_COPIED
    })
  }

  const showPopover = useCallback((id = '') => {
    setDeleting(id)
  }, [])

  const handleSorting = ({ sort }: any) => {
    setSort(sort)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_SORTED,
      eventData: {
        ...sort,
        numberOfKeys: items?.length || 0
      }
    })
  }

  const handleClickDeleteApiKey = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED,
      eventData: {
        source: OAuthSocialSource.SettingsPage
      }
    })
  }

  const handleDeleteApiKey = (id: string, name: string) => {
    setDeleting('')

    dispatch(removeCapiKeyAction({ id, name }, () => {
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
        eventData: {
          source: OAuthSocialSource.SettingsPage
        }
      })
    }))
  }

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: 'API Key Name',
      field: 'name',
      sortable: true,
      truncateText: true,
      width: '100%',
      render: (value: string, { valid }) => {
        const tooltipContent = formatLongName(value)

        return (
          <div className={styles.nameField}>
            {!valid && (
              <EuiToolTip
                content="This API key is invalid. Remove it from   and Redis Cloud and create a new one instead."
                anchorClassName={styles.invalidIconAnchor}
              >
                <EuiIcon className={styles.invalidIcon} type="alert" color="danger" />
              </EuiToolTip>
            )}
            <EuiToolTip
              title="API Key Name"
              content={tooltipContent}
            >
              <>{value}</>
            </EuiToolTip>
          </div>
        )
      }
    },
    {
      name: 'Created',
      field: 'createdAt',
      sortable: true,
      truncateText: true,
      width: '120x',
      render: (value: number) => (
        <EuiToolTip
          content={format(new Date(value), 'HH:mm:ss d LLL yyyy')}
        >
          <>{format(new Date(value), 'd MMM yyyy')}</>
        </EuiToolTip>
      )
    },
    {
      name: 'Last used',
      field: 'lastUsed',
      sortable: true,
      width: '120x',
      render: (value: number) => (
        <>
          {value && (
            <EuiToolTip
              content={format(new Date(value), 'HH:mm:ss d LLL yyyy')}
            >
              <>{format(new Date(value), 'd MMM yyyy')}</>
            </EuiToolTip>
          )}
          {!value && 'Never'}
        </>
      )
    },
    {
      name: '',
      field: 'actions',
      align: 'right',
      width: '80px',
      render: (_value, { id, name }) => (
        <div>
          <EuiToolTip content="Copy API Key Name" anchorClassName={styles.copyBtnAnchor}>
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy API key"
              onClick={() => handleCopy(name || '')}
              style={{ marginRight: 4 }}
              data-testid={`copy-api-key-${name}`}
            />
          </EuiToolTip>
          <PopoverDelete
            header={(<>{formatLongName(name)} <br /> will be removed from Redis Insight.</>)}
            text={(
              <>
                {'To delete this API key from Redis Cloud, '}
                <EuiLink
                  target="_blank"
                  color="text"
                  external={false}
                  tabIndex={-1}
                  href="https://redis.com/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </EuiLink>
                {' and delete it manually.'}
              </>
            )}
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
      )
    },
  ]

  if (isNull(items)) return null

  if (!items?.length) {
    return (
      <>
        <div className={styles.noKeysMessage} data-testid="no-api-keys-message">
          <EuiTitle size="xs">
            <>
              <EuiIcon className={styles.starsIcon} type={CloudStars} />
              <span>The ultimate Redis starting point</span>
            </>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="s" className={styles.smallText} color="subdued">
            Cloud API keys will be created and stored when you connect to Redis Cloud to create
            a free Cloud database or autodiscover your Cloud database.
          </EuiText>
          <EuiSpacer />
          <div className={styles.actions}>
            <OAuthSsoHandlerDialog>
              {(socialCloudHandlerClick) => (
                <EuiButtonEmpty
                  size="s"
                  color="text"
                  className={styles.autodiscoverBtn}
                  onClick={(e: React.MouseEvent) => socialCloudHandlerClick(e, {
                    source: OAuthSocialSource.SettingsPage,
                    action: OAuthSocialAction.Import
                  })}
                  data-testid="autodiscover-btn"
                >
                  Autodiscover
                </EuiButtonEmpty>
              )}
            </OAuthSsoHandlerDialog>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <EuiButton
                  fill
                  size="s"
                  color="secondary"
                  onClick={(e: React.MouseEvent) => ssoCloudHandlerClick(e, {
                    source: OAuthSocialSource.SettingsPage,
                    action: OAuthSocialAction.Create
                  })}
                  data-testid="create-cloud-db-btn"
                >
                  Create Redis Cloud database
                </EuiButton>
              )}
            </OAuthSsoHandlerDialog>
          </div>
        </div>
        <EuiSpacer />
      </>
    )
  }

  return (
    <EuiInMemoryTable
      loading={loading}
      items={items ?? []}
      columns={columns}
      sorting={sort ? ({ sort }) : true}
      responsive={false}
      message="No Api Keys"
      onTableChange={handleSorting}
      className={cx(
        'inMemoryTableDefault',
        'stickyHeader',
        'noBorders',
        styles.table
      )}
      rowProps={(row) => ({
        'data-testid': `row-${row.name}`,
      })}
      data-testid="api-keys-table"
    />
  )
}

export default UserApiKeysTable
