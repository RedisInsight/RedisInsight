import React, { useEffect } from 'react'
import { EuiButton, EuiPopover, EuiToolTip } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import TemplateForm from 'uiSrc/pages/rdi/pipeline-management/components/template-form'
import { fetchPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  isPopoverOpen: boolean
  setIsPopoverOpen: (value: boolean) => void
  value: string
  setFieldValue: (template: string) => void
  loading: boolean
  source: RdiPipelineTabs
}

const TemplatePopover = (props: Props) => {
  const { isPopoverOpen, setIsPopoverOpen, value, loading, setFieldValue, source } = props

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleOpen = () => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
    setIsPopoverOpen(true)
  }

  useEffect(() => {
    if (value) {
      setIsPopoverOpen(false)
    }
  }, [value])

  return (
    <EuiPopover
      ownFocus
      anchorPosition="downRight"
      isOpen={isPopoverOpen}
      closePopover={() => {}}
      className={styles.anchor}
      panelClassName={styles.popoverWrapper}
      button={(
        <EuiToolTip
          content={value ? 'Templates can be accessed only with the empty Editor to prevent potential data loss.' : null}
          position="top"
          display="inlineBlock"
          anchorClassName="flex-row"
        >
          <EuiButton
            fill
            size="s"
            color="secondary"
            className={styles.btn}
            aria-label="Insert template"
            disabled={!!value || loading}
            onClick={handleOpen}
            data-testid={`template-trigger-${source}`}
          >
            Insert template
          </EuiButton>
        </EuiToolTip>
      )}
    >
      <TemplateForm closePopover={() => setIsPopoverOpen(false)} setTemplate={setFieldValue} source={source} />
    </EuiPopover>
  )
}

export default TemplatePopover
