import React, { useCallback, useContext, useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiTextColor,
  EuiText,
  EuiTitle,
  EuiLink,
  EuiButton,
  EuiIcon,
} from '@elastic/eui'
import { useSelector } from 'react-redux'

import { ReactComponent as MobileIcon } from 'uiSrc/assets/img/icons/mobile_module_not_loaded.svg'
import { ReactComponent as DesktopIcon } from 'uiSrc/assets/img/icons/module_not_loaded.svg'
import { ReactComponent as TelescopeDark } from 'uiSrc/assets/img/telescope-dark.svg'
import { ReactComponent as TelescopeLight } from 'uiSrc/assets/img/telescope-light.svg'
import { ReactComponent as CheerIcon } from 'uiSrc/assets/img/icons/cheer.svg'
import { MODULE_NOT_LOADED_CONTENT as CONTENT, MODULE_TEXT_VIEW, Theme } from 'uiSrc/constants'
import { RedisDefaultModules, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { getUtmExternalLink } from 'uiSrc/utils/links'

import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { getDbWithModuleLoaded } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface IProps {
  moduleName: RedisDefaultModules
  id: string
  onClose?: () => void
  type?: 'workbench' | 'browser'
}

const MIN_ELEMENT_WIDTH = 1210
const MAX_ELEMENT_WIDTH = 1440

const renderTitle = (width: number, moduleName?: string) => (
  <EuiTitle size="m" className={styles.title} data-testid="welcome-page-title">
    <h4>
      {`${moduleName} ${moduleName === MODULE_TEXT_VIEW.redisgears ? 'are' : 'is'} not available `}
      {width > MAX_ELEMENT_WIDTH && <br />}
      for this database
    </h4>
  </EuiTitle>
)

const ListItem = ({ item }: { item: string }) => (
  <li className={styles.listItem}>
    <div className={styles.iconWrapper}>
      <CheerIcon className={styles.listIcon} />
    </div>
    <EuiTextColor className={styles.text}>{item}</EuiTextColor>
  </li>
)

const ModuleNotLoaded = ({ moduleName, id, type = 'workbench', onClose }: IProps) => {
  const [width, setWidth] = useState(0)
  const freeInstances = useSelector(freeInstancesSelector) || []
  const { theme } = useContext(ThemeContext)

  const module = MODULE_TEXT_VIEW[moduleName]
  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, moduleName)

  useEffect(() => {
    const parentEl = document?.getElementById(id)
    if (parentEl) {
      setWidth(parentEl.offsetWidth)
    }
  })

  const renderText = useCallback((moduleName?: string) => (!freeDbWithModule ? (
    <EuiText className={cx(styles.text, styles.marginBottom)}>
      {`Create a free Redis Stack database with ${moduleName} which extends the core capabilities of open-source Redis`}
    </EuiText>
  ) : (
    <EuiText className={cx(styles.text, styles.marginBottom, styles.textFooter)}>
      Use your free all-in-one Redis Cloud database to start exploring these capabilities.
    </EuiText>
  )), [freeDbWithModule])

  const onFreeDatabaseClick = () => {
    onClose?.()
  }

  const utmCampaign = type === 'browser'
    ? UTM_CAMPAINGS[OAuthSocialSource.BrowserSearch]
    : UTM_CAMPAINGS[OAuthSocialSource.Workbench]

  return (
    <div className={cx(styles.container, {
      [styles.fullScreen]: width > MAX_ELEMENT_WIDTH || type === 'browser',
      [styles.modal]: type === 'browser',
    })}
    >
      <div className={styles.flex}>
        <div>
          {type !== 'browser' && (
            width > MAX_ELEMENT_WIDTH
              ? <DesktopIcon className={styles.bigIcon} />
              : <MobileIcon className={styles.icon} />
          )}
          {type === 'browser' && (
            <EuiIcon
              className={styles.iconTelescope}
              type={theme === Theme.Dark ? TelescopeDark : TelescopeLight}
              size="original"
            />
          )}
        </div>
        <div className={styles.contentWrapper}>
          {renderTitle(width, module)}
          <EuiText className={styles.bigText}>
            {CONTENT[moduleName]?.text.map((item: string) => (
              width > MIN_ELEMENT_WIDTH ? <>{item}<br /></> : item
            ))}
          </EuiText>
          <ul className={cx(styles.list, { [styles.bloomList]: moduleName === RedisDefaultModules.Bloom })}>
            {CONTENT[moduleName]?.improvements.map((item: string) => (
              <ListItem key={item} item={item} />
            ))}
          </ul>
          {!!CONTENT[moduleName]?.additionalText && (
            <EuiText className={cx(styles.text, styles.additionalText, styles.marginBottom)}>
              {CONTENT[moduleName]?.additionalText.map((item: string) => (
                width > MIN_ELEMENT_WIDTH ? <>{item}<br /></> : item
              ))}
            </EuiText>
          )}
          {renderText(module)}
        </div>
      </div>
      <div className={styles.linksWrapper}>
        {!!freeDbWithModule && (
          <OAuthConnectFreeDb
            source={type === 'browser' ? OAuthSocialSource.BrowserSearch : OAuthSocialSource[module]}
            id={freeDbWithModule.id}
          />
        )}
        {!freeDbWithModule && (
          <>
            <EuiLink
              className={cx(styles.text, styles.link)}
              external={false}
              target="_blank"
              href={getUtmExternalLink(CONTENT[moduleName]?.link, { campaign: utmCampaign })}
              data-testid="learn-more-link"
            >
              Learn More
            </EuiLink>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <EuiLink
                  className={styles.link}
                  external={false}
                  target="_blank"
                  href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: utmCampaign })}
                  onClick={(e) => {
                    ssoCloudHandlerClick(
                      e,
                      type === 'browser' ? OAuthSocialSource.BrowserSearch : OAuthSocialSource[module]
                    )
                    onFreeDatabaseClick()
                  }}
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
              )}
            </OAuthSsoHandlerDialog>
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(ModuleNotLoaded)
