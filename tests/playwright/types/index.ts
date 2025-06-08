export * from './databes'
export * from './connections'
export * from './keys'

declare global {
    interface Window {
        windowId?: string
    }
}
