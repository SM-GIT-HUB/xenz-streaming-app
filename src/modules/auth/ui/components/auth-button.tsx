import { Button } from '@/components/ui/button'
import { UserCircleIcon } from 'lucide-react'

function AuthButton() {
  return (
    <Button variant='outline' className='px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-700
    hover:bg-blue-100/80 border-gray-300 rounded-full shadow-none'>
        <UserCircleIcon className='size-4 scale-[1.5]'/>
        Sign in
    </Button>
  )
}

export default AuthButton