import React from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppEnv } from './constants/env'

interface Props {
  children: React.ReactElement;
}

const Router = ({ children }: Props) =>
  (process.env.RI_APP_TYPE !== AppEnv.ELECTRON ? (
    <BrowserRouter>{children}</BrowserRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  ))

export default Router
