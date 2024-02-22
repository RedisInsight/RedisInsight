import React, { ChangeEvent, useState } from 'react'
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiTextColor,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { GetKeysWithDetailsResponse } from 'src/modules/browser/keys/dto'
import {
  changeSearchMode,
  fetchKeys,
  keysSelector,
  resetKeyInfo,
  resetKeysData,
  setFilter,
  setSearchMatch
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  appContextDbConfig,
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserTreeDelimiter
} from 'uiSrc/slices/app/context'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeyTypes, Pages } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const InvokeStreamTrigger = ({ onCancel }: Props) => {
  const { treeViewDelimiter: delimiter = '' } = useSelector(appContextDbConfig)
  const { viewType } = useSelector(keysSelector)

  const [keyName, setKeyName] = useState<string>('')

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  const handleSubmit = () => {
    dispatch(changeSearchMode(SearchMode.Pattern))
    dispatch(setBrowserTreeDelimiter(delimiter))
    dispatch(setFilter(KeyTypes.Stream))
    dispatch(setSearchMatch(keyName, SearchMode.Pattern))
    dispatch(resetKeysData(SearchMode.Pattern))
    dispatch(resetBrowserTree())
    dispatch(resetKeyInfo())
    dispatch(setBrowserSelectedKey(null))

    dispatch(fetchKeys(
      {
        searchMode: SearchMode.Pattern,
        cursor: '0',
        count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      },
      (data) => {
        const keys = data as GetKeysWithDetailsResponse[]
        dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true))

        if (keys[0].keys.length === 1) {
          dispatch(setBrowserSelectedKey(keys[0].keys[0].name as RedisResponseBuffer))
        }
      },
      () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, false)),
    ))

    history.push(Pages.browser(instanceId))

    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FIND_KEY_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  const label = (
    <>
      <span>Key Name</span>
      <EuiToolTip
        content="Find your stream key and add new entries to it to invoke the function."
        position="top"
        display="inlineBlock"
        anchorClassName={styles.tooltipAnchor}
      >
        <EuiIcon type="iInCircle" />
      </EuiToolTip>
    </>
  )

  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth')}
      >
        <EuiFormRow label={label} fullWidth>
          <EuiFieldText
            fullWidth
            name="keyName"
            id="keyName"
            placeholder="Enter a Key Name or Pattern"
            value={keyName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyName(e.target.value)}
            data-testid="keyName-field"
            autoComplete="off"
          />
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
              type="submit"
              size="s"
              iconType="search"
              color="secondary"
              className="btn-add"
              data-testid="find-key-btn"
            >
              Find in Browser
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiForm>
  )
}

export default InvokeStreamTrigger
