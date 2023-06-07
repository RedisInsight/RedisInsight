import React from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppEnv } from './constants/env'
import { envVars } from './utils'

interface Props {
  children: React.ReactElement;
}

const Router = ({ children }: Props) =>
  (envVars.APP_ENV !== AppEnv.ELECTRON ? (
    <BrowserRouter>{children}</BrowserRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  ))

export default Router
