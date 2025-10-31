import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';        // the table is handled as 'alias'
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';    // added in chapter 11
import { Metadata } from 'next';  // added in chapter 16, adding metadata

export const metadata: Metadata = {
  title: "Invoices"
}
 
export default async function Page( props: {
  searchParams?: Promise<{          // added in chapter 11, searchParams is an object
    query?: string; 
    page?: string; }>;
}) {

    const searchParams = await props.searchParams;
    // extracts the value associated with the 'query' key from the 'searchParam' object
    const query = searchParams?.query || "";        // ?.   = is optional chaining, might be null
    // extracts the value associated with the 'page' key
    const currentPage = Number(searchParams?.page) || 1;        // added in chapter 11
    const totalPages = await fetchInvoicesPages(query);     // returns the total number of pages based on the search query

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* // ! search input */}
        <Search placeholder="Search invoices..." />
        {/* // ! invoice button */}
        <CreateInvoice />
      </div>
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>

       {/* // table that contains the invoices together with the customer  */}
        <Table query={query} currentPage={currentPage} />

      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}