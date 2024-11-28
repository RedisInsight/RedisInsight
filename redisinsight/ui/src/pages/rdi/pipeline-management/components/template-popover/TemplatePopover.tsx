import React from 'react'
import { EuiButton, EuiPopover, EuiOutsideClickDetector } from '@elastic/eui'
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

  const handleClose = () => {
    setIsPopoverOpen(false)
  }

  return (
    <EuiOutsideClickDetector onOutsideClick={handleClose}>
      <EuiPopover
        ownFocus
        anchorPosition="downRight"
        isOpen={isPopoverOpen}
        closePopover={handleClose}
        className={styles.anchor}
        panelClassName={styles.popoverWrapper}
        button={(
          <EuiButton
            fill
            size="s"
            className={styles.btn}
            aria-label="Insert template"
            disabled={loading}
            onClick={handleOpen}
            data-testid={`template-trigger-${source}`}
          >
            Insert template
          </EuiButton>
      )}
      >
        <TemplateForm closePopover={handleClose} setTemplate={setFieldValue} source={source} value={value} />
      </EuiPopover>
    </EuiOutsideClickDetector>
  )
}

export default TemplatePopover
