import React from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppEnv } from './constants/env'

interface Props {
  children: React.ReactElement;
}

const Router = ({ children }: Props) =>
  (process.env.APP_ENV !== AppEnv.ELECTRON ? (
    <BrowserRouter>{children}</BrowserRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  ))

export default Router
