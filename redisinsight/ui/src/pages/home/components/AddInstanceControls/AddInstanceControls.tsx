import React from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
} from '@elastic/eui'
import cx from 'classnames'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import HelpLinksMenu from 'uiSrc/pages/home/components/HelpLinksMenu'
import { HELP_LINKS } from 'uiSrc/pages/home/constants/help-links'

import styles from './styles.module.scss'

const SHOW_FOR_XL = 'eui-showFor--xl'

export enum Direction {
  column = 'column',
  row = 'row',
}

interface Props {
  onAddInstance: () => void;
  direction: Direction;
}

const AddInstanceControls = ({ onAddInstance, direction }: Props) => {
  const handleOnAddDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
    })
    onAddInstance()
  }

  const handleClickLink = (event: TelemetryEvent) => {
    sendEventTelemetry({
      event,
    })
  }

  const AddInstanceBtn = () => (
    <EuiButton
      fill
      color="success"
      onClick={handleOnAddDatabase}
      className={styles.addInstanceBtn}
      data-testid="add-redis-database"
    >
      + ADD REDIS DATABASE
    </EuiButton>
  )

  const CreateBtn = () => (
    <a
      className={styles.createBtn}
      href={HELP_LINKS.createRedisCloud.link}
      target="_blank"
      rel="noreferrer"
      onClick={() => handleClickLink(HELP_LINKS.createRedisCloud.event)}
    >
      <EuiText className={styles.createTitle}>
        {HELP_LINKS.createRedisCloud.label}
      </EuiText>
      <EuiText className={styles.createText}>
        Free managed database up to 30MB, with modules support.
      </EuiText>
      <EuiIcon type="arrowRight" size="m" className={styles.arrowRight} />
    </a>
  )

  const Separator = () => <div className={styles.separator} />

  const FollowText = () => (
    <EuiText className={styles.followText}>Or follow the guides:</EuiText>
  )

  const LinkSourceText = () => (
    <div className={styles.sourceText}>
      <a
        href={HELP_LINKS.buildRedisFromSource.link}
        onClick={() => handleClickLink(HELP_LINKS.buildRedisFromSource.event)}
        target="_blank"
        rel="noreferrer"
      >
        {HELP_LINKS.buildRedisFromSource.label}
      </a>
    </div>
  )

  const LinkDockerText = () => (
    <div className={styles.dockerText}>
      <a
        href={HELP_LINKS.createOnDocker.link}
        onClick={() => handleClickLink(HELP_LINKS.createOnDocker.event)}
        target="_blank"
        rel="noreferrer"
      >
        {HELP_LINKS.createOnDocker.label}
      </a>
    </div>
  )

  const LinkHomebrewText = () => (
    <div className={styles.homebrewText}>
      <a
        href={HELP_LINKS.createOnMac.link}
        onClick={() => handleClickLink(HELP_LINKS.createOnMac.event)}
        target="_blank"
        rel="noreferrer"
      >
        {HELP_LINKS.createOnMac.label}
      </a>
    </div>
  )

  const WelcomeControls = () => (
    <div className={styles.containerWelc}>
      <EuiFlexGroup>
        <EuiFlexItem>
          <AddInstanceBtn />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <Separator />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <CreateBtn />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem className={styles.clearMarginFlexItem}>
          <FollowText />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup className={styles.links}>
        <EuiFlexItem>
          <LinkSourceText />
          <LinkDockerText />
          <LinkHomebrewText />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
    </div>
  )

  const DatalistControls = () => (
    <div className={styles.containerDl}>
      <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <AddInstanceBtn />
        </EuiFlexItem>
        <EuiFlexItem className="eui-hideFor--xs" grow={false}>
          <Separator />
        </EuiFlexItem>
        <EuiFlexItem grow className="eui-hideFor--xs eui-hideFor--s eui-hideFor--m eui-hideFor--l">
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <CreateBtn />
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={cx(styles.links, SHOW_FOR_XL)}>
              <FollowText />
              <LinkSourceText />
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={cx(styles.links, SHOW_FOR_XL)}>
              <LinkDockerText />
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={cx(styles.links, SHOW_FOR_XL)}>
              <LinkHomebrewText />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false} className="eui-showFor--xs eui-showFor--s eui-showFor--m eui-showFor--l">
          <HelpLinksMenu onLinkClick={(link) => handleClickLink(HELP_LINKS[link].event)} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer className={styles.spacerDl} />
    </div>
  )

  return direction === Direction.column ? (
    <WelcomeControls />
  ) : (
    <DatalistControls />
  )
}

export default AddInstanceControls
