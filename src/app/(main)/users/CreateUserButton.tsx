import { superAction } from '@/super-action/action/createSuperAction'
import { ActionButton } from '@/super-action/button/ActionButton'

export const CreateUserButton = () => {
  return (
    <>
      <ActionButton
        action={async () => {
          'use server'
          return superAction(async () => {
            // streamDialog({
            //   title: 'Create User',
            //   content: (
            //     <>
            //       <LoginFormClient
            //         action={async (credentials) => {
            //           'use server'
            //           return superAction(async () => {
            //             if (credentials.type === 'forgotPassword') {
            //               throw new Error('Invalid type')
            //             }
            //             await registerUser(credentials)
            //             streamDialog(null)
            //             revalidatePath('/users')
            //           })
            //         }}
            //       />
            //     </>
            //   ),
            // })
          })
        }}
      >
        Create User
      </ActionButton>
    </>
  )
}
