import { CustomerForm } from "@/features/customers/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Customer</h1>
        <p className="text-forge-muted-foreground mt-1">
          Create a new customer profile in Forge
        </p>
      </div>
      <CustomerForm />
    </div>
  );
}
