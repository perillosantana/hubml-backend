type ToastStatus = 'alert' | 'error' | 'success'

type HumanizedErrorProps = {
  status: ToastStatus
  message: string
  systemMessage?: string
}

export class HumanizedError extends Error {
  status: ToastStatus
  message: string
  systemMessage: string

  constructor(options: HumanizedErrorProps) {
    super(options.message)
    this.status = options.status
    this.message = options.message
    this.systemMessage = options.systemMessage || ''
  }

  toJson() {
    return {
      status: this.status,
      message: this.message,
      systemMessage: this.systemMessage,
    }
  }
}
