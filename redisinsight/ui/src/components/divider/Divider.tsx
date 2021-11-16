import React from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface Props {
  color?: string
  orientation?: 'horizontal' | 'vertical',
  variant? : 'fullWidth' | 'middle' | 'half';
  className?: string;
}

const Divider = ({ orientation, variant, className, color }: Props) => (
  <div
    className={cx(
      styles.divider,
      styles[`divider-${variant || 'fullWidth'}`],
      styles[`divider-${orientation || 'horizontal'}`],
      className,
    )}
  >
    <hr style={color ? { backgroundColor: color } : {}} />
  </div>
)

export default Divider
