import React, { ChangeEvent, useEffect, useState } from 'react'
import { EuiFieldText, EuiIcon, EuiPopover, EuiSpacer, EuiTab, EuiTabs, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { orderBy } from 'lodash'
import { instancesSelector as rdiInstancesSelector } from 'uiSrc/slices/rdi/instances'
import { instancesSelector as dbInstancesSelector } from 'uiSrc/slices/instances/instances'
import Divider from 'uiSrc/components/divider/Divider'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import Down from 'uiSrc/assets/img/Down.svg?react'
import Search from 'uiSrc/assets/img/Search.svg'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { getDbIndex } from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
import InstancesList from './components/instances-list'
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

  const { data: rdiInstances } = useSelector(rdiInstancesSelector)
  const { data: dbInstances } = useSelector(dbInstancesSelector)
  const history = useHistory()

  useEffect(() => {
    const filterAndSort = (
      arr: Instance[] | RdiInstance[],
      search: string,
      sort: { field: string, direction: 'asc' | 'desc' }
    ): (Instance | RdiInstance
      )[] => {
      if (!arr?.length) return arr
      const filtered = arr.filter((instance) => {
        const label = `${instance.name} ${getDbIndex(instance.db)}`
        return label.toLowerCase?.().includes(search)
      })

      const sortingFunc = (ins) => {
        if (sort.field === 'lastConnection') {
          return ins.lastConnection ? -new Date(`${ins.lastConnection}`) : -Infinity
        }
        if (sort.field === 'host') {
          return `${ins.host}:${ins.port}`
        }
        return sort.field
      }

      return orderBy(
        filtered,
        sortingFunc,
        sort.direction
      )
    }

    const dbSort = localStorageService.get(BrowserStorageItem.instancesSorting) ?? {
      field: 'lastConnection',
      direction: 'asc'
    }

    const dbFiltered = filterAndSort(dbInstances, searchFilter, dbSort)

    const rdiSort = localStorageService.get(BrowserStorageItem.rdiInstancesSorting) ?? {
      field: 'lastConnection',
      direction: 'asc'
    }

    const rdiFiltered = filterAndSort(rdiInstances, searchFilter, rdiSort)
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

  const btnLabel = selectedTab === InstancesTabs.Databases ? 'Redis Databases page' : 'Redis Data Integration page'

  const goHome = () => {
    history.push(selectedTab === InstancesTabs.Databases ? Pages.home : Pages.rdi)
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
          <InstancesList
            selectedTab={selectedTab}
            filteredDbInstances={filteredDbInstances}
            filteredRdiInstances={filteredRdiInstances}
          />
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
