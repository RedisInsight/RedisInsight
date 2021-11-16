import React, { useMemo } from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutHeader,
  EuiTitle,
  EuiText,
  EuiButtonIcon,
  EuiLoadingContent,
} from '@elastic/eui'
import JsxParser from 'react-jsx-parser'
import cx from 'classnames'

import {
  LazyCodeButton,
  Carousel,
  InternalLink,
  Image,
  EmptyPrompt
} from 'uiSrc/pages/workbench/components/enablament-area/EnablementArea/components'

import styles from './styles.module.scss'
import './styles.scss'

export interface Props {
  onClose: () => void;
  title: string;
  backTitle: string;
  content: string;
  isLoading?: boolean;
  error?: string;
}
const InternalPage = ({ onClose, title, backTitle, isLoading, error, content }: Props) => {
  const components: any = { LazyCodeButton, Carousel, InternalLink, Image }

  const contentComponent = useMemo(() => (
    <JsxParser
      components={components}
      autoCloseVoidElements
      jsx={content}
      onError={(e) => console.log(e)}
    />
  ), [content])

  return (
    <div className={styles.container} data-test-subj="internal-page">
      <EuiFlyoutHeader className={styles.header}>
        <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              data-testid="enablement-area__page-close"
              iconType="arrowLeft"
              onClick={onClose}
              aria-label="Back"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div>
              <EuiText size="s" color="subdued" style={{ fontWeight: 'normal' }}>{backTitle}</EuiText>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup style={{ padding: '0 8px' }} responsive={false} gutterSize="s" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle>
              <EuiText size="s" color="default" style={{ fontWeight: 'normal' }}>{title?.toUpperCase()}</EuiText>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <div className={cx(styles.content, 'enablement-area__page')}>
        { isLoading && <EuiLoadingContent data-testid="enablement-area__page-loader" lines={3} /> }
        { !isLoading && error && <EmptyPrompt /> }
        { !isLoading && !error && contentComponent }
      </div>
      <div className={styles.footer} id="internalPageFooter" />
    </div>
  )
}

export default InternalPage
