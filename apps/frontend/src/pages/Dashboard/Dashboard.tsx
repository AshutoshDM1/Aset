import { Outlet, useLocation } from 'react-router';
import Sidebar from '../../shared/Sidebar/Sidebar';
import DashboardNavbar from '../../shared/DashboardNavbar/DashboardNavbar';
import BottomNav from '../../shared/BottomNav/BottomNav';
import UploadDailog from '@/shared/Sidebar/UploadDailog/UploadDailog';
import { SettingDialog } from '@/shared/Setting/SettingDialog';
import { Button } from '@/components/ui/button';
import { ArrowBigLeftDash } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const isDashboardRoot =
    location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-dvh bg-background flex flex-col lg:flex-row">
      <Sidebar className="hidden lg:flex fixed inset-y-0 left-0" />
      <main className="flex-1 min-h-dvh min-w-0 lg:pl-70 pb-16 lg:pb-0">
        <div className="min-h-dvh flex flex-col">
          <DashboardNavbar />
          {!isDashboardRoot && (
            <div className="block sm:hidden text-sm px-4 pt-4">
              <Button
                onClick={() => {
                  window.history.back();
                }}
                className="rounded-lg"
              >
                <ArrowBigLeftDash /> Back
              </Button>
            </div>
          )}
          <div className="flex-1 p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
      <BottomNav />
      <UploadDailog />
      <SettingDialog />
    </div>
  );
}
