import React, { useContext } from 'react'
import { capitalize } from 'lodash'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'

import cx from 'classnames'
import { CONNECTION_TYPE_DISPLAY, ConnectionType, DATABASE_LIST_MODULES_TEXT } from 'uiSrc/slices/interfaces'
import { getModule, Nullable, truncateText } from 'uiSrc/utils'

import { ReactComponent as ConnectionIcon } from 'uiSrc/assets/img/icons/connection.svg'
import { ReactComponent as UserIcon } from 'uiSrc/assets/img/icons/user.svg'
import { ReactComponent as VersionIcon } from 'uiSrc/assets/img/icons/version.svg'
import MessageInfoIcon from 'uiSrc/assets/img/icons/help_illus.svg'

import { DEFAULT_MODULES_INFO } from 'uiSrc/constants/modules'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import UnknownDark from 'uiSrc/assets/img/modules/UnknownDark.svg'
import UnknownLight from 'uiSrc/assets/img/modules/UnknownLight.svg'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import styles from './styles.module.scss'

export interface Props {
  info: {
    name: string
    host: string
    port: string | number
    connectionType: ConnectionType
    version: string
    dbIndex: number
    user?: Nullable<string>
  }
  databases: number
  modules: AdditionalRedisModule[]
}
const ShortInstanceInfo = ({ info, databases, modules }: Props) => {
  const { name, host, port, connectionType, version, user } = info
  const { theme } = useContext(ThemeContext)

  const getIcon = (name: string) => {
    const icon = DEFAULT_MODULES_INFO[name]?.[theme === Theme.Dark ? 'iconDark' : 'iconLight']
    if (icon) {
      return icon
    }

    return theme === Theme.Dark ? UnknownDark : UnknownLight
  }

  return (
    <div data-testid="db-info-tooltip">
      <div className={styles.tooltipItem}>
        <b style={{ fontSize: 13 }}>{name}</b>
      </div>
      <div className={styles.tooltipItem}>
        <span>
          {host}
          :
          {port}
        </span>
      </div>
      {databases > 1 && (
        <EuiFlexGroup className={styles.dbIndexInfo} alignItems="center" gutterSize="none">
          <EuiFlexItem grow={false} style={{ marginRight: 16 }}>
            <EuiIcon className={styles.messageInfoIcon} size="xxl" type={MessageInfoIcon} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size="s">Logical Databases</EuiText>
            <EuiText color="subdued" size="xs">
              Select logical databases to work with in Browser, Workbench, and Database Analysis.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      <EuiFlexGroup
        className={styles.tooltipItem}
        gutterSize="none"
        alignItems="center"
        justifyContent="flexStart"
        responsive={false}
      >
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={ConnectionIcon} />
          <span className={styles.tooltipItemValue}>
            {connectionType ? CONNECTION_TYPE_DISPLAY[connectionType] : capitalize(connectionType)}
          </span>
        </EuiFlexItem>
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={VersionIcon} />
          <span className={styles.tooltipItemValue}>{version}</span>
        </EuiFlexItem>
        <EuiFlexItem className={styles.rowTooltipItem} grow={false}>
          <EuiIcon type={UserIcon} />
          <span className={styles.tooltipItemValue}>{user || 'Default'}</span>
        </EuiFlexItem>
      </EuiFlexGroup>
      {!!modules?.length && (
        <div className={styles.modules}>
          <h4 className={styles.mi_fieldName}>Database Modules</h4>
          {modules?.map(({ name = '', semanticVersion = '', version = '' }) => (
            <div
              key={name}
              className={cx(styles.mi_moduleName)}
              data-testid={`module_${name}`}
            >
              <EuiIcon type={getIcon(name)} className={styles.mi_icon} />
              <span>{truncateText(getModule(name)?.name || DATABASE_LIST_MODULES_TEXT[name] || name, 50)}</span>
              {!!(semanticVersion || version) && (
                <span className={styles.mi_version}>
                  v.
                  {semanticVersion || version}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShortInstanceInfo
