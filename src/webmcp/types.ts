export type WebMcpInputSchema = {
  type: 'object'
  properties?: Record<string, Record<string, unknown>>
  required?: string[]
  additionalProperties?: boolean
}

export type WebMcpTool = {
  name: string
  title: string
  description: string
  inputSchema: WebMcpInputSchema
  annotations: {
    readOnlyHint: true
    untrustedContentHint: false
  }
  execute: (input: Record<string, unknown>) => string | Promise<string>
}

export type WebMcpModelContext = {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => Promise<void>
}

declare global {
  interface Document {
    modelContext?: WebMcpModelContext
  }
}

