import { Route, Routes } from 'react-router';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import AllFiles from './pages/AllFiles/AllFiles';
import SingleFolder from './pages/SingleFolder/SingleFolder';
import Shared from './pages/Shared/Shared';
import Recent from './pages/Recent/Recent';
import Starred from './pages/Starred/Starred';
import Trash from './pages/Trash/Trash';
import RequireDashboardAccess from './shared/auth/RequireDashboardAccess';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<RequireDashboardAccess />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<AllFiles />} />
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
