import React, { useState } from 'react'
import { EuiContextMenuItem, EuiContextMenuPanel, EuiIcon, EuiInputPopover, EuiLink, EuiText, } from '@elastic/eui'

import { IHelpGuide } from 'uiSrc/pages/home/constants/help-links'

import styles from './styles.module.scss'

interface IProps {
  onLinkClick?: (link: string) => void
  items: IHelpGuide[]
}

const HelpLinksMenu = ({ onLinkClick, items }: IProps) => {
  const [isPopoverOpen, setPopover] = useState(false)

  const onButtonClick = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const handleLinkClick = (link: string) => {
    closePopover()
    if (onLinkClick) {
      onLinkClick(link)
    }
  }

  const menuItems = items.map(({ id, url, title, primary }) => (
    <EuiContextMenuItem className={styles.item} key={id}>
      <EuiLink
        external={false}
        href={url}
        target="_blank"
        onClick={() => handleLinkClick(id)}
      >
        <EuiText style={{ fontWeight: primary ? 500 : 400 }}>
          {title}
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
      style={{ width: '245px' }}
      display="block"
      id="databasesMenu"
      input={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      panelClassName={styles.popover}
    >
      <EuiContextMenuPanel size="s" items={menuItems} />
    </EuiInputPopover>
  )
}

export default HelpLinksMenu
