import React, { ReactNode, isValidElement, ComponentProps } from 'react'
import { Section, SectionProps } from '@redis-ui/components'

export type RiAccordionProps = Omit<ComponentProps<typeof Section>, 'label'> & {
  label: ReactNode
  actions?: ReactNode
  collapsible?: SectionProps['collapsible']
  actionButtonText?: SectionProps['actionButtonText']
  collapsedInfo?: SectionProps['collapsedInfo']
  content?: SectionProps['content']
  children?: SectionProps['content']
  onAction?: SectionProps['onAction']
}
type RiAccordionLabelProps = { label: ReactNode }

type RiAccordionActionsProps = {
  actionButtonText: SectionProps['actionButtonText']
  actions?: ReactNode
  onAction?: SectionProps['onAction']
}

const RiAccordionLabel = ({ label }: RiAccordionLabelProps) => {
  if (typeof label === 'string') {
    return <Section.Header.Label label={label} />
  }
  if (!label) {
    return null
  }
  // Ensure we always return a valid JSX element by wrapping non-JSX values
  return isValidElement(label) ? label : <>{label}</>
}
const RiAccordionActions = ({
  actionButtonText,
  actions,
  onAction,
}: RiAccordionActionsProps) => (
  <Section.Header.Group>
    <Section.Header.ActionButton onClick={onAction}>
      {actionButtonText}
    </Section.Header.ActionButton>
    {actions}
    <Section.Header.CollapseIndicator />
  </Section.Header.Group>
)

export const RiAccordion = ({
  content,
  label,
  onAction,
  actionButtonText,
  collapsedInfo,
  children,
  actions,
  collapsible = true,
  ...rest
}: RiAccordionProps) => (
  <Section.Compose {...rest} collapsible={collapsible}>
    <Section.Header.Compose collapsedInfo={collapsedInfo}>
      <RiAccordionLabel label={label} />
      <RiAccordionActions
        actions={actions}
        onAction={onAction}
        actionButtonText={actionButtonText}
      />
    </Section.Header.Compose>
    <Section.Body content={children ?? content} />
  </Section.Compose>
)
