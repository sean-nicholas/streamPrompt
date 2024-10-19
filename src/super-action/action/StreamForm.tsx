'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReactNode } from 'react'
import { SuperAction } from './createSuperAction'
import { useSuperAction } from './useSuperAction'

export const StreamForm = ({
  prompt,
  action,
}: {
  prompt: ReactNode
  action: SuperAction<unknown, FormData>
}) => {
  const { trigger, isLoading } = useSuperAction({
    action,
  })
  return (
    <div className="flex flex-col gap-2">
      {prompt}
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          trigger(new FormData(event.target as HTMLFormElement))
        }}
      >
        <Input name="answer" />
        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </form>
    </div>
  )
}
