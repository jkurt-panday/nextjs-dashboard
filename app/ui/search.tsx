'use client';     // is a client component

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {    // placeholder is a props
  // added in chapter 11
  const searchParams = useSearchParams();

  // added in chapter 11, hooks to update the URL
  const pathname = usePathname();
  const { replace } = useRouter();

  // handles searching queries from the search input
  // function handleSearch(term: string) {       // before debouncing

    const handleSearch = useDebouncedCallback((term) => {

    console.log(`Searching...${term}`)

    const params = new URLSearchParams(searchParams);     // manipulates the URL query parameters, ex. '?page=1&query=a
    params.set('page', '1');      // resets the number page to 1

    // console.log(term)
    // setting params string based on the user input, if input is empty, delete it
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // applies the 'pathname' and then adds the 'searchParams'
    replace(`${pathname}?${params.toString()}`);

    // Here's a breakdown of what's happening:

    // ${pathname} is the current path, in your case, "/dashboard/invoices".
    // As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
    // replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, /dashboard/invoices?query=lee if the user searches for "Lee".
    // The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you learned about in the chapter on navigating between pages.

  }, 300)     // added for debouncing

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>

      {/* search input */}
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        // every change is pssed on the handleSearch()
        onChange={(e) => {
          handleSearch(e.target.value)
        }}
        defaultValue={searchParams.get('query')?.toString()}    // keeps the input field in sync with the URL 
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
