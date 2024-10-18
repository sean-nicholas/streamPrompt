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
            streamToast({
              title: 'Party Streaming...',
              // content: <div className="flex gap-2">hi</div>,
            })

            const res = await redisSubscribe({ key: 'party' })
            if (!res.ok || !res.body) {
              console.error('Failed to subscribe to Redis')
              return
            }
            const reader = res.body.getReader()
            let message = ''
            let data = null
            while (true) {
              const { done, value } = await reader.read()
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
                  break
                } catch (error) {}
              }
            }
            reader.cancel()

            streamToast({
              title: `You said: ${data}`,
            })

            // console.log(await res.text())
          })
        }}
      >
        Party!
      </ActionButton>
    </>
  )
}
