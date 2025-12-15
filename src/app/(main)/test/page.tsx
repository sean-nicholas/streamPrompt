import { ActionButton } from '@/super-action/button/ActionButton'

export default async function Page() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-8">
        <div className="flex flex-col gap-2">
          <ActionButton
            action={async () => {
              'use server'
              const cart = getCart()
              const outOfStock = cart.getOutOfStock()
              if (outOfStock.length > 0) {
                return streamDialog({
                  title: 'Out of Stock',
                  content: (
                    <div>
                      The following items are out of stock:{' '}
                      {outOfStock.join(', ')}
                    </div>
                  ),
                })
              }
            }}
          >
            Buy
          </ActionButton>
        </div>
      </div>
    </>
  )
}
