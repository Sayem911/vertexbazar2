// src/app/admin/page.tsx
export default function AdminDashboard() {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Total Products" value="120" />
          <DashboardCard title="Total Sales" value="$15,230" />
          <DashboardCard title="Pending Orders" value="25" />
          <DashboardCard title="Active Redeem Codes" value="50" />
        </div>
      </div>
    );
  }
  
  function DashboardCard({ title, value }: { title: string; value: string }) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-3xl font-bold text-blue-600">{value}</p>
      </div>
    );
  }