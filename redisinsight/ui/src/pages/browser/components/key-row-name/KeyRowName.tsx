import React from 'react'
import {
  EuiLoadingContent,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { isUndefined } from 'lodash'

import { Maybe, formatLongName, replaceSpaces } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  nameString: Maybe<string>
}

const KeyRowName = (props: Props) => {
  const { nameString } = props

  if (isUndefined(nameString)) {
    return (
      <EuiLoadingContent
        lines={1}
        className={styles.keyInfoLoading}
        data-testid="name-loading"
      />
    )
  }

  // Better to cut the long string, because it could affect virtual scroll performance
  const nameContent = replaceSpaces(nameString?.substring?.(0, 200))
  const nameTooltipContent = formatLongName(nameString)

  return (
    <div className={styles.keyName}>
      <EuiText color="subdued" size="s" style={{ maxWidth: '100%', display: 'flex' }}>
        <div style={{ display: 'flex' }} className="truncateText" data-testid={`key-${nameString}`}>
          <EuiToolTip
            title="Key Name"
            className={styles.tooltip}
            anchorClassName="truncateText"
            position="bottom"
            content={nameTooltipContent}
          >
            <>{nameContent}</>
          </EuiToolTip>
        </div>
      </EuiText>
    </div>
  )
}

export default KeyRowName
