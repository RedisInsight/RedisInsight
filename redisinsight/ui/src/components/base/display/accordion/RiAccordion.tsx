import React from 'react'
import { Section } from '@redis-ui/components'

export type RiAccordionProps = React.ComponentProps<typeof Section>
export const RiAccordion = ({ ...rest }: RiAccordionProps) => (
  <Section {...rest} />
)
