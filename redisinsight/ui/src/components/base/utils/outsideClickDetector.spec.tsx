import React, { EventHandler, MouseEvent as ReactMouseEvent } from 'react'
import { render, fireEvent } from 'uiSrc/utils/test-utils'
import {
  OutsideClickDetector,
  RIEvent,
} from 'uiSrc/components/base/utils/OutsideClickDetector'

describe('OutsideClickDetector', () => {
  it('is rendered', () => {
    const { container } = render(
      <OutsideClickDetector onOutsideClick={() => {}}>
        <div />
      </OutsideClickDetector>,
    )
    expect(container.firstChild).toBeTruthy()
  })

  describe('behavior', () => {
    test('nested detectors', async () => {
      const unrelatedDetector = jest.fn()
      const parentDetector = jest.fn()
      const childDetector = jest.fn()

      const triggerDocumentMouseDown: EventHandler<any> = (
        e: ReactMouseEvent,
      ) => {
        const event = new Event('mousedown') as RIEvent
        event.riGeneratedBy = (
          e.nativeEvent as unknown as RIEvent
        ).riGeneratedBy
        document.dispatchEvent(event)
      }

      const triggerDocumentMouseUp: EventHandler<any> = (
        e: ReactMouseEvent,
      ) => {
        const event = new Event('mouseup') as RIEvent
        event.riGeneratedBy = (
          e.nativeEvent as unknown as RIEvent
        ).riGeneratedBy
        document.dispatchEvent(event)
      }

      const { findByTestId } = render(
        <div
          role="button"
          tabIndex={0}
          onMouseDown={triggerDocumentMouseDown}
          onMouseUp={triggerDocumentMouseUp}
        >
          <div>
            <OutsideClickDetector onOutsideClick={parentDetector}>
              <div>
                <OutsideClickDetector onOutsideClick={childDetector}>
                  <div data-testid="target1" />
                </OutsideClickDetector>
              </div>
            </OutsideClickDetector>
          </div>

          <OutsideClickDetector onOutsideClick={unrelatedDetector}>
            <div data-testid="target2" />
          </OutsideClickDetector>
        </div>,
      )
      const target = await findByTestId('target1')
      const target2 = await findByTestId('target2')

      fireEvent.mouseDown(target)
      fireEvent.mouseUp(target2)

      expect(parentDetector).toHaveBeenCalledTimes(0)
      expect(childDetector).toHaveBeenCalledTimes(0)
      expect(unrelatedDetector).toHaveBeenCalledTimes(1)
    })
  })
})
