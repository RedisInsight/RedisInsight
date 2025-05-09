import React, { ReactNode } from 'react'
import { useHistory } from 'react-router-dom'
import { EuiBreadcrumbs, EuiToolTip } from '@elastic/eui'
import { EuiBreadcrumb } from '@elastic/eui/src/components/breadcrumbs/breadcrumbs'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from './styles.module.scss'

interface TooltipOption {
  label: string
  value: any
}

export interface Breadcrumb extends EuiBreadcrumb {
  text: string | ReactNode
  postfix?: string | ReactNode
  tooltipOptions?: TooltipOption[]
  href?: string
  'data-test-subject'?: string
}

interface Props {
  breadcrumbs: Breadcrumb[]
}

const PageBreadcrumbs = (props: Props) => {
  const { breadcrumbs } = props
  const history = useHistory()

  const modifiedBreadcrumbs: EuiBreadcrumb[] = breadcrumbs.map((breadcrumb) => {
    const { tooltipOptions, ...modifiedBreadcrumb }: Breadcrumb = {
      ...breadcrumb,
    }
    const { href, onClick, text = '', postfix = '' } = breadcrumb

    if (href && !onClick) {
      modifiedBreadcrumb.onClick = (e) => {
        e.preventDefault()
        history.push(href)
      }
    }

    modifiedBreadcrumb.text = (
      <EuiToolTip
        position="bottom"
        className={styles.tooltip}
        content={
          <>
            {tooltipOptions?.length
              ? tooltipOptions.map(({ label, value }) => (
                  <div key={label} className={styles.tooltipItem} title="">
                    <b>{label}</b>:
                    <span className={styles.tooltipItemValue}>{value}</span>
                  </div>
                ))
              : text}
          </>
        }
      >
        <>
          <span title="" className={styles.breadcrumbText}>
            {text}
          </span>
          {!!postfix && (
            <span title="" className={styles.breadcrumbPostfix}>
              {postfix}
            </span>
          )}
        </>
      </EuiToolTip>
    )

    return modifiedBreadcrumb
  })

  return (
    <div className={styles.breadcrumbsWrapper}>
      <EuiBreadcrumbs breadcrumbs={modifiedBreadcrumbs} truncate />
      <Spacer size="xs" />
    </div>
  )
}

export default PageBreadcrumbs
