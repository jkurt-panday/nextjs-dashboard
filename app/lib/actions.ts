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
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',    // chapter 14, server validation section, a friendly message
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),     // a friendly message 
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string(),
});

// ! State
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// export async function createInvoice(formData: FormData) {    // changed in chapter 14
export async function createInvoice(prevState: State, formData: FormData) {
  // prevState - contains the state passed from the useActionState hook. You won't be using it in the action in this example, but it's a required prop.

    // const rawFormData = {           // before validation and coercion
        
  // const { customerId, amount, status } = CreateInvoice.parse({      // after validation and coercion, changed after chapter 14
  


// safeParse() will return an object containing either a success or error field. This will help handle validation more gracefully without having put this logic inside the try/catch block.

  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early, otherwise continue, added in chapter 14
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.'
    }
  }

  // Prepare data for insertion into the database, added in chapter 14
  const { customerId, amount, status } = validatedFields.data;

//   converting 'amount' into cents
  const amountInCents = amount * 100;
//   creating new date format
  const date = new Date().toISOString().split('T')[0];

  try {
//   INSERTING data into the database through sql
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.log(error);
    return { message: 'Database Error: Failed to Create Invoice.', };           // use this if you're using chapter 14 method
    // throw new Error( 'Database Error: Failed to Create Invoice' );          // use this instead of the one above
  }

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
 
  try {
//   updating through the database using SQL
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  } catch (error) {
    console.log(error);
    // return { message: 'Database Failure: Failed to Update Invoice', };
    throw new Error( 'Database Failure: Failed to Update Invoice' );
  }
 
  revalidatePath('/dashboard/invoices');            // clear cached and make new request
  redirect('/dashboard/invoices');                  // redirect user back to the given links
}


// ! for deleting data

export async function deleteInvoice(id: string) {
    // error simulation
    throw new Error('Failed to Delete Invoice')

    // if the throw error is active, the next piece of code is inaccessible
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}