import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { cloudSelector, resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { clusterSelector, resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { Instance, InstanceType } from 'uiSrc/slices/interfaces'
import { sentinelSelector, resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { appRedirectionSelector, setUrlHandlingInitialState } from 'uiSrc/slices/app/url-handling'
import { AddDbType } from 'uiSrc/pages/home/constants'
import ClusterConnectionFormWrapper from 'uiSrc/pages/home/components/cluster-connection'
import CloudConnectionFormWrapper from 'uiSrc/pages/home/components/cloud-connection'
import SentinelConnectionWrapper from 'uiSrc/pages/home/components/sentinel-connection'
import ManualConnectionWrapper from 'uiSrc/pages/home/components/manual-connection'
import InstanceConnections from 'uiSrc/pages/home/components/database-panel/instance-connections'

import styles from './styles.module.scss'

export interface Props {
  width: number
  isResizablePanel?: boolean
  editMode: boolean
  urlHandlingAction?: Nullable<UrlHandlingActions>
  initialValues?: Nullable<Record<string, any>>
  editedInstance: Nullable<Instance>
  onClose?: () => void
  onDbEdited?: () => void
  onAliasEdited?: (value: string) => void
  isFullWidth?: boolean
  initConnectionType?: AddDbType
}

const DatabasePanel = React.memo((props: Props) => {
  const {
    editMode,
    isResizablePanel,
    onClose,
    isFullWidth: isFullWidthProp = false,
    initConnectionType = AddDbType.manual
  } = props

  const [typeSelected, setTypeSelected] = useState<InstanceType>(
    InstanceType.RedisCloudPro
  )
  const [connectionType, setConnectionType] = useState<AddDbType>(initConnectionType)
  const [isFullWidth, setIsFullWidth] = useState(isFullWidthProp)

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { data: sentinelMasters } = useSelector(sentinelSelector)
  const { action, dbConnection } = useSelector(appRedirectionSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (editMode) return
    if (clusterCredentials) {
      setConnectionType(AddDbType.auto)
      setTypeSelected(InstanceType.RedisEnterpriseCluster)
    }

    if (cloudCredentials) {
      setConnectionType(AddDbType.auto)
      setTypeSelected(InstanceType.RedisCloudPro)
    }

    if (sentinelMasters.length) {
      setConnectionType(AddDbType.auto)
      setTypeSelected(InstanceType.Sentinel)
    }
  }, [])

  useEffect(() => {
    if (action === UrlHandlingActions.Connect) {
      setConnectionType(AddDbType.manual)
    }
  }, [action, dbConnection])

  useEffect(() => {
    if (editMode) {
      setConnectionType(AddDbType.manual)
    }
  }, [editMode])

  useEffect(() =>
    // ComponentWillUnmount
    () => {
      if (connectionType === AddDbType.manual) return

      switch (typeSelected) {
        case InstanceType.Sentinel: {
          dispatch(resetDataRedisCloud())
          dispatch(resetDataRedisCluster())
          break
        }
        case InstanceType.RedisCloudPro: {
          dispatch(resetDataRedisCluster())
          dispatch(resetDataSentinel())
          break
        }
        case InstanceType.RedisEnterpriseCluster: {
          dispatch(resetDataRedisCloud())
          dispatch(resetDataSentinel())
          break
        }
        default:
          break
      }
    },
  [typeSelected])

  useEffect(() => {
    setIsFullWidth(isFullWidthProp)
  }, [isFullWidthProp])

  const typesFormStage: EuiRadioGroupOption[] = [
    {
      id: InstanceType.RedisCloudPro,
      label: InstanceType.RedisCloudPro,
      'data-test-subj': 'radio-btn-cloud-pro',
    },
    {
      id: InstanceType.RedisEnterpriseCluster,
      label: InstanceType.RedisEnterpriseCluster,
      'data-test-subj': 'radio-btn-enterprise-cluster',
    },
    {
      id: InstanceType.Sentinel,
      label: InstanceType.Sentinel,
      'data-test-subj': 'radio-btn-sentinel',
    },
  ]

  const radioBtnLegend = isResizablePanel ? '' : <span>Connect to:</span>

  const onChange = (optionId: InstanceType) => {
    setTypeSelected(optionId)
  }

  const changeConnectionType = (connectionType: AddDbType) => {
    dispatch(setUrlHandlingInitialState())
    setConnectionType(connectionType)
  }

  const InstanceTypes = () => (
    <EuiForm className="formDataTypes">
      <EuiFlexGroup wrap={!isFullWidth} gutterSize="s">
        <EuiFlexItem
          grow={!isFullWidth}
          className={cx(styles.radioBtnText, {
            [styles.radioBtnTextFullWidth]: isFullWidth,
          })}
        >
          <EuiText>Connect to:</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiRadioGroup
            options={typesFormStage}
            idSelected={typeSelected}
            className="dbTypes"
            onChange={(id) => onChange(id as InstanceType)}
            name="radio group"
            legend={{
              children: radioBtnLegend,
            }}
            data-testid="db-types"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  )

  const Form = () => (
    <>
      {connectionType === AddDbType.manual && (
        <ManualConnectionWrapper {...props} />
      )}
      {connectionType === AddDbType.auto && (
        <>
          {typeSelected === InstanceType.Sentinel && (
            <SentinelConnectionWrapper {...props} />
          )}
          {typeSelected === InstanceType.RedisEnterpriseCluster && (
            <ClusterConnectionFormWrapper {...props} />
          )}
          {typeSelected === InstanceType.RedisCloudPro && (
            <CloudConnectionFormWrapper {...props} />
          )}
        </>
      )}
    </>
  )

  return (
    <div className="databasePanelWrapper">
      <div className={cx('container relative', { addDbWrapper: !editMode })}>
        {!isFullWidth && onClose && (
          <EuiToolTip
            content="Close"
            position="left"
            anchorClassName={styles.closeKeyTooltip}
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              aria-label="Close"
              onClick={onClose}
            />
          </EuiToolTip>
        )}
        {!editMode && (
          <>
            <EuiTitle size="xs">
              <h4>Discover and Add Redis Databases</h4>
            </EuiTitle>
            <InstanceConnections
              {...{ isFullWidth, connectionType, changeConnectionType }}
            />
            {connectionType === AddDbType.auto && <InstanceTypes />}
          </>
        )}
        {Form()}
      </div>
      <div id="footerDatabaseForm" />
    </div>
  )
})

export default DatabasePanel
