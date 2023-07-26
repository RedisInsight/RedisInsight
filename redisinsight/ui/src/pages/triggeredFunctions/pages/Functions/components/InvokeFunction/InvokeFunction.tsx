import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiTextColor } from '@elastic/eui'
import { SendClusterCommandDto } from 'src/modules/cli/dto/cli.dto'
import { useParams } from 'react-router-dom'
import {
  concatToOutput,
  outputSelector,
  sendCliClusterCommandAction,
  sendCliCommandAction
} from 'uiSrc/slices/cli/cli-output'
import { cliSettingsSelector, openCli } from 'uiSrc/slices/cli/cli-settings'

import { generateRedisCommand } from 'uiSrc/utils/commands'
import { CodeBlock } from 'uiSrc/components'
import { cliCommandOutput, updateCliHistoryStorage } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { ClusterNodeRole } from 'uiSrc/slices/interfaces/cli'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import InvokeFunctionForm from './InvokeFunctionForm'

import styles from './styles.module.scss'

export interface Props {
  libName: string
  name: string
  isAsync?: boolean
  onCancel: () => void
}

const InvokeFunction = (props: Props) => {
  const { libName, name, isAsync, onCancel } = props

  const { cliClientUuid } = useSelector(cliSettingsSelector)
  const { db: currentDbIndex } = useSelector(outputSelector)
  const { host, port, connectionType } = useSelector(connectedInstanceSelector)

  const [keyNames, setKeyNames] = useState<Array<string>>([])
  const [args, setArgs] = useState<Array<string>>([])
  const [redisCommand, setRedisCommand] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isSubmitted) {
      dispatch(openCli())
    }

    // wait for cli connected
    if (cliClientUuid && isSubmitted) {
      sendCommand()
    }
  }, [cliClientUuid, isSubmitted, redisCommand])

  useEffect(() => {
    setRedisCommand(
      generateRedisCommand(
        isAsync ? 'TFCALLASYNC' : 'TFCALL',
        `${libName}.${name}`,
        [keyNames.length, keyNames],
        args
      )
    )
  }, [keyNames, args, libName, name])

  const handleSubmit = () => {
    setIsSubmitted(true)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_REQUESTED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const sendCommand = () => {
    dispatch(concatToOutput(cliCommandOutput(redisCommand, currentDbIndex)))
    updateCliHistoryStorage(redisCommand, dispatch)
    setIsSubmitted(false)

    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendCliCommandAction(redisCommand))
      return
    }

    const options: SendClusterCommandDto = {
      command: redisCommand,
      nodeOptions: {
        host,
        port,
        enableRedirection: true,
      },
      role: ClusterNodeRole.All,
    }
    dispatch(sendCliClusterCommandAction(redisCommand, options))
  }

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth')}
      >
        <InvokeFunctionForm
          name={name}
          libName={libName}
          onChangeKeys={setKeyNames}
          onChangeArgs={setArgs}
        />
        <EuiFormRow label="Preview" fullWidth>
          <CodeBlock className={styles.preview} isCopyable data-testid="redis-command-preview">
            {redisCommand}
          </CodeBlock>
        </EuiFormRow>
      </EuiPanel>
      <EuiPanel
        color="transparent"
        className="flexItemNoFullWidth"
        hasShadow={false}
        borderRadius="none"
        style={{ border: 'none' }}
      >
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              onClick={() => onCancel()}
              className="btn-cancel btn-back"
              data-testid="cancel-invoke-btn"
            >
              <EuiTextColor>Cancel</EuiTextColor>
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              isLoading={isSubmitted}
              iconType="console"
              color="secondary"
              className="btn-add"
              onClick={handleSubmit}
              data-testid="invoke-function-btn"
            >
              Run in CLI
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export default InvokeFunction
