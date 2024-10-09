import React, { useState } from 'react'
import { EuiIcon, EuiLink, EuiPopover, EuiText } from '@elastic/eui'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import styles from './styles.module.scss'

const ClickableAppendInfo = () => {
  const [open, setOpen] = useState<boolean>(false)

  const onClick = () => {
    const newVal = !open
    setOpen(newVal)
  }

  return (
    <EuiPopover
      id="showPupSubExamples"
      ownFocus={false}
      button={(
        <EuiIcon
          size="l"
          type="iInCircle"
          style={{ cursor: 'pointer' }}
          onClick={onClick}
          data-testid="append-info-icon"
        />
    )}
      isOpen={open}
      closePopover={() => setOpen(false)}
      panelClassName={styles.popover}
      anchorClassName={styles.infoIcon}
      panelPaddingSize="s"
      data-testid="pub-sub-examples"
    >
      <EuiText
        color="subdued"
        size="s"
      >
        Subscribe to one or more channels or patterns by entering them, separated by spaces.
        <br />
        Supported glob-style patterns are described&nbsp;
        <EuiLink
          external={false}
          target="_blank"
          href={getUtmExternalLink(EXTERNAL_LINKS.pubSub, {
            medium: UTM_MEDIUMS.Main,
            campaign: UTM_CAMPAINGS.PubSub,
          })}
        >here.
        </EuiLink>
      </EuiText>
    </EuiPopover>
  )
}

export default ClickableAppendInfo
