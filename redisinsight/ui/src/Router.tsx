import React from 'react'
import { BrowserRouter } from 'react-router-dom'

interface Props {
  children: React.ReactElement;
}

const RIPROXYPATH = window.__RI_PROXY_PATH__ || ''

let MOUNT_PATH = '/'

if (RIPROXYPATH !== '') {
  MOUNT_PATH = RIPROXYPATH
}

const Router = ({ children }: Props) =>
  <BrowserRouter basename={MOUNT_PATH}>{children}</BrowserRouter>

export default Router
