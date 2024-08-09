import React from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface Props {
  color?: string
  colorVariable?: string
  orientation?: 'horizontal' | 'vertical',
  variant? : 'fullWidth' | 'middle' | 'half';
  className?: string;
  style?: any
}

const Divider = ({ orientation, variant, className, color, colorVariable, ...props }: Props) => (
  <div
    className={cx(
      styles.divider,
      styles[`divider-${variant || 'fullWidth'}`],
      styles[`divider-${orientation || 'horizontal'}`],
      className,
    )}
    {...props}
  >
    <hr style={(color || colorVariable) ? { backgroundColor: color ?? `var(--${colorVariable})` } : {}} />
  </div>
)

export default Divider
