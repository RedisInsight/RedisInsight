import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTab, EuiTabs, EuiTitle, keys } from '@elastic/eui'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import { resetInstanceUpdateAction } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import { fieldDisplayNames, SubmitBtnText, } from 'uiSrc/pages/home/constants'
import { getFormErrors } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { DbInfo, } from 'uiSrc/pages/home/components/form'
import { DbInfoSentinel, } from 'uiSrc/pages/home/components/form/sentinel'
import { caCertsSelector } from 'uiSrc/slices/instances/caCerts'
import { clientCertsSelector } from 'uiSrc/slices/instances/clientCerts'
import { appInfoSelector } from 'uiSrc/slices/app/info'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { MANUAL_FORM_TABS, ManualFormTab } from './constants'
import CloneConnection from './components/CloneConnection'
import FooterActions from './components/FooterActions'
import { AddConnection, EditConnection, EditSentinelConnection } from './forms'

import styles from './styles.module.scss'

export interface Props {
  formFields: DbConnectionInfo
  submitButtonText?: SubmitBtnText
  loading: boolean
  buildType?: BuildType
  isEditMode: boolean
  isCloneMode: boolean
  setIsCloneMode: (value: boolean) => void
  onSubmit: (values: DbConnectionInfo) => void
  onTestConnection: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port, name }: any) => {
  if (!host || !port || !name) {
    return pick(fieldDisplayNames, ['host', 'port', 'name'])
  }
  return {}
}

const ManualConnectionForm = (props: Props) => {
  const {
    formFields,
    onClose,
    onSubmit,
    onTestConnection,
    onHostNamePaste,
    submitButtonText,
    buildType,
    loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
  } = props

  const {
    id,
    host,
    name,
    port,
    db = null,
    nameFromProvider,
    sentinelMaster,
    connectionType,
    nodes = null,
    modules,
  } = formFields

  const { action } = useSelector(appRedirectionSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)
  const { server } = useSelector(appInfoSelector)

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name })
  )
  const [activeTab, setActiveTab] = useState<ManualFormTab>(ManualFormTab.General)

  const { setModalHeader } = useModalHeader()

  const dispatch = useDispatch()

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)
  const isFromCloud = action === UrlHandlingActions.Connect

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)

    if (isCloneMode && connectionType === ConnectionType.Sentinel && !values.sentinelMasterName) {
      errs.sentinelMasterName = fieldDisplayNames.sentinelMasterName
    }

    if (!values.name) {
      errs.name = fieldDisplayNames.name
    }

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: formFields,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values: any) => {
      onSubmit(values)
    },
  })

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  useEffect(() =>
  // componentWillUnmount
    () => {
      setModalHeader(null)
      if (isEditMode) {
        dispatch(resetInstanceUpdateAction())
      }
    },
  [])

  useEffect(() => {
    if (isCloneMode) {
      setModalHeader(
        <EuiFlexGroup responsive={false} alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              onClick={handleClickBackClone}
              iconSize="m"
              iconType="sortLeft"
              aria-label="back"
              data-testid="back-btn"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="s"><h4>Clone Database</h4></EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
      return
    }

    if (isEditMode) {
      setModalHeader(<EuiTitle size="s"><h4>Edit Database</h4></EuiTitle>)
      return
    }

    setModalHeader(
      <EuiTitle size="s"><h4>Connection Settings</h4></EuiTitle>,
      true
    )
  }, [isEditMode, isCloneMode])

  useEffect(() => {
    formik.resetForm()
  }, [isCloneMode])

  const handleTestConnectionDatabase = () => {
    onTestConnection(formik.values)
  }

  const handleClickBackClone = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id
      }
    })
  }

  const handleTabClick = (tab: ManualFormTab) => {
    setActiveTab(tab)
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      <FooterActions
        submitIsDisable={submitIsDisable}
        errors={errors}
        isLoading={loading}
        onClickTestConnection={handleTestConnectionDatabase}
        onClose={onClose}
        onClickSubmit={formik.submitForm}
        submitButtonText={submitButtonText}
      />,
      footerEl
    )
  }

  const Tabs = () => (
    <EuiTabs className={cx('tabs-active-borders', styles.tabs)}>
      {MANUAL_FORM_TABS.map(({ id, title }) => (
        <EuiTab
          key={id}
          isSelected={activeTab === id}
          onClick={() => handleTabClick(id)}
          data-testid={`manual-form-tab-${id}`}
        >
          {title}
        </EuiTab>
      ))}
    </EuiTabs>
  )

  return (
    <div className={styles.container} data-testid="add-db_manual" style={{ height: '100%' }}>
      {isEditMode && !isCloneMode && server?.buildType !== BuildType.RedisStack && (
        <CloneConnection id={id} setIsCloneMode={setIsCloneMode} />
      )}
      <div className={cx('getStartedForm', styles.content)} ref={formRef}>
        {!isEditMode && !isFromCloud && (
          <>
            <Tabs />
            <EuiSpacer />
            <div className="eui-yScroll">
              <AddConnection
                activeTab={activeTab}
                formik={formik}
                onKeyDown={onKeyDown}
                onHostNamePaste={onHostNamePaste}
                certificates={certificates}
                caCertificates={caCertificates}
                buildType={buildType}
              />
            </div>
          </>
        )}
        {(isEditMode || isCloneMode || isFromCloud) && connectionType !== ConnectionType.Sentinel && (
          <>
            {!isCloneMode && (
              <>
                <DbInfo
                  host={host}
                  port={port}
                  connectionType={connectionType}
                  db={db}
                  modules={modules}
                  nameFromProvider={nameFromProvider}
                  nodes={nodes}
                  isFromCloud={isFromCloud}
                />
                <EuiSpacer />
              </>
            )}
            <Tabs />
            <EuiSpacer />
            <div className="eui-yScroll">
              <EditConnection
                activeTab={activeTab}
                isCloneMode={isCloneMode}
                isEditMode={isEditMode}
                isFromCloud={isFromCloud}
                formik={formik}
                onKeyDown={onKeyDown}
                onHostNamePaste={onHostNamePaste}
                certificates={certificates}
                caCertificates={caCertificates}
                buildType={buildType}
              />
            </div>
          </>
        )}
        {(isEditMode || isCloneMode) && connectionType === ConnectionType.Sentinel && (
          <>
            {!isCloneMode && (
              <>
                <DbInfoSentinel
                  nameFromProvider={nameFromProvider}
                  connectionType={connectionType}
                  sentinelMaster={sentinelMaster}
                  host={host}
                  port={port}
                />
                <EuiSpacer />
              </>
            )}
            <Tabs />
            <EuiSpacer />
            <div className="eui-yScroll">
              <EditSentinelConnection
                activeTab={activeTab}
                isCloneMode={isCloneMode}
                formik={formik}
                onKeyDown={onKeyDown}
                onHostNamePaste={onHostNamePaste}
                certificates={certificates}
                caCertificates={caCertificates}
                db={db}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ManualConnectionForm
