/* eslint-disable arrow-body-style */
import { EuiToolTip } from '@elastic/eui'
import React from 'react'

import { Tag } from 'uiSrc/slices/interfaces/tag'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import styles from './styles.module.scss'

type TagsCellProps = {
  tags: Tag[]
}

export const TagsCell = ({ tags }: TagsCellProps) => {
  if (!tags[0]) {
    return null
  }

  const firstTagText = `${tags[0].key} : ${tags[0].value}`
  const remainingTagsCount = tags.length - 1

  return (
    <div className={styles.tagsCell}>
      <RiBadge
        className={`${styles.tagBadge} ${styles.tagBadgeOverflow}`}
        label={firstTagText}
      />
      {remainingTagsCount > 0 && (
        <EuiToolTip
          position="top"
          content={
            <div>
              {tags.slice(1).map((tag) => (
                <div key={tag.id}>
                  {tag.key} : {tag.value}
                </div>
              ))}
            </div>
          }
        >
          <RiBadge
            className={styles.tagBadge}
            label={`+${remainingTagsCount}`}
          />
        </EuiToolTip>
      )}
    </div>
  )
}
