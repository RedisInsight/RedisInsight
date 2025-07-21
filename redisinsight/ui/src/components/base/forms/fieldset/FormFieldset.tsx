import React from 'react'

import {
  StyledFieldset,
  StyledFieldsetProps,
  StyledLegend,
  StyledLegendProps,
} from './FormFieldset.styles'

export interface FormFieldsetProps extends StyledFieldsetProps {
  legend?: StyledLegendProps
}

export const FormFieldset = ({
  legend,
  children,
  ...props
}: FormFieldsetProps) => (
  <StyledFieldset {...props}>
    {legend && <StyledLegend {...legend} />}
    {children}
  </StyledFieldset>
)
