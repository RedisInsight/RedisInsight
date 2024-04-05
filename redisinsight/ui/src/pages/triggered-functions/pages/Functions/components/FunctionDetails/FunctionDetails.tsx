import React, { useEffect, useState } from 'react'
import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiCollapsibleNavGroup,
  EuiLink,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { isNil } from 'lodash'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FunctionType, TriggeredFunctionsFunction } from 'uiSrc/slices/interfaces/triggeredFunctions'

import { Pages } from 'uiSrc/constants'
import { setSelectedLibraryToShow } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import InvokeFunction from 'uiSrc/pages/triggered-functions/pages/Functions/components/InvokeFunction'
import InvokeStreamTrigger from 'uiSrc/pages/triggered-functions/pages/Functions/components/InvokeStreamTrigger'
import styles from './styles.module.scss'

export interface Props {
  item: TriggeredFunctionsFunction
  onClose: () => void
}

const FunctionDetails = (props: Props) => {
  const { item, onClose } = props
  const { name, library, type, description, flags, lastError, totalExecutionTime, lastExecutionTime } = item

  const [isInvokeOpen, setIsInvokeOpen] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_VIEWED,
      eventData: {
        databaseId: instanceId,
        functionType: item.type,
        isAsync: item?.isAsync
      }
    })
  }, [item])

  const handleClickInvoke = () => {
    setIsInvokeOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_CLICKED,
      eventData: {
        databaseId: instanceId,
        isAsync: item?.isAsync,
        functionType: item.type,
      }
    })
  }

  const handleCancelInvoke = () => {
    setIsInvokeOpen(false)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_CANCELLED,
      eventData: {
        databaseId: instanceId,
        functionType: item.type,
      }
    })
  }

  const goToLibrary = (e: React.MouseEvent, libName: string) => {
    e.preventDefault()
    dispatch(setSelectedLibraryToShow(libName))
    history.push(Pages.triggeredFunctionsLibraries(instanceId))
  }

  const generateFieldValue = (field: any, title: string, value: any) => !isNil(field) && (
    <div className={styles.field}>
      <EuiText color="subdued" className={styles.fieldName}>{title}:</EuiText>
      <EuiText data-testid={`value-${title.replace(/ /g, '_')}`}>{value}</EuiText>
    </div>
  )

  const isShowInvokeButton = type === FunctionType.Function || type === FunctionType.StreamTrigger

  return (
    <div className={styles.main} data-testid={`function-details-${name}`}>
      <div className={styles.header}>
        <EuiToolTip
          title="Library Name"
          content={name}
          anchorClassName={cx('truncateText', styles.titleTooltip)}
        >
          <EuiTitle size="xs" className={styles.libName} data-testid="function-name"><span>{name}</span></EuiTitle>
        </EuiToolTip>
        {isShowInvokeButton && (
          <EuiButton
            fill
            color="secondary"
            iconType="play"
            size="s"
            onClick={handleClickInvoke}
            data-testid="invoke-btn"
          >
            Invoke
          </EuiButton>
        )}
        <EuiToolTip
          content="Close"
          position="left"
          anchorClassName="triggeredFunctions__closeRightPanel"
        >
          <EuiButtonIcon
            iconType="cross"
            color="primary"
            aria-label="Close panel"
            className={styles.closeBtn}
            onClick={() => onClose()}
            data-testid="close-right-panel-btn"
          />
        </EuiToolTip>
      </div>
      <div className={styles.content}>
        <EuiCollapsibleNavGroup
          {...getPropsForNavGroup('General')}
        >
          <div className={styles.field}>
            <EuiText color="subdued" className={styles.fieldName}>Library:</EuiText>
            <EuiText className={styles.fieldValue} data-testid="value-Library">
              <EuiLink
                href="#"
                onClick={(e: React.MouseEvent) => goToLibrary(e, library)}
                data-testid={`moveToLibrary-${library}`}
              >
                {library}
              </EuiLink>
            </EuiText>
          </div>
          {generateFieldValue(item.isAsync, 'isAsync', item.isAsync ? 'Yes' : 'No')}
          {generateFieldValue(item.prefix, 'Prefix', item.prefix)}
          {generateFieldValue(item.trim, 'Trim', item.trim ? 'Yes' : 'No')}
          {generateFieldValue(item.window, 'Window', item.window)}
          {generateFieldValue(item.total, 'Total', item.total)}
          {generateFieldValue(item.success, 'Success', item.success)}
          {generateFieldValue(item.fail, 'Failed', item.fail)}
        </EuiCollapsibleNavGroup>
        {description && (
          <EuiCollapsibleNavGroup
            {...getPropsForNavGroup('Description')}
          >
            <EuiText color="subdued">{description}</EuiText>
          </EuiCollapsibleNavGroup>
        )}
        {lastError && (
          <EuiCollapsibleNavGroup
            iconType="alert"
            iconSize="s"
            iconProps={{ className: styles.accordionIcon }}
            {...getPropsForNavGroup('Last Error')}
          >
            <EuiText color="subdued">{lastError}</EuiText>
          </EuiCollapsibleNavGroup>
        )}
        {!isNil(totalExecutionTime) && (
          <EuiCollapsibleNavGroup
            iconType="clock"
            iconSize="s"
            iconProps={{ className: styles.accordionIcon }}
            {...getPropsForNavGroup('Time')}
          >
            {generateFieldValue(totalExecutionTime, 'Total Execution Time', totalExecutionTime)}
            {generateFieldValue(lastExecutionTime, 'Last Execution Time', lastExecutionTime)}
          </EuiCollapsibleNavGroup>
        )}
        {flags && (
          <EuiCollapsibleNavGroup
            iconType="flag"
            iconSize="s"
            iconProps={{ className: styles.accordionIcon }}
            {...getPropsForNavGroup('Flags')}
          >
            {flags.length === 0 && (<i>Empty</i>)}
            {flags.map((flag) => (<EuiBadge key={flag} className={styles.badge}>{flag}</EuiBadge>))}
          </EuiCollapsibleNavGroup>
        )}
      </div>
      {isInvokeOpen && (
        <>
          {type === FunctionType.Function && (
            <div className="formFooterBar">
              <InvokeFunction
                libName={library}
                name={name}
                isAsync={item.isAsync}
                onCancel={handleCancelInvoke}
              />
            </div>
          )}
          {type === FunctionType.StreamTrigger && (
            <div className="formFooterBar">
              <InvokeStreamTrigger
                onCancel={handleCancelInvoke}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

const getPropsForNavGroup = (title: string): any => ({
  key: title,
  isCollapsible: true,
  className: styles.accordion,
  title,
  initialIsOpen: true,
  paddingSize: 'none',
  titleElement: 'span',
  'data-testid': `function-details-${title}`,
})

export default React.memo(FunctionDetails)
