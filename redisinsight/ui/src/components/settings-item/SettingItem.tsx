import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiIcon, EuiTitle } from '@elastic/eui'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { NumericInput } from 'uiSrc/components/base/inputs'
import styles from './styles.module.scss'

export interface Props {
  initValue: string
  testid: string
  placeholder: string
  label: string
  title: string
  summary: string | JSX.Element
  onApply: (value: string) => void
  validation: (value: string) => string
}

const SettingItem = (props: Props) => {
  const {
    initValue,
    title,
    summary,
    testid,
    placeholder,
    label,
    onApply,
    validation = (val: string) => val,
  } = props

  const [value, setValue] = useState<string>(initValue)
  const [isEditing, setEditing] = useState<boolean>(false)
  const [isHovering, setHovering] = useState<boolean>(false)

  useEffect(() => {
    setValue(initValue)
  }, [initValue])

  const handleApplyChanges = () => {
    setEditing(false)
    setHovering(false)

    onApply(value)
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(initValue)
    setEditing(false)
    setHovering(false)
  }

  const appendEditing = () =>
    !isEditing ? <EuiIcon type="pencil" color="subdued" /> : ''

  return (
    <>
      <EuiTitle className={styles.title} size="xxs">
        <span>{title}</span>
      </EuiTitle>
      <Spacer size="s" />
      <Text className={styles.smallText} size="s" color="subdued">
        {summary}
      </Text>
      <Spacer size="m" />
      <Row align="center" className={styles.container}>
        <FlexItem style={{ marginRight: '4px' }}>
          <Text size="xs" color="subdued" className={styles.inputLabel}>
            {label}
          </Text>
        </FlexItem>

        <FlexItem
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={() => setEditing(true)}
          style={{ paddingBottom: '1px' }}
        >
          {isEditing || isHovering ? (
            <InlineItemEditor
              controlsPosition="right"
              viewChildrenMode={!isEditing}
              onApply={handleApplyChanges}
              onDecline={handleDeclineChanges}
              declineOnUnmount={false}
            >
              <NumericInput
                autoValidate
                onChange={(value) =>
                  isEditing &&
                  setValue(validation(value ? value.toString() : ''))
                }
                value={Number(value)}
                placeholder={placeholder}
                aria-label={testid?.replaceAll?.('-', ' ')}
                append={appendEditing()}
                className={cx(styles.input, {
                  [styles.inputEditing]: isEditing,
                  [styles.inputHover]: isHovering,
                })}
                readOnly={!isEditing}
                data-testid={`${testid}-input`}
              />
            </InlineItemEditor>
          ) : (
            <Text className={styles.value} data-testid={`${testid}-value`}>
              {value}
            </Text>
          )}
        </FlexItem>
      </Row>
      <Spacer size="m" />
    </>
  )
}

export default SettingItem
