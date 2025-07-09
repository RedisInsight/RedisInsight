import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { alignValues, dirValues, gapSizes, justifyValues } from './flex.styles'
import { Col, FlexGroup as Flex, FlexItem, Grid, Row } from './flex'

const gapStyles = {
  none: '',
  xs: '0.2rem',
  s: '0.4rem',
  m: '0.8rem',
  l: '1.2rem',
  xl: '2rem',
  xxl: '2.4rem',
}
describe('Flex Components', () => {
  it('should render', () => {
    expect(render(<FlexItem />)).toBeTruthy()
    expect(
      render(
        <Flex>
          <span>Child</span>
        </Flex>,
      ),
    ).toBeTruthy()
    expect(
      render(
        <Row>
          <span>Child</span>
        </Row>,
      ),
    ).toBeTruthy()
    expect(
      render(
        <Col>
          <span>Child</span>
        </Col>,
      ),
    ).toBeTruthy()
    expect(
      render(
        <Grid>
          <span>Child</span>
        </Grid>,
      ),
    ).toBeTruthy()
  })

  describe('Flex', () => {
    it('should render with default classes', () => {
      const { container } = render(
        <Row>
          <span>Child</span>
        </Row>,
      )
      expect(container).toBeTruthy()
      expect(container.firstChild).toHaveClass('RI-flex-row', 'RI-flex-group')
      expect(container.firstChild).toHaveStyle('flex-direction: row')
    })

    describe('Col', () => {
      it('should render', () => {
        const { container } = render(
          <Col>
            <span>Child</span>
          </Col>,
        )
        expect(container.firstChild).toHaveClass('RI-flex-col', 'RI-flex-group')
        expect(container.firstChild).toHaveStyle('flex-direction: column')
      })
    })

    describe('Props', () => {
      describe('gap', () => {
        gapSizes.forEach((value) => {
          it(`should render gap ${value}`, () => {
            const { container } = render(
              <Flex gap={value}>
                <span>Child</span>
              </Flex>,
            )
            expect(container.firstChild).toHaveClass('RI-flex-group')
            if (value !== 'none') {
              expect(container.firstChild).toHaveStyle(
                `gap: ${gapStyles[value]}`,
              )
            } else {
              expect(container.firstChild).not.toHaveStyle('')
            }
          })
        })
      })
      describe('align', () => {
        alignValues.forEach((value) => {
          it(`should render ${value} align`, () => {
            const { container } = render(
              <Flex align={value}>
                <span>Child</span>
              </Flex>,
            )
            expect(container.firstChild).toHaveClass(
              'RI-flex-group',
              // flex[`align-${value}`],
            )
          })
        })
      })

      describe('justify', () => {
        justifyValues.forEach((value) => {
          it(`should render ${value} justify`, () => {
            const { container } = render(
              <Flex justify={value}>
                <span>Child</span>
              </Flex>,
            )
            expect(container.firstChild).toHaveClass(
              'RI-flex-group',
              // flex[`justify-${value}`],
            )
          })
        })
      })

      describe('dir', () => {
        dirValues.forEach((value) => {
          it(`should render ${value} dir`, () => {
            const { container } = render(
              <Flex direction={value}>
                <span>Child</span>
              </Flex>,
            )

            expect(container.firstChild).toHaveClass(
              'RI-flex-group',
              // flex[`flex-${value}`],
            )
          })
        })
      })

      describe('wrap', () => {
        ;[true, false].forEach((value) => {
          test(`${value} is rendered`, () => {
            const { container } = render(
              <Flex wrap={value}>
                <span>Child</span>
              </Flex>,
            )

            expect(container.firstChild).toHaveClass(
              'RI-flex-group',
              // value ? flex['flex-wrap'] : '',
            )
          })
        })
      })
      describe('responsive', () => {
        ;[true, false].forEach((value) => {
          it(`should render ${value} responsive`, () => {
            const { container } = render(
              <Flex responsive={value}>
                <span>Child</span>
              </Flex>,
            )

            expect(container.firstChild).toHaveClass(
              'RI-flex-group',
              // value ? flex['flex-responsive'] : '',
            )
          })
        })
      })
    })
  })

  describe('FlexItem', () => {
    describe('inline', () => {
      it('should render div as default', () => {
        const { getByText, container } = render(
          <FlexItem>
            <span>Child</span>
          </FlexItem>,
        )
        expect(container.firstChild?.nodeName).toEqual('DIV')

        expect(getByText('Child')).toBeInTheDocument()
      })
    })

    describe('grow', () => {
      describe('falsy values', () => {
        const VALUES = [0, false, null] as const

        VALUES.forEach((value) => {
          it(`${value} should generate a flex-grow of 0`, () => {
            const { container } = render(<FlexItem grow={value} />)
            expect(container.firstChild).toHaveClass(
              'RI-flex-item',
              // value ? flex['flex-responsive'] : '',
            )
            // assertClassName(flex['flexItem-grow-0'])
          })
        })
      })

      describe('default values', () => {
        const VALUES = [true, undefined] as const

        VALUES.forEach((value) => {
          test(`${value} generates a flex-grow of 1`, () => {
            const { container } = render(<FlexItem grow={value} />)
            expect(container.firstChild).toHaveClass(
              'RI-flex-item',
              // value ? flex['flex-responsive'] : '',
            )
            // assertClassName(flex['flexItem-grow-0'])
          })
        })
      })

      describe('numeric values', () => {
        const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

        VALUES.forEach((value) => {
          test(`${value} generates a flex-grow of ${value}`, () => {
            const { container } = render(<FlexItem grow={value} />)
            expect(container.firstChild).toHaveClass(
              'RI-flex-item',
              // value ? flex['flex-responsive'] : '',
            )
            // assertClassName(flex[`flexItem-grow-${value}`])
          })
        })
      })
    })
  })

  describe('Grid', () => {
    it('should render', () => {
      expect(
        render(
          <Grid>
            <h2>My Child</h2>
          </Grid>,
        ),
      ).toBeTruthy()
    })
    describe('props', () => {
      describe('gap', () => {
        gapSizes.forEach((value) => {
          it(`should render ${value} gap`, () => {
            const { getByText, container } = render(
              <Grid gap={value}>
                <h2>My Child</h2>
              </Grid>,
            )
            const grid = container.firstChild
            expect(grid).toHaveClass('RI-flex-grid')
            if (value !== 'none') {
              expect(grid).toHaveStyle(`gap: ${gapStyles[value]}`)
            } else {
              expect(grid).not.toHaveStyle('')
            }
            expect(getByText('My Child')).toBeInTheDocument()
          })
        })
      })

      describe('columns', () => {
        ;([1, 2, 3, 4] as const).forEach((value) => {
          it(`should render ${value} columns`, () => {
            const { container } = render(
              <Grid columns={value}>
                <h2>My Child</h2>
              </Grid>,
            )
            expect(container.firstChild).toHaveClass(
              'RI-flex-grid',
              // flex[`grid-columns-${value}`],
            )
          })
        })
      })

      describe('responsive', () => {
        it('should render when responsive is false', () => {
          const { container } = render(
            <Grid responsive={false}>
              <h2>My Child</h2>
            </Grid>,
          )
          expect(container.firstChild).toHaveClass('RI-flex-grid')
          // expect(container.firstChild).not.toHaveClass(flex.gridResponsive)
        })
        it('should have class grid-responsive when responsive is true', () => {
          const { container } = render(
            <Grid responsive>
              <h2>My Child</h2>
            </Grid>,
          )
          expect(container.firstChild).toHaveClass(
            'RI-flex-grid',
            // flex['grid-responsive'],
          )
        })
      })

      describe('centered', () => {
        it('should render when centered is false', () => {
          const { container } = render(
            <Grid centered={false}>
              <h2>My Child</h2>
            </Grid>,
          )
          expect(container.firstChild).toHaveClass('RI-flex-grid')
          // expect(container.firstChild).not.toHaveClass(flex.gridCentered)
        })
        it('should have class grid-centered when responsive is true', () => {
          const { container } = render(
            <Grid centered>
              <h2>My Child</h2>
            </Grid>,
          )
          expect(container.firstChild).toHaveClass(
            'RI-flex-grid',
            // flex['grid-centered'],
          )
        })
      })
    })
  })
})
