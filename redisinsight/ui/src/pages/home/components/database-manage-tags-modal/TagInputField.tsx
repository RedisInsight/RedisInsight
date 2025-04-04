import React, { useState } from 'react'
import { EuiFieldText, EuiToolTip } from '@elastic/eui'

import { INVALID_FIELD_MESSAGE } from './constants'
import { TagSuggestions } from './TagSuggestions'

type TagInputFieldProps = {
  value: string
  isInvalid: boolean
  disabled?: boolean
  currentTagKeys: Set<string>
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  onChange: (value: string) => void
}

export const TagInputField = ({
  value,
  isInvalid,
  disabled,
  currentTagKeys,
  suggestedTagKey,
  rightContent,
  onChange,
}: TagInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      <EuiToolTip content={isInvalid && INVALID_FIELD_MESSAGE} position="top">
        <div>
          <EuiFieldText
            value={value}
            disabled={disabled}
            isInvalid={isInvalid}
            onChange={(e) => onChange(e.target.value)}
            onFocusCapture={() => {
              setIsFocused(true)
            }}
            onBlurCapture={() => {
              setTimeout(() => {
                isFocused && setIsFocused(false)
              }, 150)
            }}
          />
          {isFocused && !isInvalid && (
            <TagSuggestions
              targetKey={suggestedTagKey}
              searchTerm={value}
              currentTagKeys={currentTagKeys}
              onChange={(value) => {
                setIsFocused(false)
                onChange(value)
              }}
            />
          )}
        </div>
      </EuiToolTip>
      {rightContent}
    </div>
  )
}
