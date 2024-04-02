import React from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface Props {
  importBtn?: JSX.Element
  addBtn?: JSX.Element
  searchComponent?: JSX.Element
  promoComponent?: JSX.Element
}

const HomePageHeader = (props: Props) => {
  const { importBtn, addBtn, searchComponent, promoComponent } = props

  return (
    <>
      <div className={styles.containerDl}>
        <EuiFlexGroup className={styles.contentDL} alignItems="center" responsive={false} gutterSize="s">
          {!!addBtn && (
            <EuiFlexItem data-testid="addBtn-wrapper" className={styles.addInstanceBtn} grow={false}>
              {addBtn}
            </EuiFlexItem>
          )}
          {!!importBtn && (
            <EuiFlexItem
              grow={false}
              className={cx(styles.importDatabasesBtn, 'homePageImportBtn')}
              data-testid="importBtn-wrapper"
            >
              {importBtn}
            </EuiFlexItem>
          )}
          {!!promoComponent && (
            <EuiFlexItem grow={false} data-testid="promoComponent-wrapper">
              {promoComponent}
            </EuiFlexItem>
          )}
          {!!searchComponent && (
            <EuiFlexItem
              grow={false}
              className={cx(styles.searchContainer, 'homePageSearch')}
              data-testid="searchComponent-wrapper"
            >
              {searchComponent}
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer className={styles.spacerDl} />
      </div>
    </>
  )
}

export default HomePageHeader
