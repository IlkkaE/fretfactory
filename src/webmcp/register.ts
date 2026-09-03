import { useAppState } from '../store.state'
import { createFretFactoryReadTools } from './readTools'
import type { WebMcpModelContext } from './types'

export type WebMcpRegistration = {
  ready: Promise<void>
  dispose: () => void
}

export function registerFretFactoryWebMcpTools(
  modelContext?: WebMcpModelContext,
): WebMcpRegistration | null {
  const context = modelContext ?? (
    typeof document === 'undefined' ? undefined : document.modelContext
  )
  if (!context?.registerTool) return null

  const controller = new AbortController()
  const tools = createFretFactoryReadTools(() => useAppState.getState())
  const ready = Promise.all(
    tools.map(tool => context.registerTool(tool, { signal: controller.signal })),
  ).then(() => undefined).catch(error => {
    controller.abort()
    throw error
  })

  return {
    ready,
    dispose: () => controller.abort(),
  }
}
