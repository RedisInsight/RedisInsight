import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { Instance, InstanceType } from 'uiSrc/slices/interfaces'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { clusterSelector, resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { cloudSelector, resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataSentinel, sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { appRedirectionSelector, setUrlHandlingInitialState } from 'uiSrc/slices/app/url-handling'

import ManualConnectionWrapper from 'uiSrc/pages/home/components/manual-connection'
import SentinelConnectionWrapper from 'uiSrc/pages/home/components/sentinel-connection'
import ClusterConnectionFormWrapper from 'uiSrc/pages/home/components/cluster-connection'
import AddDatabaseFlowTabs from 'uiSrc/pages/home/components/add-database-flow-tabs'

import CloudConnectionFormWrapper from 'uiSrc/pages/home/components/cloud-connection'
import ImportDatabase from 'uiSrc/pages/home/components/import-database'
import { FormDialog } from 'uiSrc/components'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import styles from './styles.module.scss'

export interface Props {
  isOpen: boolean
  editMode: boolean
  urlHandlingAction?: Nullable<UrlHandlingActions>
  initialValues?: Nullable<Record<string, any>>
  editedInstance: Nullable<Instance>
  onClose: () => void
  onDbEdited?: () => void
  initConnectionType?: AddDbType
}

const DatabasePanelDialog = (props: Props) => {
  const {
    isOpen,
    editMode,
    onClose,
    initConnectionType = AddDbType.cloud
  } = props

  const [typeSelected, setTypeSelected] = useState<InstanceType>(
    InstanceType.RedisEnterpriseCluster
  )
  const [connectionType, setConnectionType] = useState<AddDbType>(initConnectionType)
  const [modalHeader, setModalHeader] = useState<Nullable<React.ReactNode>>(null)

  const { credentials: clusterCredentials } = useSelector(clusterSelector)
  const { credentials: cloudCredentials } = useSelector(cloudSelector)
  const { data: sentinelMasters } = useSelector(sentinelSelector)
  const { action, dbConnection } = useSelector(appRedirectionSelector)

  const typeSelectedRef = useRef(typeSelected)
  const connectionTypeRef = useRef(connectionType)

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

      if (connectionType === AddDbType.cloud) {
        dispatch(resetDataRedisCluster())
        dispatch(resetDataSentinel())
        return
      }

      switch (typeSelected) {
        case InstanceType.Sentinel: {
          dispatch(resetDataRedisCloud())
          dispatch(resetDataRedisCluster())
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

  const typesFormStage: EuiRadioGroupOption[] = [
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

  const onChange = (optionId: InstanceType) => {
    setTypeSelected(optionId)
  }

  const changeConnectionType = (connectionType: AddDbType) => {
    dispatch(setUrlHandlingInitialState())
    setConnectionType(connectionType)
  }

  const InstanceTypes = () => (
    <EuiForm className="formDataTypes">
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem
          grow={false}
          className={cx(styles.radioBtnText)}
        >
          <EuiFlexItem><EuiText color="subdued" size="s">Connect with:</EuiText></EuiFlexItem>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiRadioGroup
            options={typesFormStage}
            idSelected={typeSelected}
            className={styles.softwareTypes}
            onChange={(id) => onChange(id as InstanceType)}
            name="radio group"
            data-testid="db-types"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
    </EuiForm>
  )

  const Form = () => (
    <>
      {connectionType === AddDbType.manual && (
        <ManualConnectionWrapper {...props} />
      )}
      {connectionType === AddDbType.cloud && (
        <CloudConnectionFormWrapper {...props} />
      )}
      {connectionType === AddDbType.import && (
        <ImportDatabase onClose={onClose} />
      )}
      {connectionType === AddDbType.auto && (
        <>
          {typeSelected === InstanceType.Sentinel && (<SentinelConnectionWrapper {...props} />)}
          {typeSelected === InstanceType.RedisEnterpriseCluster && (<ClusterConnectionFormWrapper {...props} />)}
        </>
      )}
    </>
  )

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      header={modalHeader ?? (<EuiTitle size="s"><h4>Discover and Add Redis Databases</h4></EuiTitle>)}
      footer={<div id="footerDatabaseForm" />}
    >
      <div className={cx(styles.bodyWrapper, 'container relative', { addDbWrapper: !editMode })}>
        {!editMode && (
          <AddDatabaseFlowTabs
            connectionType={connectionType}
            onChange={changeConnectionType}
          />
        )}
        <div className={styles.formWrapper}>
          <ModalHeaderProvider value={{ modalHeader, setModalHeader }}>
            {connectionType === AddDbType.auto && <InstanceTypes />}
            {Form()}
          </ModalHeaderProvider>
        </div>
      </div>
    </FormDialog>
  )
}

export default DatabasePanelDialog
