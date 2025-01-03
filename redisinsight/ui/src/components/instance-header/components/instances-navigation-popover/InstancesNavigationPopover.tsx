import React, { ChangeEvent, useEffect, useState } from 'react'
import { EuiFieldText, EuiIcon, EuiListGroup, EuiListGroupItem, EuiPopover, EuiSpacer, EuiTab, EuiTabs, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { checkConnectToRdiInstanceAction, instancesSelector as rdiInstancesSelector } from 'uiSrc/slices/rdi/instances'
import { checkConnectToInstanceAction, instancesSelector as dbInstancesSelector, setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import Divider from 'uiSrc/components/divider/Divider'
import { Pages } from 'uiSrc/constants'
import { resetRdiContext, setAppContextInitialState, setAppContextConnectedRdiInstanceId } from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { resetRedisearchKeysData } from 'uiSrc/slices/browser/redisearch'
import { resetCliHelperSettings, resetCliSettingsAction } from 'uiSrc/slices/cli/cli-settings'
import Down from 'uiSrc/assets/img/Down.svg?react'
import Search from 'uiSrc/assets/img/Search.svg'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  name: string
}

export enum InstancesTabs {
  Databases = 'Databases',
  RDI = 'Redis Data Integration'
}

const InstancesNavigationPopover = ({ name }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [filteredDbInstances, setFilteredDbInstances] = useState<Instance[]>([])
  const [filteredRdiInstances, setFilteredRdiInstances] = useState<RdiInstance[]>([])

  const { instanceId, rdiInstanceId } = useParams<{ instanceId: string, rdiInstanceId: string }>()
  const [selectedTab, setSelectedTab] = useState(rdiInstanceId ? InstancesTabs.RDI : InstancesTabs.Databases)

  const { data: rdiInstances, connectedInstance: connectedRdiInstance } = useSelector(rdiInstancesSelector)
  const { data: dbInstances, connectedInstance: connectedDbInstance } = useSelector(dbInstancesSelector)
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    const dbFiltered = dbInstances?.filter((db) => db.name?.toLowerCase?.().includes(searchFilter))
    const rdiFiltered = rdiInstances?.filter((rdi) => rdi.name?.toLowerCase?.().includes(searchFilter))
    setFilteredDbInstances(dbFiltered)
    setFilteredRdiInstances(rdiFiltered)
  }, [dbInstances, rdiInstances, searchFilter])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchFilter(value)
  }

  const showPopover = () => {
    if (!isPopoverOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.NAVIGATION_PANEL_OPENED,
        eventData: {
          databaseId: instanceId || rdiInstanceId,
          numOfRedisDbs: dbInstances?.length || 0,
          numOfRdiDbs: rdiInstances?.length || 0,
        }
      })
    }
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  }

  const connectToInstance = (id = '') => {
    // reset rdi context
    dispatch(resetRdiContext())

    dispatch(resetKeys())
    dispatch(resetRedisearchKeysData())
    dispatch(resetCliSettingsAction())
    dispatch(resetCliHelperSettings())
    dispatch(setAppContextInitialState())

    dispatch(setConnectedInstanceId(id))

    history.push(Pages.browser(id))
  }

  const btnLabel = selectedTab === InstancesTabs.Databases ? 'All Databases' : 'All RDIs'

  const goHome = () => {
    history.push(selectedTab === InstancesTabs.Databases ? Pages.home : Pages.rdi)
  }
  const renderInstances = () => {
    const instances = selectedTab === InstancesTabs.Databases ? filteredDbInstances : filteredRdiInstances

    const goToInstance = (instance: Instance) => {
      if (connectedDbInstance?.id === instance.id) {
        // already connected so do nothing
        return
      }
      const modulesSummary = getRedisModulesSummary(instance.modules)
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
        eventData: {
          databaseId: instance.id,
          source: 'navigation_panel',
          provider: instance.provider,
          ...modulesSummary,
        }
      })
      dispatch(checkConnectToInstanceAction(instance.id, connectToInstance, () => {}, false))
    }

    const goToRdiInstance = (instance: RdiInstance) => {
      if (connectedRdiInstance?.id === instance.id) {
        // already connected so do nothing
        return
      }
      dispatch(checkConnectToRdiInstanceAction(
        instance.id,
        (id: string) => history.push(Pages.rdiPipeline(id)),
        () => dispatch(setAppContextConnectedRdiInstanceId(''))
      ))
    }

    const goToPage = (instance: Instance | RdiInstance) => {
      if (selectedTab === InstancesTabs.Databases) {
        goToInstance(instance as Instance)
      } else {
        goToRdiInstance(instance as RdiInstance)
      }
    }

    return (
      <div className={styles.listContainer}>
        <EuiListGroup flush maxWidth="none" gutterSize="none">
          {instances?.map((instance) => (
            <EuiListGroupItem
              className={styles.item}
              key={instance.id}
              label={instance.name}
              onClick={() => goToPage(instance)}
            />
          ))}
        </EuiListGroup>
      </div>
    )
  }

  return (
    <EuiPopover
      ownFocus
      anchorPosition="downRight"
      panelPaddingSize="none"
      isOpen={isPopoverOpen}
      closePopover={() => showPopover()}
      button={(
        <EuiText
          className={styles.showPopoverBtn}
          onClick={() => showPopover()}
          data-testid="nav-instance-popover-btn"
        >
          <b className={styles.breadCrumbLink}>{name}</b>
          <span>
            <EuiIcon
              color="primaryText"
              type={Down}
            />
          </span>
        </EuiText>
        )}
    >
      <div className={styles.wrapper}>
        <div className={styles.searchInputContainer}>
          <EuiFieldText
            fullWidth
            className={styles.searchInput}
            icon={Search}
            value={searchFilter}
            onChange={(e) => handleSearch(e)}
            data-testid="instances-nav-popover-search"
          />
        </div>
        <div>
          <div className={styles.tabsContainer}>
            <EuiTabs
              className={cx('tabs-active-borders', styles.tabs)}
              data-testid="instances-tabs-testId"
            >
              <EuiTab
                className={styles.tab}
                isSelected={selectedTab === InstancesTabs.Databases}
                onClick={() => setSelectedTab(InstancesTabs.Databases)}
                data-testid={`${InstancesTabs.Databases}-tab-id`}
              >{InstancesTabs.Databases} ({dbInstances?.length || 0})
              </EuiTab>

              <EuiTab
                className={styles.tab}
                isSelected={selectedTab === InstancesTabs.RDI}
                onClick={() => setSelectedTab(InstancesTabs.RDI)}
                data-testid={`${InstancesTabs.RDI}-tab-id`}
              >{InstancesTabs.RDI} ({rdiInstances?.length || 0})
              </EuiTab>
            </EuiTabs>
          </div>
          <EuiSpacer size="m" />
          {renderInstances()}
          <div>
            <EuiSpacer size="m" />
            <Divider />
            <div className={styles.footerContainer}>
              <EuiText
                className={styles.homePageLink}
                onClick={goHome}
              >{btnLabel}
              </EuiText>
            </div>
          </div>
        </div>
      </div>
    </EuiPopover>
  )
}

export default InstancesNavigationPopover
