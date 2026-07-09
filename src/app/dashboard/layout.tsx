import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[25%] h-[25%] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>
      <DashboardNavbar />
      <DashboardSidebar />
      <main className="lg:pl-64 pt-16 min-h-screen">{children}</main>
    </div>
  );
}
