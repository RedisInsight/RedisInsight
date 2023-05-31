import React from 'react'

export interface Props {
  children: React.ReactElement
  isShow: boolean
  innerClassName?: string
}

const ShowChildByCondition = (props: Props) => {
  const { isShow, children, innerClassName = '' } = props
  const innerContent = children.props.children ?? children

  return isShow ? children : <span className={innerClassName}>{innerContent}</span>
}

export default ShowChildByCondition
