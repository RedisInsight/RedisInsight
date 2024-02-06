import React from 'react'
import { EuiText } from '@elastic/eui'

import cx from 'classnames'
import { RdiPipelineMode } from 'uiSrc/slices/interfaces'
import { ExternalLink } from 'uiSrc/components'

import { Maybe } from 'uiSrc/utils'
import styles from './styles.module.scss'

const rdiPipelineModes = [
  {
    id: RdiPipelineMode.ingest,
    title: RdiPipelineMode.ingest,
    description: 'Synchronize existing SQL or NoSQL databases with Redis Enterprise to mirror application data. As a result, applications will be able to access data at in-memory speeds without refactoring, writing new code, or exhausting integration efforts.',
    link: 'https://docs.redis.com/rdi-preview/rdi/quickstart/ingest-guide/?utm_source=redisinsight&utm_medium=pipeline_mode&utm_campaign=ingest',
  },
  {
    id: RdiPipelineMode.writeBehind,
    title: RdiPipelineMode.writeBehind,
    description: 'Replicate changes captured in Redis Enterprise to SQL or NoSQL databases. As a result, your data is up-to-date and synchronized in near real-time without exhausting integration efforts or writing new code.',
    link: 'https://docs.redis.com/rdi-preview/rdi/quickstart/write-behind-guide/?utm_source=redisinsight&utm_medium=pipeline_mode&utm_campaign=write_behind'
  }
]

export interface Props {
  selectedMode: Maybe<RdiPipelineMode>
  setMode: (mode: RdiPipelineMode) => void
}

const ModeSwitcher = (props: Props) => {
  const { selectedMode, setMode } = props
  return (
    <div className={styles.wrapper}>
      {rdiPipelineModes.map(({ id, title, description, link }, idx) => (
        <div
          key={id}
          role="button"
          onKeyDown={() => {}}
          tabIndex={idx}
          className={cx(styles.btn, { [styles.isSelected]: selectedMode === id })}
          onClick={() => setMode(id)}
        >
          <EuiText className={styles.title}>{title}</EuiText>
          <EuiText className={styles.text}>{description}</EuiText>
          <ExternalLink
            color="text"
            href={link}
            onClick={(e) => e.stopPropagation()}
            iconPosition="left"
            className={styles.link}
            data-testid={`read-more-link-${id}`}
          >
            Read more
          </ExternalLink>
        </div>
      ))}
    </div>
  )
}

export default ModeSwitcher
