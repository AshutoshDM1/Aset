import { Outlet } from 'react-router';
import Sidebar from '../../shared/Sidebar/Sidebar';
import DashboardNavbar from '../../shared/DashboardNavbar/DashboardNavbar';
import BottomNav from '../../shared/BottomNav/BottomNav';
import UploadDailog from '@/shared/Sidebar/UploadDailog/UploadDailog';
import { SettingDialog } from '@/shared/Setting/SettingDialog';
import { BulkActionBar } from '@/shared/Dashboard/BulkActionBar';

export default function Dashboard() {
  return (
    <div className="min-h-dvh bg-background flex flex-col lg:flex-row">
      <Sidebar className="hidden lg:flex fixed inset-y-0 left-0" />
      <main className="flex-1 min-h-dvh min-w-0 lg:pl-70 pb-16 lg:pb-0">
        <div className="min-h-dvh flex flex-col">
          <DashboardNavbar />
          <div className="flex-1 p-3 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
      <BottomNav />
      <UploadDailog />
      <SettingDialog />
      <BulkActionBar />
    </div>
  );
}
