import React, { useState } from 'react'
import { EuiIcon, EuiLink, EuiPopover } from '@elastic/eui'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Text } from 'uiSrc/components/base/text'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
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
      button={
        <EuiIcon
          size="l"
          type="iInCircle"
          style={{ cursor: 'pointer' }}
          onClick={onClick}
          data-testid="append-info-icon"
        />
      }
      isOpen={open}
      closePopover={() => setOpen(false)}
      panelClassName={styles.popover}
      anchorClassName={styles.infoIcon}
      panelPaddingSize="s"
      data-testid="pub-sub-examples"
    >
      <Text color="subdued" size="s">
        Subscribe to one or more channels or patterns by entering them,
        separated by spaces.
        <br />
        Supported glob-style patterns are described&nbsp;
        <EuiLink
          external={false}
          target="_blank"
          href={getUtmExternalLink(EXTERNAL_LINKS.pubSub, {
            medium: UTM_MEDIUMS.Main,
            campaign: UTM_CAMPAINGS.PubSub,
          })}
        >
          here.
        </EuiLink>
      </Text>
    </EuiPopover>
  )
}

export default ClickableAppendInfo
