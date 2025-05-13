import {
  EuiFieldText,
  EuiFormRow,
  EuiIcon,
  EuiPopover,
  EuiCheckbox,
} from '@elastic/eui'
import React, { memo } from 'react'

import FilterSvg from 'uiSrc/assets/img/icons/filter.svg'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { useFilterTags } from './useFilterTags'
import styles from './styles.module.scss'

export const TagsCellHeader = memo(() => {
  const {
    isPopoverOpen,
    tagSearch,
    tagsData,
    selectedTags,
    setTagSearch,
    onPopoverToggle,
    onTagChange,
    onKeyChange,
    groupedTags,
  } = useFilterTags()

  if (!tagsData.length) {
    return <div>Tags</div>
  }

  return (
    <div>
      Tags{' '}
      <EuiPopover
        button={
          <EuiIcon
            role="button"
            type={FilterSvg}
            size="m"
            className={styles.filterByTagIcon}
            onClick={(e) => {
              e.stopPropagation()
              onPopoverToggle()
            }}
          />
        }
        isOpen={isPopoverOpen}
        closePopover={onPopoverToggle}
        anchorPosition="downCenter"
      >
        {/* stop propagation to prevent sorting by column header */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div style={{ width: 300 }} onClick={(e) => e.stopPropagation()}>
          <EuiFormRow>
            <EuiFieldText
              icon="search"
              role="search"
              data-testid="tag-search"
              placeholder="Enter tag key or value"
              style={{ borderRadius: 4 }}
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value)
              }}
            />
          </EuiFormRow>
          <Spacer size="m" />
          {Object.keys(groupedTags).map((key) => (
            <div key={key}>
              <EuiCheckbox
                id={key}
                className={styles.filterTagLabel}
                label={key}
                checked={groupedTags[key].every((value) =>
                  selectedTags.has(`${key}:${value}`),
                )}
                onChange={(event) => {
                  onKeyChange(key, event.target.checked)
                }}
              />
              {groupedTags[key].map((value) => (
                <div key={value} style={{ paddingLeft: '20px' }}>
                  <EuiCheckbox
                    id={`${key}:${value}`}
                    className={styles.filterTagLabel}
                    data-testid={`${key}:${value}`}
                    label={value}
                    checked={selectedTags.has(`${key}:${value}`)}
                    onChange={(event) => {
                      onTagChange(`${key}:${value}`, event.target.checked)
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </EuiPopover>
    </div>
  )
})
