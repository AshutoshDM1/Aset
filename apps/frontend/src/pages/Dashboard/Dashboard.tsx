import { Outlet } from 'react-router';
import Sidebar from '../../shared/Sidebar/Sidebar';
import DashboardNavbar from '../../shared/DashboardNavbar/DashboardNavbar';

export default function Dashboard() {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar className="fixed inset-y-0 left-0" />
      <main className="min-h-dvh min-w-0 pl-[280px]">
        <div className="min-h-dvh">
          <DashboardNavbar />
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
