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

          console.log('hello from edge')

          // We have to wrap the action in a superAction to enable fun stuff:
          return superAction(async ({ streamDialog }) => {
            streamDialog({
              title: 'Party Streaming...',
              content: <div className="flex gap-2">hi</div>,
            })

            for (let i = 0; i < 10; i++) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              streamDialog({
                content: (
                  <div className="flex gap-2">
                    {[...Array(i + 1)].map((_, index) => (
                      <div key={index} className="animate-spin">
                        🎉
                      </div>
                    ))}
                  </div>
                ),
              })
            }
          })
        }}
      >
        Party!
      </ActionButton>
    </>
  )
}
