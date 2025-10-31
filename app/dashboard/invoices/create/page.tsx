import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';

import { Metadata } from 'next';    // added in chapter 16

export const metadata: Metadata = {
  title: "Create Invoice"
}

 
// added in chapter 12, mutating data

export default async function Page() {
    // fetches all customers from the database
  const customers = await fetchCustomers();
 
  return (
    <main>
        {/* for navigation */}
      <Breadcrumbs
        breadcrumbs={[      // passed as an array of object
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />

      {/* for the data input */}
      <Form customers={customers} />
    </main>
  );
}