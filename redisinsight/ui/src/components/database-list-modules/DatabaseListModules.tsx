/* eslint-disable import/no-webpack-loader-syntax */
import React, { useContext } from 'react'
import { EuiButton, EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { isNumber } from 'lodash'

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
  modules: RedisModuleDto[];
  inCircle?: boolean;
  dark?: boolean;
  maxLength?: number;
}

interface ITooltipProps {
  icon: any;
  content: any;
  abbreviation?: string;
}

const DatabaseListModules = React.memo(({ modules: modulesProp, inCircle, maxLength }: Props) => {
  const modules = isNumber(maxLength) ? modulesProp.slice(0, maxLength) : modulesProp
  const { theme } = useContext(ThemeContext)

  const handleCopy = (text = '') => {
    navigator?.clipboard?.writeText(text)
  }

  const modulesDefaultInit = {
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

  const Tooltip = ({ icon, content, abbreviation }: ITooltipProps) => (
    <>
      <EuiToolTip
        content={content}
        position="top"
        display="inlineBlock"
        anchorClassName={cx({ [styles.anchorCircleIcon]: inCircle })}
      >
        {icon ? (
          <EuiButtonIcon
            iconType={icon}
            className={cx(styles.icon, { [styles.circle]: inCircle })}
            onClick={() => handleCopy(content)}
            data-testid={`${content}_module`}
            aria-labelledby={`${content}_module`}
          />
        ) : (
          <EuiButton
            className={cx(styles.icon, { [styles.circle]: inCircle })}
            onClick={() => handleCopy(content)}
            data-testid={`${content}_module`}
            aria-labelledby={`${content}_module`}
          >
            {abbreviation}
          </EuiButton>
        )}
      </EuiToolTip>
    </>
  )

  const modulesRender = modules?.map(({ name: propName, semanticVersion = '', version = '' }) => {
    const moduleName = modulesDefaultInit[propName]?.text || propName

    const { abbreviation = '', name = moduleName } = getModule(moduleName)

    const moduleAlias = truncateText(name, 50)
    const content = `${moduleAlias}${semanticVersion || version ? ` v. ${semanticVersion || version}` : ''}`
    let icon = modulesDefaultInit[propName]?.[theme === Theme.Dark ? 'iconDark' : 'iconLight']

    if (!icon && !abbreviation) {
      icon = theme === Theme.Dark ? UnknownDark : UnknownLight
    }

    return (
      <Tooltip
        key={moduleName}
        icon={icon}
        abbreviation={abbreviation}
        content={content}
      />
    )
  })

  return <>{modulesRender}</>
})

export default DatabaseListModules
