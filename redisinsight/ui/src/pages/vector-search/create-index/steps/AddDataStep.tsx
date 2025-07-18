import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { IStepComponent } from '../types'

export const AddDataStep: IStepComponent = ({ setParameters }) => (
  <>
    <FlexItem direction="column" $gap="m">
      <FlexItem direction="row" $gap="m">
        <div>Box1</div>
        <div>Box2</div>
      </FlexItem>
    </FlexItem>
    <FlexItem direction="column" $gap="m">
      <Text>Select sample dataset</Text>
    </FlexItem>
    <FlexItem direction="column" $gap="m">
      <Text>Data content</Text>
      <FlexItem direction="row" $gap="m">
        <div>Box1</div>
        <div>Box2</div>
        <div>Box3</div>
      </FlexItem>
    </FlexItem>
  </>
)
