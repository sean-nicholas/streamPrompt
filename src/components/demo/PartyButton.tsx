import { redisSubscribe } from '@/lib/redis'
import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'
import { PartyPopper } from 'lucide-react'

export const PartyButton = () => {
  return (
    <>
      {/* ActionButton can handle streaming from superActions: */}
      <ActionButton
        command={{
          // inject this action into the CMD+K menu
          label: 'Stream Party!', // optional, defaults to children
          shortcut: {
            key: 'p', // Also set a keyboard-shortcut
          },
        }}
        icon={<PartyPopper />}
        action={async () => {
          'use server'

          return superAction(async ({ streamToast }) => {
            const startedAt = new Date()
            console.log(`started at ${startedAt.toISOString()}`)
            streamToast({
              title: 'Party Streaming...',
              // content: <div className="flex gap-2">hi</div>,
            })

            // let count = 0
            // while (true) {
            //   await new Promise((resolve) => setTimeout(resolve, 1_000))
            //   const message = `Still there. Iteration ${++count}. Run for ${
            //     (new Date().getTime() - startedAt.getTime()) / 1000
            //   } seconds`
            //   console.log(message)
            //   streamToast({
            //     title: message,
            //   })
            // }

            const res = await redisSubscribe({ key: 'party' })
            if (!res.ok || !res.body) {
              console.error('Failed to subscribe to Redis')
              return
            }
            const reader = res.body.getReader()
            let message = ''
            let data = null
            let count = 0
            let readerPromise: Promise<{
              type: 'reader'
              result: ReadableStreamReadResult<Uint8Array>
            }> | null = null
            while (true) {
              if (!readerPromise) {
                readerPromise = reader.read().then((result) => ({
                  type: 'reader' as const,
                  result,
                }))
              }

              const timeoutPromise = new Promise<{ type: 'timeout' }>(
                (resolve) =>
                  setTimeout(() => resolve({ type: 'timeout' }), 5000),
              )
              const result = await Promise.race([readerPromise, timeoutPromise])
              if (result.type === 'timeout') {
                const message = `Still there. Iteration ${++count}. Run for ${
                  (new Date().getTime() - startedAt.getTime()) / 1000
                } seconds`
                console.log(message)
                streamToast({
                  title: message,
                })
              }

              if (result.type === 'reader') {
                const { done, value } = result.result
                readerPromise = null
                const text = new TextDecoder().decode(value)
                message += text
                const parts = message.split('\n')
                console.log('parts', parts)
                const dataPart = parts.find((part) =>
                  part.includes('data: message,party,'),
                )
                console.log('dataPart', dataPart)

                if (dataPart) {
                  try {
                    const jsonString = dataPart.replace(
                      'data: message,party,',
                      '',
                    )
                    console.log('jsonString', jsonString)
                    const finalMessage = JSON.parse(jsonString)
                    console.log('finalMessage', finalMessage)
                    data = finalMessage.data
                    streamToast({
                      title: `You said: ${data}`,
                    })
                    break
                  } catch (error) {}
                }
              }
            }
            // reader.cancel()
            // console.log(await res.text())
          })
        }}
      >
        Party!
      </ActionButton>
    </>
  )
}
