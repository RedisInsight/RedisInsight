import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiLoadingSpinner,
  EuiTextColor,
  EuiText,
  EuiIcon,
  EuiButton,
  EuiToolTip,
} from '@elastic/eui'
import { pick } from 'lodash'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  LoadedSentinel,
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import {
  sentinelSelector,
  resetLoadedSentinel,
  updateMastersSentinel,
  createMastersSentinelAction,
  resetDataSentinel,
} from 'uiSrc/slices/instances/sentinel'
import { removeEmpty, setTitle } from 'uiSrc/utils'
import { ApiStatusCode, Pages } from 'uiSrc/constants'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import { InputFieldSentinel } from 'uiSrc/components'
import validationErrors from 'uiSrc/constants/validationErrors'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import SentinelDatabasesResult from './components'

import styles from '../styles.module.scss'

const SentinelDatabasesResultPage = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])
  const [isInvalid, setIsInvalid] = useState(true)

  const { data: masters } = useSelector(sentinelSelector)

  const countSuccessAdded = masters.filter(
    ({ status }) => status === AddRedisDatabaseStatus.Success
  )?.length

  const dispatch = useDispatch()
  const history = useHistory()

  setTitle('Redis Sentinel Primary Groups Added')

  useEffect(() => {
    if (!masters.length) {
      history.push(Pages.home)
    }

    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
  }, [])

  useEffect(() => {
    if (masters.length) {
      setIsInvalid(true)
      setItems(masters)
    }
  }, [masters])

  const handleBackAdditing = () => {
    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
    history.push(Pages.home)
  }

  const handleViewDatabases = () => {
    dispatch(resetDataSentinel())
    history.push(Pages.home)
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const handleAddInstance = (masterName: string) => {
    const instance: ModifiedSentinelMaster = {
      ...removeEmpty(items.find((item) => item.name === masterName)),
      loading: true,
    }

    const updatedItems = items.map((item) =>
      (item.name === masterName ? instance : item))

    const pikedInstance = [
      pick(instance, 'alias', 'name', 'username', 'password', 'db'),
    ]

    dispatch(updateMastersSentinel(updatedItems))
    dispatch(createMastersSentinelAction(pikedInstance))
  }

  const handleChangedInput = (name: string, value: string) => {
    const [field, id] = name.split('-')

    setItems((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item
        }

        return { ...item, [field]: value }
      }))
  }

  const columns: EuiBasicTableColumn<ModifiedSentinelMaster>[] = [
    {
      field: 'message',
      className: 'column_status',
      name: 'Result',
      dataType: 'string',
      align: 'left',
      width: '110px',
      sortable: true,
      render: function Message(
        _status: string,
        { status, message, name, loading = false }
      ) {
        return (
          <div data-testid={`status_${name}_${status}`}>
            {loading && <EuiLoadingSpinner />}
            {!loading && status === AddRedisDatabaseStatus.Success && (
              <EuiText>{message}</EuiText>
            )}
            {!loading && status !== AddRedisDatabaseStatus.Success && (
              <EuiToolTip position="right" title="Error" content={message}>
                <EuiTextColor color="danger" style={{ cursor: 'pointer' }}>
                  Error&nbsp;
                  <EuiIcon type="alert" color="danger" />
                </EuiTextColor>
              </EuiToolTip>
            )}
          </div>
        )
      },
    },
    {
      field: 'name',
      className: 'column_masterName',
      name: 'Primary Group',
      truncateText: true,
      sortable: true,
      width: '175px',
      render: (name: string) => <span data-testid={`primary-group_${name}`}>{name}</span>,
    },
    {
      field: 'alias',
      className: 'column_db_alias',
      name: 'Database Alias*',
      width: '300px',
      sortable: true,
      render: function InstanceAliasCell(
        _alias: string,
        { id, alias, error, loading = false, status }
      ) {
        if (error?.statusCode !== ApiStatusCode.Unauthorized || status === AddRedisDatabaseStatus.Success) {
          return alias
        }
        return (
          <div role="presentation">
            <InputFieldSentinel
              name={`alias-${id}`}
              value={alias}
              placeholder="Database"
              disabled={loading}
              className={styles.input}
              inputType={SentinelInputFieldType.Text}
              onChangedInput={handleChangedInput}
              maxLength={500}
            />
          </div>
        )
      },
    },
    {
      field: 'host',
      className: 'column_address',
      name: 'Address',
      width: '190px',
      dataType: 'auto',
      truncateText: true,
      sortable: ({ host, port }) => `${host}:${port}`,
      render: function Address(
        _host: string,
        { host, port }: ModifiedSentinelMaster
      ) {
        const text = `${host}:${port}`
        return (
          <div className="host_port">
            <EuiText className="copyHostPortText">{text}</EuiText>
            <EuiToolTip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <EuiButtonIcon
                iconType="copy"
                aria-label="Copy public endpoint"
                className="copyPublicEndpointBtn"
                onClick={() => handleCopy(text)}
                tabIndex={-1}
              />
            </EuiToolTip>
          </div>
        )
      },
    },
    {
      field: 'numberOfSlaves',
      className: 'column_numberOfSlaves',
      name: '# of replicas',
      dataType: 'number',
      align: 'center',
      sortable: true,
      width: '135px',
      truncateText: true,
      hideForMobile: true,
    },
    {
      field: 'username',
      className: 'column_username',
      name: 'Username',
      width: '285px',
      render: function UsernameCell(
        _username: string,
        { username, id, loading = false, error, status }
      ) {
        if (error?.statusCode !== ApiStatusCode.Unauthorized || status === AddRedisDatabaseStatus.Success) {
          return username || <i>Default</i>
        }
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              isText
              isInvalid={isInvalid}
              value={username}
              name={`username-${id}`}
              className={styles.input}
              placeholder="Enter Username"
              disabled={loading}
              inputType={SentinelInputFieldType.Text}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
    {
      field: 'password',
      className: 'column_password',
      name: 'Password',
      width: '285px',
      render: function PasswordCell(
        _password: string,
        { password, id, error, loading = false, status }
      ) {
        if (error?.statusCode !== ApiStatusCode.Unauthorized || status === AddRedisDatabaseStatus.Success) {
          return password ? '************' : <i>not assigned</i>
        }
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              isInvalid={isInvalid}
              value={password}
              name={`password-${id}`}
              className={styles.input}
              placeholder="Enter Password"
              disabled={loading}
              inputType={SentinelInputFieldType.Password}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
    {
      field: 'db',
      className: 'column_db',
      width: '170px',
      align: 'center',
      name: 'Database Index',
      render: function DbCell(
        _password: string,
        { db, id, loading = false, status, error }
      ) {
        if (status === AddRedisDatabaseStatus.Success) {
          return db || <i>not assigned</i>
        }
        const isDBInvalid = error?.statusCode === ApiStatusCode.BadRequest
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              min={0}
              disabled={loading}
              className={styles.dbInfo}
              value={`${db}` || '0'}
              name={`db-${id}`}
              isInvalid={isDBInvalid}
              placeholder="Enter Index"
              inputType={SentinelInputFieldType.Number}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
  ]

  // add column with actions if someone error has come
  if (countSuccessAdded !== items.length) {
    const columnActions: EuiBasicTableColumn<ModifiedSentinelMaster> = {
      field: 'actions',
      className: 'column_actions',
      align: 'left',
      name: '',
      width: '200px',
      render: function ButtonCell(
        _password: string,
        { name, error, alias, loading = false }
      ) {
        const isDisabled = !alias
        if (error?.statusCode !== ApiStatusCode.Unauthorized
          && !ApiEncryptionErrors.includes(error?.name)
          && error?.statusCode !== ApiStatusCode.BadRequest) {
          return ''
        }
        return (
          <div role="presentation">
            <EuiToolTip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={isDisabled ? validationErrors.REQUIRED_TITLE(1) : null}
              content={
                isDisabled ? (
                  <span className="euiToolTip__content">Database Alias</span>
                ) : null
              }
            >
              <EuiButton
                fill
                size="s"
                color="secondary"
                isDisabled={isDisabled}
                isLoading={loading}
                onClick={() => handleAddInstance(name)}
                iconType={isDisabled ? 'iInCircle' : undefined}
              >
                Add Primary Group
              </EuiButton>
            </EuiToolTip>
          </div>
        )
      },
    }

    columns.splice(1, 0, columnActions)
  }

  return (
    <SentinelDatabasesResult
      columns={columns}
      masters={items}
      countSuccessAdded={countSuccessAdded}
      onBack={handleBackAdditing}
      onViewDatabases={handleViewDatabases}
    />
  )
}

export default SentinelDatabasesResultPage
