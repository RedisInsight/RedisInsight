import React, { useState } from 'react'
import { EuiIcon, EuiListGroup, EuiListGroupItem, EuiPopover, EuiText } from '@elastic/eui'
import { AiTool } from 'uiSrc/slices/interfaces/aiAssistant'
import { botTypeOptions } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  selectedBotType: AiTool
  setSelected: (tool: AiTool) => void
}

const BotTypePopover = ({ selectedBotType, setSelected }: Props) => {
  const [type, setType] = useState('arrowDown')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const showPopover = () => {
    setType((type) => (type === 'arrowDown' ? 'arrowUp' : 'arrowDown'))
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  }

  const onClick = (tool: AiTool) => {
    setSelected(tool)
    setType('arrowDown')
    setIsPopoverOpen(false)
  }

  const label = botTypeOptions.find((botType) => botType.value === selectedBotType)?.inputDisplay

  return (
    <EuiPopover
      ownFocus={false}
      hasArrow={false}
      panelPaddingSize="none"
      isOpen={isPopoverOpen}
      closePopover={() => showPopover()}
      button={(
        <EuiText
          className={styles.showPopoverBtn}
          onClick={() => showPopover()}
          data-testid="choose-bot-type-btn"
        >
          <b className={styles.btnText}>{label}</b>
          <span>
            <EuiIcon
              color="primaryText"
              size="s"
              type={type}
            />
          </span>
        </EuiText>
        )}
    >
      <div className={styles.listContainer}>
        <EuiListGroup flush maxWidth="none" gutterSize="none">
          {botTypeOptions?.map((botType) => (
            <EuiListGroupItem
              className={styles.item}
              key={botType.value}
              label={(
                <EuiText className={styles.dropdownItem}>
                  {botType.inputDisplay}
                  <span>
                    {' /'}
                    {botType.value}
                  </span>
                </EuiText>
        )}
              onClick={() => {
                onClick(botType.value)
              }}
              data-testid={`bot-type-list-item-${botType.value}`}
            />
          ))}
        </EuiListGroup>
      </div>
    </EuiPopover>
  )
}

export default BotTypePopover
