import { PartyButton } from '@/components/demo/PartyButton'
import { redisPublish } from '@/lib/redis'
import { ActionButton } from '@/super-action/button/ActionButton'

export const runtime = 'edge'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <h1 className="text-2xl lg:text-6xl">🎉 Welcome to the Party 🥳</h1>
        <div className="flex flex-col gap-2">
          <PartyButton />
          <ActionButton
            action={async () => {
              'use server'

              await redisPublish({ key: 'party', data: 'hi' })
            }}
          >
            Publish
          </ActionButton>
        </div>
      </div>
    </>
  )
}
