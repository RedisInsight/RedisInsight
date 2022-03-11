/* eslint-disable sonarjs/no-nested-template-literals */
import React, { useContext } from 'react'
import { EuiButtonIcon, EuiIcon, EuiTextColor, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'

import {
  RedisDefaultModules,
  DATABASE_LIST_MODULES_TEXT,
} from 'uiSrc/slices/interfaces'
import { Theme } from 'uiSrc/constants'
import { getModule, truncateText } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import RedisAILight from 'uiSrc/assets/img/modules/RedisAILight.svg'
import RedisAIDark from 'uiSrc/assets/img/modules/RedisAIDark.svg'
import RedisBloomLight from 'uiSrc/assets/img/modules/RedisBloomLight.svg'
import RedisBloomDark from 'uiSrc/assets/img/modules/RedisBloomDark.svg'
import RedisGearsLight from 'uiSrc/assets/img/modules/RedisGearsLight.svg'
import RedisGearsDark from 'uiSrc/assets/img/modules/RedisGearsDark.svg'
import RedisGraphLight from 'uiSrc/assets/img/modules/RedisGraphLight.svg'
import RedisGraphDark from 'uiSrc/assets/img/modules/RedisGraphDark.svg'
import RedisJSONLight from 'uiSrc/assets/img/modules/RedisJSONLight.svg'
import RedisJSONDark from 'uiSrc/assets/img/modules/RedisJSONDark.svg'
import RedisSearchLight from 'uiSrc/assets/img/modules/RedisSearchLight.svg'
import RedisSearchDark from 'uiSrc/assets/img/modules/RedisSearchDark.svg'
import RedisTimeSeriesLight from 'uiSrc/assets/img/modules/RedisTimeSeriesLight.svg'
import RedisTimeSeriesDark from 'uiSrc/assets/img/modules/RedisTimeSeriesDark.svg'
import UnknownLight from 'uiSrc/assets/img/modules/UnknownLight.svg'
import UnknownDark from 'uiSrc/assets/img/modules/UnknownDark.svg'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'

import styles from './styles.module.scss'

export interface Props {
  modules: RedisModuleDto[]
  inCircle?: boolean
  dark?: boolean
  highlight?: boolean
  maxViewModules?: number
  tooltipTitle?: React.ReactNode
}

export const modulesDefaultInit = {
  [RedisDefaultModules.AI]: {
    iconDark: RedisAIDark,
    iconLight: RedisAILight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI],
  },
  [RedisDefaultModules.Bloom]: {
    iconDark: RedisBloomDark,
    iconLight: RedisBloomLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  },
  [RedisDefaultModules.Gears]: {
    iconDark: RedisGearsDark,
    iconLight: RedisGearsLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  },
  [RedisDefaultModules.Graph]: {
    iconDark: RedisGraphDark,
    iconLight: RedisGraphLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Graph],
  },
  [RedisDefaultModules.ReJSON]: {
    iconDark: RedisJSONDark,
    iconLight: RedisJSONLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.ReJSON],
  },
  [RedisDefaultModules.Search]: {
    iconDark: RedisSearchDark,
    iconLight: RedisSearchLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search],
  },
  [RedisDefaultModules.TimeSeries]: {
    iconDark: RedisTimeSeriesDark,
    iconLight: RedisTimeSeriesLight,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  },
}

const DatabaseListModules = React.memo(({ modules, inCircle, highlight, tooltipTitle, maxViewModules }: Props) => {
  const { theme } = useContext(ThemeContext)

  const mainContent = []

  const handleCopy = (text = '') => {
    navigator?.clipboard?.writeText(text)
  }

  const newModules = modules?.map(({ name: propName, semanticVersion = '', version = '' }) => {
    const moduleName = modulesDefaultInit[propName]?.text || propName

    const { abbreviation = '', name = moduleName } = getModule(moduleName)

    const moduleAlias = truncateText(name, 50)
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    let icon = modulesDefaultInit[propName]?.[theme === Theme.Dark ? 'iconDark' : 'iconLight']
    const content = `${moduleAlias}${semanticVersion || version ? ` v. ${semanticVersion || version}` : ''}`

    if (!icon && !abbreviation) {
      icon = theme === Theme.Dark ? UnknownDark : UnknownLight
    }

    mainContent.push({ icon, content, abbreviation })

    return {
      moduleName,
      icon,
      abbreviation,
      content
    }
  })

  // set count of hidden modules
  if (maxViewModules && newModules.length > maxViewModules) {
    newModules.length = maxViewModules
    newModules.push({
      icon: null,
      content: '',
      moduleName: '',
      abbreviation: `+${modules.length - maxViewModules}`
    })
  }

  const Content = mainContent.map(({ icon, content, abbreviation = '' }) => (
    <div className={styles.tooltipItem}>
      {!!icon && (<EuiIcon type={icon} style={{ marginRight: 10 }} />)}
      {!icon && (
        <EuiTextColor
          className={cx(styles.icon, styles.abbr)}
          style={{ marginRight: 10 }}
        >
          {abbreviation}
        </EuiTextColor>
      )}
      {!!content && (<EuiTextColor className={cx(styles.tooltipItemText)}>{content}</EuiTextColor>)}
      <br />
    </div>
  ))

  return (
    <div className={cx(styles.container, {
      [styles.highlight]: highlight,
      [styles.containerCircle]: inCircle,
    })}
    >
      <EuiToolTip
        position="bottom"
        title={tooltipTitle ?? undefined}
        display="inlineBlock"
        content={Content}
      >
        <>
          {newModules.map(({ icon, content, abbreviation, moduleName }) => (
            icon ? (
              <EuiButtonIcon
                iconType={icon}
                className={cx(styles.icon, { [styles.circle]: inCircle })}
                onClick={() => handleCopy(content)}
                data-testid={`${content}_module`}
                aria-labelledby={`${content}_module`}
                key={moduleName}
              />
            ) : (
              <EuiTextColor
                className={cx(styles.icon, styles.abbr, { [styles.circle]: inCircle })}
                onClick={() => handleCopy(content)}
                data-testid={`${content}_module`}
                aria-labelledby={`${content}_module`}
                key={moduleName}
              >
                {abbreviation}
              </EuiTextColor>
            )))}
        </>
      </EuiToolTip>
    </div>
  )
})

export default DatabaseListModules
