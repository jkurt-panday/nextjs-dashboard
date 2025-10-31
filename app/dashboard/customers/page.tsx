import { Metadata } from 'next';    // added in chapter 16

export const metadata: Metadata = {
  title: "Customers"
}

export default function Page() {
  return <p>Customers Page</p>;
}