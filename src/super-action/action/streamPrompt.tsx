import { redisPublish, redisSubscribe } from '@/lib/redis'
import {
  createStreamDialog,
  superAction,
  SuperActionContext,
} from './createSuperAction'
import { StreamForm } from './StreamForm'

export type SuperActionPrompt = {
  prompt: React.ReactNode
}

export const createStreamPrompt =
  <Result, Input>({ ctx }: { ctx: SuperActionContext<Result, Input> }) =>
  ({ prompt }: SuperActionPrompt) => {
    const streamDialog = createStreamDialog({ ctx })

    const pubSubId = self.crypto.randomUUID()

    streamDialog({
      content: (
        <StreamForm
          prompt={prompt}
          action={async (formData) => {
            'use server'
            return superAction(async ({ streamDialog }) => {
              streamDialog(null)
              await redisPublish({
                key: pubSubId,
                data: formData.get('answer')?.toString() ?? 'Unknown Answer',
              })
            })
          }}
        />
      ),
    })
    return new Promise<string>(async (resolve, reject) => {
      const res = await redisSubscribe({ key: pubSubId })
      if (!res.ok || !res.body) {
        console.error('Failed to subscribe to Redis')
        return
      }
      let reader = res.body.getReader()
      let resFrom = Date.now()
      let message = ''
      let data = null
      let readerPromise: Promise<{
        type: 'reader'
        result: ReadableStreamReadResult<Uint8Array>
      }> | null = null
      while (true) {
        try {
          if (!readerPromise) {
            readerPromise = reader.read().then((result) => ({
              type: 'reader' as const,
              result,
            }))
          }

          const timeoutPromise = new Promise<{ type: 'timeout' }>((resolve) =>
            setTimeout(() => resolve({ type: 'timeout' }), 5000),
          )
          const result = await Promise.race([readerPromise, timeoutPromise])

          if (resFrom + 50_000 < Date.now()) {
            throw new Error('Premature timeout')
          }

          if (result.type === 'timeout') {
            ctx.chain({
              heartbeat: {
                timestamp: Date.now(),
              },
            })
          }

          if (result.type === 'reader') {
            const { done, value } = result.result

            if (done) {
              throw new Error('Stream was done before data received')
            }

            readerPromise = null
            const text = new TextDecoder().decode(value)
            message += text
            const parts = message.split('\n')
            const dataPart = parts.find((part) =>
              part.includes(`data: message,${pubSubId},`),
            )

            if (dataPart) {
              try {
                const jsonString = dataPart.replace(
                  `data: message,${pubSubId},`,
                  '',
                )
                const finalMessage = JSON.parse(jsonString)
                data = finalMessage.data
                resolve(data)
                break
              } catch (error) {}
            }
          }
        } catch (error) {
          const oldReader = reader
          const res = await redisSubscribe({ key: pubSubId })
          if (!res.ok || !res.body) {
            reject(new Error('Failed to subscribe to Redis'))
            return
          }
          reader = res.body.getReader()
          resFrom = Date.now()
          readerPromise = reader.read().then((result) => ({
            type: 'reader' as const,
            result,
          }))
          oldReader.cancel()
        }
      }
    })
  }
