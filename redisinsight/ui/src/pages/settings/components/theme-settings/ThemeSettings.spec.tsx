import { cleanup, mockedStore, render } from "uiSrc/utils/test-utils";
import { cloneDeep } from "lodash";
import React from "react";
import ThemeSettings from "./ThemeSettings";

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ThemeSettings', () => {
  it('should render', () => {
    expect(render(<ThemeSettings />)).toBeTruthy()
  })
});
