import { Rectangle, screen } from 'electron'

export const getFitedBounds = (bounds: Rectangle): Rectangle | null => {
  try {
    const options: Rectangle = { ...bounds }
    const area = screen.getDisplayMatching(bounds).workArea

    if (
      bounds.x >= area.x
      && bounds.y >= area.y
      && bounds.x + bounds.width <= area.x + area.width
      && bounds.y + bounds.height <= area.y + area.height
    ) {
      options.x = bounds.x
      options.y = bounds.y
    }
    // If the saved size is still valid, use it.
    if (bounds.width <= area.width) {
      options.width = bounds.width
    }

    if (bounds.height <= area.height) {
      options.height = bounds.height
    }

    return options
  } catch {
    return null
  }
}
