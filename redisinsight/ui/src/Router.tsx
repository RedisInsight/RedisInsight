import React from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppEnv } from './constants/env'

interface Props {
  children: React.ReactElement;
}

const RIPROXYPATH = window.__RI_PROXY_PATH__ || ''

let MOUNT_PATH = '/'

if (RIPROXYPATH !== '') {
  MOUNT_PATH = RIPROXYPATH
}

const Router = ({ children }: Props) =>
  (process.env.RI_APP_TYPE !== AppEnv.ELECTRON ? (
    <BrowserRouter basename={MOUNT_PATH}>{children}</BrowserRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  ))

export default Router
