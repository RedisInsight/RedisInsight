import React from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface Props {
  color?: string
  colorVariable?: string
  orientation?: 'horizontal' | 'vertical',
  variant? : 'fullWidth' | 'middle' | 'half';
  className?: string;
}

const Divider = ({ orientation, variant, className, color, colorVariable }: Props) => (
  <div
    className={cx(
      styles.divider,
      styles[`divider-${variant || 'fullWidth'}`],
      styles[`divider-${orientation || 'horizontal'}`],
      className,
    )}
  >
    <hr style={(color || colorVariable) ? { backgroundColor: color ?? `var(--${colorVariable})` } : {}} />
  </div>
)

export default Divider
