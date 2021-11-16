import ReactDOM from 'react-dom'
import React, { useEffect, useState } from 'react'
import { EuiPagination } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactElement[];
}
const Carousel = ({ children }: Props) => {
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [slides, setSlides] = useState<React.ReactElement[]>([])

  useEffect(() => {
    // Get items only with specified key attribute
    setSlides(children.filter((element) => element?.key && element.key.toString().startsWith('slide')))
  }, [])

  const Pagination = () => {
    const footerEl = document.getElementById('internalPageFooter')
    if (footerEl) {
      return ReactDOM.createPortal(
        <div className={styles.pagination}>
          <EuiPagination
            area-label="pagination"
            compressed
            pageCount={slides.length}
            activePage={slideIndex}
            onPageClick={(slide) => setSlideIndex(slide)}
          />
        </div>,
        footerEl
      )
    }
    return null
  }
  return (
    <div className={styles.container} data-testid={`internal-page-slide-${slideIndex}`}>
      {slides[slideIndex]}
      {slides.length && <Pagination />}
    </div>
  )
}

export default Carousel
