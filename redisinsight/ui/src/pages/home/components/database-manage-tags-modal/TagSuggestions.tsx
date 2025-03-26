import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { EuiText, EuiSelectable, EuiSelectableOption } from '@elastic/eui'
import { uniqBy } from 'lodash'
import { tagsSelector } from 'uiSrc/slices/instances/tags'
import { presetTagSuggestions } from './constants'
import styles from './styles.module.scss'

type TagSuggestionsProps = {
  targetKey?: string
  searchTerm: string
  currentTagKeys: Set<string>
  onChange: (value: string) => void
}

export const TagSuggestions = ({
  targetKey,
  searchTerm,
  currentTagKeys,
  onChange,
}: TagSuggestionsProps) => {
  const { data: allTags } = useSelector(tagsSelector)
  const tagsSuggestions: EuiSelectableOption<{ value: string }>[] =
    useMemo(() => {
      const filtered = presetTagSuggestions
        .concat(allTags)
        .filter(({ key, value }) => {
          if (targetKey !== undefined) {
            return (
              key === targetKey &&
              value.includes(searchTerm) &&
              value !== searchTerm
            )
          }

          return (
            !currentTagKeys.has(key) &&
            key.includes(searchTerm) &&
            key !== searchTerm
          )
        })
        .map(({ key, value }) => ({ key, value, label: `${key}: ${value}` }))
        .map(({ key, value }) => ({
          label: targetKey ? value : key,
          value: targetKey ? value : key,
        }))

      const selectOptions: EuiSelectableOption<{ value: string }>[] = uniqBy(
        filtered,
        'label',
      )

      if (selectOptions.length === 0 && searchTerm) {
        selectOptions.push({
          label: `${searchTerm} (new ${targetKey ? 'value' : 'tag'})`,
          value: searchTerm,
        })
      }

      return selectOptions
    }, [allTags, targetKey, searchTerm, currentTagKeys])

  if (tagsSuggestions.length === 0) {
    return null
  }

  return (
    <EuiSelectable
      options={tagsSuggestions}
      singleSelection
      listProps={{ showIcons: false }}
      className={styles.suggestions}
      onChange={(options) => {
        const value = options.find((o) => o.checked)?.value

        if (value) {
          onChange(value)
        }
      }}
    >
      {(list) => (
        <>
          <EuiText size="m" color="subdued" className={styles.suggestionsTitle}>
            Suggestions
          </EuiText>
          {list}
        </>
      )}
    </EuiSelectable>
  )
}
