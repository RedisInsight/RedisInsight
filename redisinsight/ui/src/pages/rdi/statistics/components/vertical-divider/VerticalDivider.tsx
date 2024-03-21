import React from 'react'

import Divider from 'uiSrc/components/divider/Divider'

import styles from './styles.module.scss'

const VerticalDivider = () => (
  <Divider className={styles.divider} colorVariable="separatorColor" orientation="vertical" />
)

export default VerticalDivider
