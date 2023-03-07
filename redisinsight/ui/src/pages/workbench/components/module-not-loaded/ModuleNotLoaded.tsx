import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiTextColor,
  EuiText,
  EuiTitle,
  EuiLink,
  EuiButton,
} from '@elastic/eui'

import { ReactComponent as MobileIcon } from 'uiSrc/assets/img/icons/mobile_module_not_loaded.svg'
import { ReactComponent as DesktopIcon } from 'uiSrc/assets/img/icons/module_not_loaded.svg'
import { ReactComponent as CheerIcon } from 'uiSrc/assets/img/icons/cheer.svg'
import { MODULE_NOT_LOADED_CONTENT as CONTENT, MODULE_TEXT_VIEW } from 'uiSrc/constants'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface IProps {
  moduleName: RedisDefaultModules
  id: string
}

const MAX_ELEMENT_WIDTH = 1440

const renderTitle = (width: number, moduleName?: string) => (
  <EuiTitle size="m" className={styles.title} data-testid="welcome-page-title">
    <h4>
      {`Looks like ${moduleName} is not available `}
      {width > MAX_ELEMENT_WIDTH && <br />}
      for this database
    </h4>
  </EuiTitle>
)

const renderText = (moduleName?: string) => (
  <EuiText className={cx(styles.text, styles.marginBottom)}>
    {`Create a free Redis Stack database with ${moduleName} which extends the core capabilities of open-source Redis`}
  </EuiText>
)

const ListItem = ({ item }: { item: string }) => (
  <li className={styles.listItem}>
    <div className={styles.iconWrapper}>
      <CheerIcon className={styles.listIcon} />
    </div>
    <EuiTextColor className={styles.text}>{item}</EuiTextColor>
  </li>
)

const ModuleNotLoaded = ({ moduleName, id }: IProps) => {
  const [width, setWidth] = useState(0)

  const module = MODULE_TEXT_VIEW[moduleName]

  useEffect(() => {
    const parentEl = document?.getElementById(id)
    if (parentEl) {
      setWidth(parentEl.offsetWidth)
    }
  })

  return (
    <div className={cx(styles.container, { [styles.fullScreen]: width > MAX_ELEMENT_WIDTH })}>
      <div className={styles.flex}>
        <div>
          {width > MAX_ELEMENT_WIDTH
            ? <DesktopIcon className={styles.bigIcon} />
            : <MobileIcon className={styles.icon} />}
        </div>
        <div className={styles.contentWrapper}>
          {renderTitle(width, module)}
          <EuiText className={styles.bigText}>{CONTENT[moduleName]?.text}</EuiText>
          <ul className={cx(styles.list, { [styles.bloomList]: moduleName === RedisDefaultModules.Bloom })}>
            {CONTENT[moduleName]?.improvements.map((item: string) => (
              <ListItem key={item} item={item} />
            ))}
          </ul>
          {!!CONTENT[moduleName]?.additionalText && (
            <EuiText className={cx(styles.text, styles.additionalText, styles.marginBottom)}>
              {CONTENT[moduleName]?.additionalText}
            </EuiText>
          )}
          {renderText(module)}
        </div>
      </div>
      <div className={styles.linksWrapper}>
        <EuiLink
          className={cx(styles.text, styles.link)}
          external={false}
          target="_blank"
          href={CONTENT[moduleName]?.link}
          data-testid="learn-more-link"
        >
          Learn More
        </EuiLink>
        <EuiLink
          className={styles.link}
          external={false}
          target="_blank"
          href="https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_workbench"
          data-testid="get-started-link"
        >
          <EuiButton
            fill
            size="s"
            color="secondary"
            className={styles.btnLink}
          >
            Get Started For Free
          </EuiButton>
        </EuiLink>
      </div>
    </div>
  )
}

export default ModuleNotLoaded
