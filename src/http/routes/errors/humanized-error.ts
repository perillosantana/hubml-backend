type ToastStatus = 'alert' | 'error' | 'success'

type HumanizedErrorProps<T> = {
  status: ToastStatus
  message: string
}

export class HumanizedError<T> extends Error {
  status: ToastStatus
  message: string

  constructor(options: HumanizedErrorProps<T>) {
    super(options.message)
    this.status = options.status
    this.message = options.message
  }

  toJson() {
    return {
      status: this.status,
      message: this.message,
    }
  }
}
