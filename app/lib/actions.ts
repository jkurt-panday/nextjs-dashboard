'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';        // revalidation, section 6
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' }); 
// const sql = postgres(process.env.POSTGRES_URL!, {
//   ssl: "require",
//   prepare: false,
// });

// similar to the datatype of 'Invoice' found in definitions.ts
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
        
  const { customerId, amount, status } = CreateInvoice.parse({
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


  // Test it out:
  console.log( customerId, amount, status);
  console.log(typeof amount)
}