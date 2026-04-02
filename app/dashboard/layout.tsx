import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { getCategories } from "@/actions/category";
import { getTransactions } from "@/actions/transaction";
import { requireDivision } from "@/lib/auth-utils";
import { processDueRecurringTransactions } from "@/actions/recurring";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireDivision();
  } catch (error) {
    redirect("/unassigned");
  }

  // System Hook: Process delayed/due schedules securely
  await processDueRecurringTransactions(user.divisionId);

  const catRes = await getCategories();
  const initialCategories = catRes.success && catRes.data ? catRes.data : [];

  const txRes = await getTransactions();
  const initialTransactions = txRes.success && txRes.data ? txRes.data : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar userName={user.username || "Administrator"} globalRole={user.globalRole} />
      <CategoryProvider initialCategories={initialCategories}>
        <TransactionProvider initialTransactions={initialTransactions as any}>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </TransactionProvider>
      </CategoryProvider>
    </div>
  );
}

