import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <DashboardSidebar />
      <main className="lg:pl-64 pt-16 min-h-screen">{children}</main>
    </div>
  );
}
