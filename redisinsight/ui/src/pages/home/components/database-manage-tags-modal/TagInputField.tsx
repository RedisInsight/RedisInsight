import React, { useState } from 'react'
import { EuiFieldText } from '@elastic/eui'

import { RiTooltip } from 'uiSrc/components'
import { TagSuggestions } from './TagSuggestions'

type TagInputFieldProps = {
  value: string
  disabled?: boolean
  currentTagKeys: Set<string>
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  errorMessage?: string
  onChange: (value: string) => void
}

export const TagInputField = ({
  value,
  disabled,
  currentTagKeys,
  suggestedTagKey,
  rightContent,
  errorMessage,
  onChange,
}: TagInputFieldProps) => {
  const isInvalid = Boolean(errorMessage)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      <RiTooltip content={errorMessage} position="top">
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
      </RiTooltip>
      {rightContent}
    </div>
  )
}
