/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import cx from 'classnames'
import { last } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiBadge,
  EuiButtonIcon,
  EuiIcon,
  EuiLink,
  EuiPageSideBar,
  EuiToolTip
} from '@elastic/eui'
import HighlightedFeature, { Props as HighlightedFeatureProps } from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { ANALYTICS_ROUTES } from 'uiSrc/components/main-router/constants/sub-routes'

import { FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  appFeatureFlagsFeaturesSelector,
  appFeaturePagesHighlightingSelector,
  removeFeatureFromHighlighting
} from 'uiSrc/slices/app/features'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { connectedInstanceSelector as connectedRdiInstanceSelector } from 'uiSrc/slices/rdi/instances'
import SettingsSVG from 'uiSrc/assets/img/sidebar/settings.svg'
import SettingsActiveSVG from 'uiSrc/assets/img/sidebar/settings_active.svg'
import BrowserSVG from 'uiSrc/assets/img/sidebar/browser.svg'
import BrowserActiveSVG from 'uiSrc/assets/img/sidebar/browser_active.svg'
import WorkbenchSVG from 'uiSrc/assets/img/sidebar/workbench.svg'
import WorkbenchActiveSVG from 'uiSrc/assets/img/sidebar/workbench_active.svg'
import SlowLogSVG from 'uiSrc/assets/img/sidebar/slowlog.svg'
import SlowLogActiveSVG from 'uiSrc/assets/img/sidebar/slowlog_active.svg'
import PubSubSVG from 'uiSrc/assets/img/sidebar/pubsub.svg'
import PubSubActiveSVG from 'uiSrc/assets/img/sidebar/pubsub_active.svg'
import PipelineManagementSVG from 'uiSrc/assets/img/sidebar/pipeline.svg'
import PipelineManagementActiveSVG from 'uiSrc/assets/img/sidebar/pipeline_active.svg'
import PipelineStatisticsSvg from 'uiSrc/assets/img/sidebar/pipeline_statistics.svg'
import PipelineStatisticsActiveSvg from 'uiSrc/assets/img/sidebar/pipeline_statistics_active.svg'
import GithubSVG from 'uiSrc/assets/img/sidebar/github.svg'
import Divider from 'uiSrc/components/divider/Divider'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { FeatureFlagComponent } from 'uiSrc/components'

import { appContextSelector } from 'uiSrc/slices/app/context'
import { AppWorkspace } from 'uiSrc/slices/interfaces'
import CreateCloud from './components/create-cloud'
import HelpMenu from './components/help-menu/HelpMenu'
import NotificationMenu from './components/notifications-center'

import { RedisLogo } from './components/redis-logo/RedisLogo'
import styles from './styles.module.scss'

const pubSubPath = `/${PageNames.pubSub}`

interface INavigations {
  isActivePage: boolean
  isBeta?: boolean
  pageName: string
  tooltipText: string
  ariaLabel: string
  dataTestId: string
  connectedInstanceId?: string
  onClick: () => void
  getClassName: () => string
  getIconType: () => string
  onboard?: any
  featureFlag?: FeatureFlags
}

const NavigationMenu = () => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const [activePage, setActivePage] = useState(Pages.home)

  const { workspace } = useSelector(appContextSelector)
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
  const { id: connectedRdiInstanceId = '' } = useSelector(connectedRdiInstanceSelector)
  const highlightedPages = useSelector(appFeaturePagesHighlightingSelector)
  const {
    [FeatureFlags.envDependent]: envDependentFeature
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const isRdiWorkspace = workspace === AppWorkspace.RDI

  useEffect(() => {
    setActivePage(`/${last(location.pathname.split('/'))}`)
  }, [location])

  const handleGoPage = (page: string) => history.push(page)

  const isAnalyticsPath = (activePage: string) => !!ANALYTICS_ROUTES.find(
    ({ path }) => (`/${last(path.split('/'))}` === activePage)
  )

  const isPipelineManagementPath = () =>
    location.pathname?.startsWith(Pages.rdiPipelineManagement(connectedRdiInstanceId))

  const getAdditionPropsForHighlighting = (pageName: string): Omit<HighlightedFeatureProps, 'children'> => {
    if (BUILD_FEATURES[pageName]?.asPageFeature) {
      return ({
        hideFirstChild: true,
        onClick: () => dispatch(removeFeatureFromHighlighting(pageName)),
        ...BUILD_FEATURES[pageName]
      })
    }

    return {}
  }

  const navigationButtonStyle = {
    [styles.navigationButton]: true,
    [styles.navigationButtonAlt]: !envDependentFeature?.flag
  }

  const privateRoutes: INavigations[] = [
    {
      tooltipText: 'Browser',
      pageName: PageNames.browser,
      isActivePage: activePage === `/${PageNames.browser}`,
      ariaLabel: 'Browser page button',
      onClick: () => handleGoPage(Pages.browser(connectedInstanceId)),
      dataTestId: 'browser-page-btn',
      connectedInstanceId,
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? BrowserSVG : BrowserActiveSVG
      },
      onboard: ONBOARDING_FEATURES.BROWSER_PAGE
    },
    {
      tooltipText: 'Workbench',
      pageName: PageNames.workbench,
      ariaLabel: 'Workbench page button',
      onClick: () => handleGoPage(Pages.workbench(connectedInstanceId)),
      dataTestId: 'workbench-page-btn',
      connectedInstanceId,
      isActivePage: activePage === `/${PageNames.workbench}`,
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? WorkbenchSVG : WorkbenchActiveSVG
      },
      onboard: ONBOARDING_FEATURES.WORKBENCH_PAGE
    },
    {
      tooltipText: 'Analysis Tools',
      pageName: PageNames.analytics,
      ariaLabel: 'Analysis Tools',
      onClick: () => handleGoPage(Pages.analytics(connectedInstanceId)),
      dataTestId: 'analytics-page-btn',
      connectedInstanceId,
      isActivePage: isAnalyticsPath(activePage),
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? SlowLogActiveSVG : SlowLogSVG
      },
      featureFlag: FeatureFlags.envDependent,
    },
    {
      tooltipText: 'Pub/Sub',
      pageName: PageNames.pubSub,
      ariaLabel: 'Pub/Sub page button',
      onClick: () => handleGoPage(Pages.pubSub(connectedInstanceId)),
      dataTestId: 'pub-sub-page-btn',
      connectedInstanceId,
      isActivePage: activePage === pubSubPath,
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? PubSubActiveSVG : PubSubSVG
      },
      onboard: ONBOARDING_FEATURES.PUB_SUB_PAGE,
      featureFlag: FeatureFlags.envDependent,
    },
  ]

  const privateRdiRoutes: INavigations[] = [
    {
      tooltipText: 'Pipeline Status',
      pageName: PageNames.rdiStatistics,
      ariaLabel: 'Pipeline Status page button',
      onClick: () => handleGoPage(Pages.rdiStatistics(connectedRdiInstanceId)),
      dataTestId: 'pipeline-status-page-btn',
      isActivePage: activePage === `/${PageNames.rdiStatistics}`,
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? PipelineStatisticsActiveSvg : PipelineStatisticsSvg
      },
    },
    {
      tooltipText: 'Pipeline Management',
      pageName: PageNames.rdiPipelineManagement,
      ariaLabel: 'Pipeline Management page button',
      onClick: () => handleGoPage(Pages.rdiPipelineManagement(connectedRdiInstanceId)),
      dataTestId: 'pipeline-management-page-btn',
      isActivePage: isPipelineManagementPath(),
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? PipelineManagementActiveSVG : PipelineManagementSVG
      },
    },
  ]

  const publicRoutes: INavigations[] = [
    {
      tooltipText: 'Settings',
      pageName: PageNames.settings,
      ariaLabel: 'Settings page button',
      onClick: () => handleGoPage(Pages.settings),
      dataTestId: 'settings-page-btn',
      isActivePage: activePage === Pages.settings,
      getClassName() {
        return cx(navigationButtonStyle, { [styles.active]: this.isActivePage })
      },
      getIconType() {
        return this.isActivePage ? SettingsActiveSVG : SettingsSVG
      },
      featureFlag: FeatureFlags.envDependent,
    },
  ]

  const renderNavItem = (nav: INavigations) => {
    const fragment = (
      <React.Fragment key={nav.tooltipText}>
        {renderOnboardingTourWithChild(
          (
            <HighlightedFeature
              {...getAdditionPropsForHighlighting(nav.pageName)}
              key={nav.tooltipText}
              isHighlight={!!highlightedPages[nav.pageName]?.length}
              dotClassName={cx(styles.highlightDot, { [styles.activePage]: nav.isActivePage })}
              tooltipPosition="right"
              transformOnHover
            >
              <EuiToolTip content={nav.tooltipText} position="right">
                <div className={styles.navigationButtonWrapper}>
                  <EuiButtonIcon
                    className={nav.getClassName()}
                    iconType={nav.getIconType()}
                    aria-label={nav.ariaLabel}
                    onClick={nav.onClick}
                    data-testid={nav.dataTestId}
                  />
                  {nav.isBeta && (<EuiBadge className={styles.betaLabel}>BETA</EuiBadge>)}
                </div>
              </EuiToolTip>
            </HighlightedFeature>
          ),
          { options: nav.onboard },
          nav.isActivePage
        )}
      </React.Fragment>
    )

    return nav.featureFlag
      ? (
        <FeatureFlagComponent
          name={nav.featureFlag}
          key={nav.tooltipText}
          enabledByDefault
        >
          {fragment}
        </FeatureFlagComponent>
      )
      : fragment
  }

  const renderPublicNavItem = (nav: INavigations) => {
    const fragment = (
      <HighlightedFeature
        key={nav.tooltipText}
        isHighlight={!!highlightedPages[nav.pageName]?.length}
        dotClassName={cx(styles.highlightDot, { [styles.activePage]: nav.isActivePage })}
        transformOnHover
      >
        <EuiToolTip content={nav.tooltipText} position="right">
          <EuiButtonIcon
            className={nav.getClassName()}
            iconType={nav.getIconType()}
            aria-label={nav.ariaLabel}
            onClick={nav.onClick}
            data-testid={nav.dataTestId}
          />
        </EuiToolTip>
      </HighlightedFeature>
    )

    return nav.featureFlag
      ? (
        <FeatureFlagComponent
          name={nav.featureFlag}
          key={nav.tooltipText}
          enabledByDefault
        >
          {fragment}
        </FeatureFlagComponent>
      )
      : fragment
  }

  return (
    <EuiPageSideBar aria-label="Main navigation" className={cx(styles.navigation, 'eui-yScroll')}>
      <div className={styles.container}>
        <RedisLogo isRdiWorkspace={isRdiWorkspace} />
        {connectedInstanceId && !isRdiWorkspace && (privateRoutes.map(renderNavItem))}
        {connectedRdiInstanceId && isRdiWorkspace && (privateRdiRoutes.map(renderNavItem))}
      </div>
      <div className={styles.bottomContainer}>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <CreateCloud />
          <NotificationMenu />
        </FeatureFlagComponent>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <HelpMenu />
        </FeatureFlagComponent>
        {publicRoutes.map(renderPublicNavItem)}
        <FeatureFlagComponent
          name={FeatureFlags.envDependent}
          otherwise={(
            <Divider
              color="transparent"
              className="eui-hideFor--xs eui-hideFor--s"
              variant="middle"
              data-testid="github-repo-divider-otherwise"
            />
          )}
          enabledByDefault
        >
          <Divider data-testid="github-repo-divider-default" colorVariable="separatorNavigationColor" className="eui-hideFor--xs eui-hideFor--s" variant="middle" />
        </FeatureFlagComponent>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <Divider
            colorVariable="separatorNavigationColor"
            className="eui-showFor--xs--flex eui-showFor--s--flex"
            variant="middle"
            orientation="vertical"
          />
          <EuiToolTip
            content="Star us on GitHub"
            position="right"
          >
            <span className={cx(styles.iconNavItem, styles.githubLink)}>
              <EuiLink
                external={false}
                href={EXTERNAL_LINKS.githubRepo}
                target="_blank"
                data-test-subj="github-repo-btn"
              >
                <EuiIcon
                  className={styles.githubIcon}
                  aria-label="redis insight github repository"
                  type={GithubSVG}
                  data-testid="github-repo-icon"
                />
              </EuiLink>
            </span>
          </EuiToolTip>
        </FeatureFlagComponent>
      </div>
    </EuiPageSideBar>
  )
}

export default NavigationMenu
