'use client'

import { Clapperboard, UserCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

function AuthButton() {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link label='Studio' href='/studio' labelIcon={<Clapperboard className='size-4'/>} />
            <UserButton.Action label='manageAccount' />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>

      <SignedOut>
        <SignInButton mode='modal'>
          <Button variant='outline' className='px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-700
          hover:bg-blue-100/80 border-gray-300 rounded-full shadow-none'>
            <UserCircleIcon className='size-4 scale-[1.5]'/>
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}

export default AuthButton