import React, { useState } from 'react'
import { EuiContextMenuItem, EuiContextMenuPanel, EuiIcon, EuiInputPopover, EuiLink, EuiText, } from '@elastic/eui'
import { HELP_LINKS, HelpLink } from 'uiSrc/pages/home/constants/help-links'

import styles from './styles.module.scss'

interface IProps {
  onLinkClick: (link: HelpLink) => void;
}

const HelpLinksMenu = ({ onLinkClick }: IProps) => {
  const [isPopoverOpen, setPopover] = useState(false)

  const onButtonClick = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const handleLinkClick = (link: keyof typeof HelpLink) => {
    closePopover()
    onLinkClick(HelpLink[link])
  }

  const items = (Object.keys(HelpLink) as Array<keyof typeof HelpLink>).map((item) => (
    <EuiContextMenuItem className={styles.item} key={item}>
      <EuiLink
        external={false}
        href={HELP_LINKS[HelpLink[item]].link}
        target="_blank"
        onClick={() => handleLinkClick(item)}
      >
        <EuiText
          style={item === 'CreateRedisCloud' ? { fontWeight: 'bold' } : {}}
        >
          {HELP_LINKS[HelpLink[item]].label}
        </EuiText>
      </EuiLink>
    </EuiContextMenuItem>
  ))

  const button = (
    <button
      type="button"
      onClick={onButtonClick}
      className={[styles.button, isPopoverOpen ? styles.buttonOpen : ''].join(' ')}
    >
      <EuiText size="m">CREATE DATABASE</EuiText>
      <EuiIcon type="arrowDown" className={styles.arrowIcon} />
    </button>
  )

  return (
    <EuiInputPopover
      style={{ minWidth: '244px' }}
      display="block"
      id="databasesMenu"
      input={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      panelClassName={styles.popover}
    >
      <EuiContextMenuPanel size="s" items={items} />
    </EuiInputPopover>
  )
}

export default HelpLinksMenu
