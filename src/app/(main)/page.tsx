import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'

export const runtime = 'edge'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <div className="flex flex-col gap-2">
          <ActionButton
            action={async () => {
              'use server'
              return superAction(async ({ streamPrompt, streamToast }) => {
                // Oh no we don't know who said hi. Let's ask them!
                const name = await streamPrompt({
                  prompt: <div>Hi, nice to meet you! What is your name?</div>,
                })

                streamToast({
                  title: `Nice to meet you ${name}!`,
                })
              })
            }}
          >
            Hi!
          </ActionButton>
        </div>
      </div>
    </>
  )
}
