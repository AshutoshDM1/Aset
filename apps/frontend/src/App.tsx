import { Route, Routes } from 'react-router';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import SingleFolder from './pages/SingleFolder/SingleFolder';
import Shared from './pages/Shared/Shared';
import Recent from './pages/Recent/Recent';
import Starred from './pages/Starred/Starred';
import Trash from './pages/Trash/Trash';
import MyFiles from './pages/MyFiles/MyFiles';
import DashboardStats from './pages/Dashboard/DashboardStats';
import RequireDashboardAccess from './shared/auth/RequireDashboardAccess';
import FontChanger, { FontInitializer } from './shared/FontChanger/FontChanger';

const FontStudio = import.meta.env.DEV
  ? { FontInitializer, FontChanger }
  : null;

function App() {
  return (
    <>
      {FontStudio && (
        <>
          <FontStudio.FontInitializer />
          <FontStudio.FontChanger />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<RequireDashboardAccess />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardStats />} />
            <Route path="my-files" element={<MyFiles />} />
            <Route path="folder/:folderId" element={<SingleFolder />} />
            <Route path="shared" element={<Shared />} />
            <Route path="recent" element={<Recent />} />
            <Route path="starred" element={<Starred />} />
            <Route path="trash" element={<Trash />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
