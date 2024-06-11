import CustomToast from '@/components/Toast'
import { ReactNode, useEffect, useRef } from 'react'
import { ExternalToast, toast } from 'sonner'

export function showErrorToast<ErrorType>(
  error: unknown,
  errorTitle: ReactNode,
  config?: {
    getDescription?: (t: string | number) => ReactNode
    getMessage?: (error: ErrorType) => string
    actionButton?: (t: string | number) => ReactNode
    toastConfig?: ExternalToast
  }
) {
  const { actionButton, getMessage, toastConfig } = config ?? {}
  // TODO: this error message should be sent to logger for debugging purposes, but not shown to user
  // let message: string | undefined = (error as any)?.message

  // const response = (error as any)?.response?.data
  // message = response?.message ?? message
  // if (getMessage) {
  //   const responseMessage = getMessage(response)
  //   if (responseMessage) message = responseMessage
  // }

  toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type='error'
        title={errorTitle}
        // subtitle={message}
        description={config?.getDescription?.(t)}
        action={actionButton?.(t)}
      />
    ),
    toastConfig
  )
}

export default function useToastError<ErrorType>(
  error: unknown,
  errorTitle: string,
  getMessage?: (error: ErrorType) => string
) {
  const getMessageRef = useRef(getMessage)
  useEffect(() => {
    if (error) {
      showErrorToast(error, errorTitle, { getMessage: getMessageRef.current })
    }
  }, [error, errorTitle])
}
