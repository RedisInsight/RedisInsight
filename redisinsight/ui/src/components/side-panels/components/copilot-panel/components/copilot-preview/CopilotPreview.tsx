import React, { useContext } from 'react'
import { EuiIcon } from '@elastic/eui'
import ChatLight from 'uiSrc/assets/img/ai/chat_light.svg'
import ChatDark from 'uiSrc/assets/img/ai/chat_dark.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'
import styles from './styles.module.scss'

const CopilotPreview = () => {
  const { theme } = useContext(ThemeContext)

  const image = theme === Theme.Light ? ChatLight : ChatDark
  return (
    <div className={styles.wrapper}>
      <EuiIcon
        type={image}
        size="original"
        className={styles.previewIcon}
      />
    </div>
  )
}

export default CopilotPreview
