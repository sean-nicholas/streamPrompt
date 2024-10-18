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
            console.log('hello from edge')

            streamToast({
              title: 'Party Streaming...',
              // content: <div className="flex gap-2">hi</div>,
            })

            console.log('subscribing to party')
            const res = await redisSubscribe({ key: 'party' })
            console.log('res here')
            if (!res.ok || !res.body) {
              console.error('Failed to subscribe to Redis')
              return
            }
            console.log('after ok check')
            const reader = res.body.getReader()
            let message = ''
            let data = null
            console.log('before while')
            while (true) {
              console.log('in while')
              const { done, value } = await reader.read()
              console.log('after read')
              const text = new TextDecoder().decode(value)
              console.log('after text', text)
              message += text
              console.log('message', message)
              if (message.startsWith('data: message,party,')) {
                try {
                  const finalMessage = JSON.parse(text.split(',')[2])
                  console.log('finalMessage', finalMessage)
                  data = finalMessage.data
                  break
                } catch (error) {}
                break
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
