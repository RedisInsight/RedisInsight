/* eslint-disable arrow-body-style */
import { EuiBadge, EuiToolTip } from '@elastic/eui'
import React from 'react'

import { Tag } from 'uiSrc/slices/interfaces/tag'
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
      <EuiBadge className={`${styles.tagBadge} ${styles.tagBadgeOverflow}`}>
        {firstTagText}
      </EuiBadge>
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
          <EuiBadge className={styles.tagBadge} title={undefined}>
            +{remainingTagsCount}
          </EuiBadge>
        </EuiToolTip>
      )}
    </div>
  )
}
