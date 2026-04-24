function envelope(level: "info" | "warn" | "error", event: string, data: Record<string, unknown>, requestId?: string) {
  const rid = requestId?.trim()
  return JSON.stringify({
    level,
    event,
    ...(rid ? { requestId: rid } : {}),
    ...data,
  })
}

export function logInfo(event: string, data: Record<string, unknown>, requestId?: string) {
  console.log(envelope("info", event, data, requestId))
}

export function logWarn(event: string, data: Record<string, unknown>, requestId?: string) {
  console.warn(envelope("warn", event, data, requestId))
}

export function logError(event: string, data: Record<string, unknown>, requestId?: string) {
  console.error(envelope("error", event, data, requestId))
}

