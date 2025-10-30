'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';        // revalidation, section 6
import { redirect } from 'next/navigation';         // redirection, section 6
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' }); 
// const sql = postgres(process.env.POSTGRES_URL!, {
//   ssl: "require",
//   prepare: false,
// });

// similar to the datatype of 'Invoice' found in definitions.ts
// type validation and coercion using zod
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    // const rawFormData = {           // before validation and coercion
        
  const { customerId, amount, status } = CreateInvoice.parse({      // after validation and coercion
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
//   converting 'amount' into cents
  const amountInCents = amount * 100;
//   creating new date format
  const date = new Date().toISOString().split('T')[0];

//   INSERTING data into the database through sql
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

//   revalidation, section 6
  revalidatePath('/dashboard/invoices');
//   redirection, section 6
  redirect('/dashboard/invoices');

  // Test it out:
  console.log( customerId, amount, status);
  console.log(typeof amount)
}



// ! for updating data

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({          // validation and coercion
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
//   converting amount into cents
  const amountInCents = amount * 100;
 
//   updating through the database using SQL
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');            // clear cached and make new request
  redirect('/dashboard/invoices');                  // redirect user back to the given links
}


// ! for deleting data

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}