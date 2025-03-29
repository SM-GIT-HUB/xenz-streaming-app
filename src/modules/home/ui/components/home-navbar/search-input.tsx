import { SearchIcon } from 'lucide-react'
import React from 'react'

function SearchInput() {
  return (
    <form className='flex w-full max-w-[600px]'>
        <div className='relative w-full'>
          <input type="text" placeholder='Search' className='outline-none w-full pl-4 py-2 pr-12 border-black/20 border-r-0 rounded-l-full border focus:border-blue-800 hover:border-black/25 transition-all' />
        </div>

        <button type='submit' className='px-5 py-2.5 border border-black/25 rounded-r-full bg-[#87878715] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed  transition-all'>
          <SearchIcon className='size-5'/>
        </button>
    </form>
  )
}

export default SearchInput