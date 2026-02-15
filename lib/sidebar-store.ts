import { useSyncExternalStore } from 'react'

// Module-level shared state so both theme layer instances stay in sync
let collapsed = false
let open = false

const collapsedListeners = new Set<() => void>()
const openListeners = new Set<() => void>()

function emitCollapsed() {
  collapsedListeners.forEach((l) => l())
}

function emitOpen() {
  openListeners.forEach((l) => l())
}

export function getSidebarCollapsed() {
  return collapsed
}

export function setSidebarCollapsed(value: boolean) {
  collapsed = value
  emitCollapsed()
}

export function toggleSidebarCollapsed() {
  collapsed = !collapsed
  emitCollapsed()
}

export function getSidebarOpen() {
  return open
}

export function setSidebarOpen(value: boolean) {
  open = value
  emitOpen()
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(
    (cb) => {
      collapsedListeners.add(cb)
      return () => collapsedListeners.delete(cb)
    },
    () => collapsed,
    () => collapsed
  )
}

export function useSidebarOpen() {
  return useSyncExternalStore(
    (cb) => {
      openListeners.add(cb)
      return () => openListeners.delete(cb)
    },
    () => open,
    () => open
  )
}
