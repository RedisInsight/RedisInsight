import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  EuiTextColor,
  EuiText,
  EuiTitle,
  EuiButton,
  EuiButtonEmpty,
  EuiLink,
} from '@elastic/eui'

import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme, Pages, MODULE_NOT_LOADED_CONTENT as CONTENT, MODULE_TEXT_VIEW } from 'uiSrc/constants'
import { ReactComponent as CheerIcon } from 'uiSrc/assets/img/icons/cheer.svg'
import { ReactComponent as TriggersAndFunctionsImageDark } from 'uiSrc/assets/img/triggers_and_functions_dark.svg'
import { ReactComponent as TriggersAndFunctionsImageLight } from 'uiSrc/assets/img/triggers_and_functions_light.svg'
import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'

import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import { getDbWithModuleLoaded } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface IProps {
  isModuleLoaded: boolean
  isAddLibraryPanelOpen?: boolean
  onAddLibrary?: () => void
}

const mdPath = '/quick-guides/triggers-and-functions/introduction.md'

const ListItem = ({ item }: { item: string }) => (
  <li className={styles.listItem}>
    <div className={styles.iconWrapper}>
      <CheerIcon className={styles.listIcon} />
    </div>
    <EuiTextColor className={styles.text}>{item}</EuiTextColor>
  </li>
)

const moduleName = MODULE_TEXT_VIEW[RedisDefaultModules.RedisGears]

const NoLibrariesScreen = (props: IProps) => {
  const { isAddLibraryPanelOpen, isModuleLoaded, onAddLibrary = () => {} } = props
  const freeInstances = useSelector(freeInstancesSelector) || []

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const { theme } = useContext(ThemeContext)

  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, RedisDefaultModules.RedisGears)

  const goToTutorial = () => {
    if (mdPath) {
      history.push(`${Pages.workbench(instanceId)}?guidePath=${mdPath}`)
      return
    }
    history.push(Pages.workbench(instanceId))
  }

  return (
    <div className={styles.wrapper} data-testid="no-libraries-component">
      <div className={cx(styles.content, { [styles.fullWidth]: isAddLibraryPanelOpen })}>
        <div className={cx('emptyTableTextContent', styles.contentWrapper)}>
          <EuiTitle size="m" className={styles.title}>
            <h4 data-testid="no-libraries-title">
              {isModuleLoaded
                ? 'Triggers and functions'
                : `${moduleName} are not available for this database`}
            </h4>
          </EuiTitle>
          <EuiText className={styles.bigText}>
            {CONTENT[RedisDefaultModules.RedisGears]?.text.map((item: string) => item)}
          </EuiText>
          <ul className={styles.list}>
            {CONTENT[RedisDefaultModules.RedisGears]?.improvements.map((item: string) => (
              <ListItem key={item} item={item} />
            ))}
          </ul>
          {CONTENT[RedisDefaultModules.RedisGears]?.additionalText.map((item: string, idx: number) => (
            <EuiText
              key={item}
              className={cx(styles.additionalText, styles.row)}
              data-testid={`no-libraries-additional-text-${idx}`}
            >
              {item}
            </EuiText>
          ))}
          <EuiText className={cx(styles.additionalText, styles.row)} data-testid="no-libraries-action-text">
            {isModuleLoaded
              ? 'Upload a new library to start working with triggers and functions or try the interactive tutorial to learn more.'
              : 'Create a free Redis Stack database which extends the core capabilities of open-source Redis and try the interactive tutorial to learn how to work with triggers and functions.'}
          </EuiText>
        </div>
        <div className={styles.linksWrapper}>
          <EuiButtonEmpty
            className={cx(styles.text, styles.link, styles.btn)}
            size="s"
            onClick={goToTutorial}
            data-testid="no-libraries-tutorial-link"
          >
            Tutorial
          </EuiButtonEmpty>
          {isModuleLoaded
            ? (
              <EuiButton
                fill
                size="s"
                color="secondary"
                className={styles.btn}
                onClick={onAddLibrary}
                data-testid="no-libraries-add-library-btn"
              >
                + Library
              </EuiButton>
            )
            : (
              <>
                {!!freeDbWithModule && (
                  <OAuthConnectFreeDb
                    source={OAuthSocialSource.TriggersAndFunctions}
                    id={freeDbWithModule.id}
                    className={styles.btn}
                  />
                )}
                {!freeDbWithModule && (
                  <OAuthSsoHandlerDialog>
                    {(ssoCloudHandlerClick) => (
                      <EuiLink
                        className={styles.link}
                        external={false}
                        target="_blank"
                        href="https://redis.com/try-free/?utm_source=redisinsight&utm_medium=app&utm_campaign=redisinsight_triggers_and_functions"
                        data-testid="get-started-link"
                        onClick={(e) => {
                          ssoCloudHandlerClick(e, OAuthSocialSource.TriggersAndFunctions)
                        }}
                      >
                        <EuiButton
                          fill
                          size="s"
                          color="secondary"
                          className={styles.btn}
                        >
                          Get Started For Free
                        </EuiButton>
                      </EuiLink>
                    )}
                  </OAuthSsoHandlerDialog>
                )}
              </>
            )}
        </div>
      </div>
      {!isAddLibraryPanelOpen && (
        <div className={styles.imageWrapper}>
          {theme === Theme.Dark
            ? <TriggersAndFunctionsImageDark className={styles.image} />
            : <TriggersAndFunctionsImageLight className={styles.image} />}
        </div>
      )}
    </div>
  )
}

export default NoLibrariesScreen
