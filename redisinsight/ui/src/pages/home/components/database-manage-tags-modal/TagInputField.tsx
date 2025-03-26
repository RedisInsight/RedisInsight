/* eslint-disable react/no-array-index-key */
import React from 'react'
import { EuiFieldText, EuiToolTip } from '@elastic/eui'

import { INVALID_FIELD_MESSAGE } from './constants'
import { TagSuggestions } from './TagSuggestions'

type TagInputFieldProps = {
  isFieldInvalid: boolean
  value: string
  currentTagKeys: Set<string>
  showSuggestions: boolean
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onFocusCapture: React.FocusEventHandler<HTMLInputElement>
  onTagSuggestionSelect: (value: string) => void
}

export const TagInputField = ({
  isFieldInvalid,
  value,
  currentTagKeys,
  showSuggestions,
  suggestedTagKey,
  rightContent,
  onChange,
  onFocusCapture,
  onTagSuggestionSelect,
}: TagInputFieldProps) => {
  1

  return (
    <div>
      <EuiToolTip
        content={isFieldInvalid && INVALID_FIELD_MESSAGE}
        position="top"
      >
        <div>
          <EuiFieldText
            value={value}
            isInvalid={isFieldInvalid}
            onChange={onChange}
            onFocusCapture={onFocusCapture}
          />
          {showSuggestions && (
            <TagSuggestions
              targetKey={suggestedTagKey}
              searchTerm={value}
              currentTagKeys={currentTagKeys}
              onChange={onTagSuggestionSelect}
            />
          )}
        </div>
      </EuiToolTip>
      {rightContent}
    </div>
  )
}
