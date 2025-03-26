import React from 'react'
import { EuiFieldText, EuiToolTip, EuiFieldTextProps } from '@elastic/eui'

import { INVALID_FIELD_MESSAGE } from './constants'
import { TagSuggestions } from './TagSuggestions'

type TagInputFieldProps = EuiFieldTextProps & {
  value: string
  currentTagKeys: Set<string>
  showSuggestions: boolean
  suggestedTagKey?: string
  rightContent?: React.ReactNode
  onTagSuggestionSelect: (value: string) => void
}

export const TagInputField = ({
  value,
  isInvalid,
  currentTagKeys,
  showSuggestions,
  suggestedTagKey,
  rightContent,
  onTagSuggestionSelect,
  ...fieldTextProps
}: TagInputFieldProps) => (
  <div>
    <EuiToolTip content={isInvalid && INVALID_FIELD_MESSAGE} position="top">
      <div>
        <EuiFieldText value={value} {...fieldTextProps} />
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
