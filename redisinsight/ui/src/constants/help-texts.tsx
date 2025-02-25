import React from 'react'
import { EuiIcon, EuiText } from '@elastic/eui'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import styles from 'uiSrc/pages/browser/components/popover-delete/styles.module.scss'

export default {
  REJSON_SHOULD_BE_LOADED: (
    <>
      This database does not support the JSON data structure. Learn more about JSON support
      {' '}
      <a href="https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/json/" target="_blank" rel="noreferrer">here</a>.
      {' '}
      You can also create a
      {' '}
      <a href="https://redis.io/try-free/" target="_blank" rel="noreferrer">free trial Redis Cloud database</a>
      {' '}
      with built-in JSON support.
    </>
  ),
  REMOVE_LAST_ELEMENT: (fieldType: string) => (
    <div className={styles.appendInfo}>
      <EuiIcon type="alert" style={{ marginRight: '1rem', marginTop: '4px' }} />
      <EuiText size="s">
        If you remove the single
        {' '}
        {fieldType}
        , the whole Key will be deleted.
      </EuiText>
    </div>
  ),
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: (
    <>
      Removing multiple elements is available for Redis databases v. 6.2 or
      later. Update your Redis database or create a new&nbsp;
      <a
        href={`${EXTERNAL_LINKS.tryFree}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redis_latest`}
        target="_blank"
        className="link-underline"
        rel="noreferrer"
      >
        free up-to-date trial
      </a>
      &nbsp;Redis database.
    </>
  )
}
