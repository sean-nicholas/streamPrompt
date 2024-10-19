import {
  getRedirectStatusCodeFromError,
  getRedirectTypeFromError,
  getURLFromRedirectError,
  isRedirectError,
} from 'next/dist/client/components/redirect'
import { ReactNode } from 'react'
import { createResolvablePromise } from './createResolvablePromise'
import { createStreamPrompt, SuperActionPrompt } from './streamPrompt'

export type SuperActionToast = {
  title?: string
  description?: ReactNode
}

export type SuperActionDialog = {
  title?: string
  content?: ReactNode
  confirm?: string
  cancel?: string
} | null

export type SuperActionError = {
  message?: string
}

export type SuperActionRedirect = {
  url: string
  type: 'push' | 'replace'
  statusCode: number
}

export type SuperActionResponse<Result, Input> = {
  result?: Result
  next?: Promise<SuperActionResponse<Result, Input>>
  toast?: SuperActionToast
  dialog?: SuperActionDialog
  error?: SuperActionError
  redirect?: SuperActionRedirect
  action?: SuperAction<Result, undefined>
  heartbeat?: {
    timestamp: number
  }
}

export type SuperActionContext<Result, Input> = {
  chain: (val: SuperActionResponse<Result, Input>) => void
}

// const serverContext = createServerContext<SuperActionContext<any, any>>()

export const superAction = async <Result, Input>(
  action: (options: {
    streamDialog: (dialog: SuperActionDialog) => void
    streamToast: (toast: SuperActionToast) => void
    streamPrompt: (prompt: SuperActionPrompt) => Promise<string>
  }) => Promise<Result>,
) => {
  let next = createResolvablePromise<SuperActionResponse<Result, Input>>()
  const firstPromise = next.promise

  const chain = (val: SuperActionResponse<Result, Input>) => {
    const oldNext = next
    next = createResolvablePromise<SuperActionResponse<Result, Input>>()
    oldNext.resolve({ ...val, next: next.promise })
  }
  const complete = (val: SuperActionResponse<Result, Input>) => {
    next.resolve(val)
  }

  const ctx: SuperActionContext<Result, Input> = {
    chain,
  }

  // serverContext.set(ctx)

  const streamDialog = (dialog: SuperActionDialog) => {
    // const ctx = serverContext.getOrThrow()
    ctx.chain({ dialog })
  }

  const streamToast = (toast: SuperActionToast) => {
    ctx.chain({ toast })
  }

  const streamPrompt = createStreamPrompt({ ctx })

  // Execute Action:
  action({ streamDialog, streamToast, streamPrompt })
    .then((result) => {
      complete({ result })
    })
    .catch((error: unknown) => {
      if (isRedirectError(error)) {
        if (firstPromise === next.promise) {
          next.reject(error)
        }
        // We already streamed something, so can't throw the Next.js redirect
        // We send the redirect as a response instead for the client to handle
        complete({
          redirect: {
            url: getURLFromRedirectError(error),
            type: getRedirectTypeFromError(error),
            statusCode: getRedirectStatusCodeFromError(error),
          },
        })
        return
      }

      // const parsed = z
      //   .object({
      //     message: z.string(),
      //   })
      //   .safeParse(error)
      complete({
        error: {
          message: error instanceof Error ? error.stack : String(error),
        },
      })
    })

  const superAction = await firstPromise
  return { superAction }
}

export type SuperActionPromise<Result, Input> = Promise<{
  superAction: SuperActionResponse<Result, Input>
} | void>

export type SuperAction<Result, Input> = (
  input: Input,
) => SuperActionPromise<Result, Input>

export type SuperActionWithInput<Input> = SuperAction<unknown, Input>
export type SuperActionWithResult<Result> = SuperAction<Result, unknown>

export const createStreamDialog = <Result, Input>({
  ctx,
}: {
  ctx: SuperActionContext<Result, Input>
}) => {
  return (dialog: SuperActionDialog) => {
    ctx.chain({ dialog })
  }
}

// export const streamToast = (toast: SuperActionToast) => {
//   const ctx = serverContext.getOrThrow()
//   ctx.chain({ toast })
// }

// export const streamDialog = (dialog: SuperActionDialog) => {
//   const ctx = serverContext.getOrThrow()
//   ctx.chain({ dialog })
// }

// export const streamAction = <Result>(
//   action: SuperAction<Result, undefined>,
// ) => {
//   const ctx = serverContext.getOrThrow()
//   ctx.chain({ action })
// }
