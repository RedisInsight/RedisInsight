/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { last } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import HighlightedFeature, {
  Props as HighlightedFeatureProps,
} from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { ANALYTICS_ROUTES } from 'uiSrc/components/main-router/constants/sub-routes'

import { FeatureFlags, PageNames, Pages } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  appFeaturePagesHighlightingSelector,
  removeFeatureFromHighlighting,
} from 'uiSrc/slices/app/features'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { connectedInstanceSelector as connectedRdiInstanceSelector } from 'uiSrc/slices/rdi/instances'

import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { FeatureFlagComponent } from 'uiSrc/components'

import { appContextSelector } from 'uiSrc/slices/app/context'
import { AppWorkspace } from 'uiSrc/slices/interfaces'
import { IconType } from 'uiSrc/components/base/forms/buttons'
import {
  BrowserIcon,
  PipelineManagementIcon,
  PipelineStatisticsIcon,
  PubSubIcon,
  SlowLogIcon,
  WorkbenchIcon,
  GithubIcon,
  SettingsIcon,
} from 'uiSrc/components/base/icons'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import {
  SideBar,
  SideBarContainer,
  SideBarDivider,
  SideBarFooter,
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
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
  iconType: IconType
  onboard?: any
  featureFlag?: FeatureFlags
}

const NavigationMenu = () => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const [activePage, setActivePage] = useState(Pages.home)

  const { workspace } = useSelector(appContextSelector)
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )
  const { id: connectedRdiInstanceId = '' } = useSelector(
    connectedRdiInstanceSelector,
  )
  const highlightedPages = useSelector(appFeaturePagesHighlightingSelector)

  const isRdiWorkspace = workspace === AppWorkspace.RDI

  useEffect(() => {
    setActivePage(`/${last(location.pathname.split('/'))}`)
  }, [location])

  const handleGoPage = (page: string) => history.push(page)

  const isAnalyticsPath = (activePage: string) =>
    !!ANALYTICS_ROUTES.find(
      ({ path }) => `/${last(path.split('/'))}` === activePage,
    )

  const isPipelineManagementPath = () =>
    location.pathname?.startsWith(
      Pages.rdiPipelineManagement(connectedRdiInstanceId),
    )

  const getAdditionPropsForHighlighting = (
    pageName: string,
  ): Omit<HighlightedFeatureProps, 'children'> => {
    if (BUILD_FEATURES[pageName]?.asPageFeature) {
      return {
        hideFirstChild: true,
        onClick: () => dispatch(removeFeatureFromHighlighting(pageName)),
        ...BUILD_FEATURES[pageName],
      }
    }

    return {}
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
      iconType: BrowserIcon,
      onboard: ONBOARDING_FEATURES.BROWSER_PAGE,
    },
    {
      tooltipText: 'Workbench',
      pageName: PageNames.workbench,
      ariaLabel: 'Workbench page button',
      onClick: () => handleGoPage(Pages.workbench(connectedInstanceId)),
      dataTestId: 'workbench-page-btn',
      connectedInstanceId,
      isActivePage: activePage === `/${PageNames.workbench}`,
      iconType: WorkbenchIcon,
      onboard: ONBOARDING_FEATURES.WORKBENCH_PAGE,
    },
    {
      tooltipText: 'Analysis Tools',
      pageName: PageNames.analytics,
      ariaLabel: 'Analysis Tools',
      onClick: () => handleGoPage(Pages.analytics(connectedInstanceId)),
      dataTestId: 'analytics-page-btn',
      connectedInstanceId,
      isActivePage: isAnalyticsPath(activePage),
      iconType: SlowLogIcon,
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
      iconType: PubSubIcon,
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
      iconType: PipelineStatisticsIcon,
    },
    {
      tooltipText: 'Pipeline Management',
      pageName: PageNames.rdiPipelineManagement,
      ariaLabel: 'Pipeline Management page button',
      onClick: () =>
        handleGoPage(Pages.rdiPipelineManagement(connectedRdiInstanceId)),
      dataTestId: 'pipeline-management-page-btn',
      isActivePage: isPipelineManagementPath(),
      iconType: PipelineManagementIcon,
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
      iconType: SettingsIcon,
      featureFlag: FeatureFlags.envDependent,
    },
  ]

  const renderNavItem = (nav: INavigations) => {
    const fragment = (
      <React.Fragment key={nav.tooltipText}>
        {renderOnboardingTourWithChild(
          <HighlightedFeature
            {...getAdditionPropsForHighlighting(nav.pageName)}
            key={nav.tooltipText}
            isHighlight={!!highlightedPages[nav.pageName]?.length}
            dotClassName={styles.highlightDot}
            tooltipPosition="right"
            transformOnHover
          >
            <div className={styles.navigationButtonWrapper}>
              <SideBarItem
                isActive={nav.isActivePage}
                onClick={nav.onClick}
                tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
              >
                <SideBarItemIcon
                  icon={nav.iconType}
                  aria-label={nav.ariaLabel}
                  data-testid={nav.dataTestId}
                />
              </SideBarItem>
              {nav.isBeta && (
                <RiBadge className={styles.betaLabel} label="BETA" />
              )}
            </div>
          </HighlightedFeature >,
          { options: nav.onboard },
          nav.isActivePage,
        )}
      </React.Fragment >
    )

    return nav.featureFlag ? (
      <FeatureFlagComponent
        name={nav.featureFlag}
        key={nav.tooltipText}
        enabledByDefault
      >
        {fragment}
      </FeatureFlagComponent>
    ) : (
      fragment
    )
  }

  const renderPublicNavItem = (nav: INavigations) => {
    const fragment = (
      <HighlightedFeature
        key={nav.tooltipText}
        isHighlight={!!highlightedPages[nav.pageName]?.length}
        dotClassName={styles.highlightDot}
        transformOnHover
      >
        <SideBarItem
          tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
          onClick={nav.onClick}
          isActive={nav.isActivePage}
          className={styles.sideBarItem}
        >
          <SideBarItemIcon
            icon={nav.iconType}
            aria-label={nav.ariaLabel}
            data-testid={nav.dataTestId}
          />
        </SideBarItem>
      </HighlightedFeature >
    )

    return nav.featureFlag ? (
      <FeatureFlagComponent
        name={nav.featureFlag}
        key={nav.tooltipText}
        enabledByDefault
      >
        {fragment}
      </FeatureFlagComponent>
    ) : (
      fragment
    )
  }

  return (
    <SideBar
      isExpanded={false}
      aria-label="Main navigation"
      data-testid="main-navigation-sidebar"
      className={styles.mainNavbar}
    >
      <SideBarContainer>
        <RedisLogo isRdiWorkspace={isRdiWorkspace} />
        {connectedInstanceId &&
          !isRdiWorkspace &&
          privateRoutes.map(renderNavItem)}
        {connectedRdiInstanceId &&
          isRdiWorkspace &&
          privateRdiRoutes.map(renderNavItem)}
      </SideBarContainer>
      <SideBarFooter className={styles.footer}>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <CreateCloud />
          <NotificationMenu />
        </FeatureFlagComponent>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <HelpMenu />
        </FeatureFlagComponent>

        {publicRoutes.map(renderPublicNavItem)}

        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <SideBarDivider data-testid="github-repo-divider-default" />
          <SideBarFooter.Link
            data-testid="github-repo-btn"
            href={EXTERNAL_LINKS.githubRepo}
            target="_blank"
          >
            <SideBarItem
              className={styles.githubNavItem}
              tooltipProps={{ text: 'Star us on GitHub', placement: 'right' }}
            >
              <SideBarItemIcon
                icon={GithubIcon}
                aria-label="github-repo-icon"
                data-testid="github-repo-icon"
              />
            </SideBarItem>
          </SideBarFooter.Link>
        </FeatureFlagComponent>
      </SideBarFooter>
    </SideBar>
  )
}

export default NavigationMenu
