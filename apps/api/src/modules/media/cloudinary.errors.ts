export type MediaFailureKind = 'retryable' | 'permanent' | 'not_configured';

export class MediaProviderError extends Error {
  readonly kind: MediaFailureKind;
  override readonly cause?: unknown;

  constructor(kind: MediaFailureKind, message: string, cause?: unknown) {
    super(message);
    this.name = 'MediaProviderError';
    this.kind = kind;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export function classifyCloudinaryError(err: unknown): MediaFailureKind {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (message.includes('timeout') || message.includes('econn') || message.includes('429')) {
    return 'retryable';
  }
  return 'permanent';
}
