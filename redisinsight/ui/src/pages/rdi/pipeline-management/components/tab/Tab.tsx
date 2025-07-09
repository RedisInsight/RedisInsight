import React from 'react'
import cx from 'classnames'
import { EuiIcon } from '@elastic/eui'

import statusErrorIcon from 'uiSrc/assets/img/rdi/pipelineStatuses/status_error.svg?react'
import { Text } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'

import styles from './styles.module.scss'

export interface IProps {
  title: string | JSX.Element
  isSelected: boolean
  className?: string
  fileName?: string
  children?: React.ReactElement | string
  testID?: string
  isLoading?: boolean
  isValid?: boolean
}

const Tab = (props: IProps) => {
  const {
    title,
    isSelected,
    children,
    fileName,
    testID,
    className,
    isLoading = false,
    isValid = true,
  } = props

  return (
    <div
      className={cx(styles.wrapper, className, { [styles.active]: isSelected })}
      data-testid={testID}
    >
      <Text className="rdi-pipeline-nav__title" size="m">
        {title}
      </Text>
      {fileName ? (
        <div className="rdi-pipeline-nav__file">
          <EuiIcon type="document" className="rdi-pipeline-nav__fileIcon" />
          <Text className={cx('rdi-pipeline-nav__text', { invalid: !isValid })}>
            {fileName}
          </Text>

          {!isValid && (
            <EuiIcon
              type={statusErrorIcon}
              className="rdi-pipeline-nav__error"
              data-testid="rdi-nav-config-error"
            />
          )}

          {isLoading && (
            <Loader
              data-testid="rdi-nav-config-loader"
              className={styles.loader}
            />
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export default Tab
