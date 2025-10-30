import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';

// similar to the create invoice but imports a different form, which is from 'edit-form'

// export default async function Page() {

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
//   expecting an array from Promise, where the value are stored in the elements
// fetches the data to be passed on to <Form> as arguments, to pre-populate the form
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
  ]);
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* editing form */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}