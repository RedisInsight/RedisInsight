import styled, { css } from 'styled-components'
import React, { InputHTMLAttributes, forwardRef } from 'react'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'

type FilePickerWrapperProps = InputHTMLAttributes<HTMLDivElement> & {
  $large?: boolean
}
export const FilePickerPromptText = styled(Text)``

const largeWrapper = css`
  border-radius: 0;
  overflow: hidden;
  height: auto;
`
const defaultWrapper = css`
  height: 40px;
`
export const FilePickerWrapper = styled.div<FilePickerWrapperProps>`
  max-width: 400px;
  width: 100%;
  position: relative;
  ${({ $large }) => ($large ? largeWrapper : defaultWrapper)}
  &:hover {
    ${FilePickerPromptText} {
      text-decoration: underline;
      font-weight: 600;
    }
    svg {
      scale: 1.2;
    }
  }
`

// Create a base component that forwards refs
const FilePickerInputBase = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} />)

// Style the forwarded ref component
export const FilePickerInput = styled(FilePickerInputBase)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  overflow: hidden;
  &:hover {
    cursor: pointer;
  }
`

const promptLarge = css`
  height: 128px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`
const promptDefault = css`
  height: 140px;
`

export const FilePickerPrompt = styled.div<FilePickerWrapperProps>`
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 0 100%;
  padding: 12px 12px 12px 40px;
  transition:
    box-shadow 150ms ease-in,
    background-color 150ms ease-in,
    background-image 150ms ease-in,
    background-size 150ms ease-in 150ms;

  background-color: var(--browserTableRowEven);
  border-radius: 4px;
  box-shadow: none;
  border: 1px dashed var(--controlsBorderColor);
  color: var(--htmlColor);

  ${({ $large }) => ($large ? promptLarge : promptDefault)}
`

export const FilePickerClearButton = styled(EmptyButton)`
  pointer-events: auto; /* Undo the pointer-events: none applied to the enclosing prompt */
  position: relative; /* Required to sit above hidden input */
`
