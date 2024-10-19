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
              return superAction(async ({ streamPrompt, streamDialog }) => {
                // Just a reminder: Can't send this function to the client.
                const getGreeting = ({
                  name,
                  food,
                }: {
                  name: string
                  food: string
                }) => {
                  return `Nice to meet you ${name}! I liked ${food}, too!`
                }

                // Oh no we don't know who said hi. Let's ask them with a nice prompt.
                const superName = await streamPrompt({
                  prompt: <div>Hi, nice to meet you! What is your name?</div>,
                })

                // Ahh and what food do they like?
                const superFood = await streamPrompt({
                  prompt: (
                    <div>Hi {superName}, What is your favorite food?</div>
                  ),
                })

                streamDialog({
                  title: 'Hi!',
                  content: (
                    <div>
                      {getGreeting({ name: superName, food: superFood })}
                    </div>
                  ),
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
