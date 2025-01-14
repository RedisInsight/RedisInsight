import React, { Ref, useEffect, useRef } from 'react'
import cx from 'classnames'
import { EuiIcon, EuiTextColor } from '@elastic/eui'

import { scrollIntoView } from 'uiSrc/utils'
import styles from './styles.module.scss'

type Colors =
  | 'default'
  | 'secondary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'subdued'
  | 'ghost'
export interface Props {
  children: React.ReactElement | string
  color?: Colors
  scrollViewOnAppear?: boolean
  icon?: string
  testID?: string
}

const FieldMessage = ({
  children,
  color,
  testID,
  icon,
  scrollViewOnAppear,
}: Props) => {
  const divRef: Ref<HTMLDivElement> = useRef(null)

  useEffect(() => {
    // componentDidMount
    if (scrollViewOnAppear) {
      scrollIntoView(divRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [])

  return (
    <div ref={divRef} className={cx(styles.container)}>
      {icon && (
        <EuiIcon
          className={cx(styles.icon)}
          type={icon}
          color={color || 'danger'}
        />
      )}
      <EuiTextColor
        className={cx(styles.message)}
        data-testid={testID}
        color={color || 'danger'}
      >
        {children}
      </EuiTextColor>
    </div>
  )
}

export default FieldMessage
