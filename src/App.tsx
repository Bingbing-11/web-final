import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/layout/AuthGuard';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import GuidePage from './features/auth/GuidePage';
import WorldHub from './features/world/WorldHub';
import WorldCreate from './features/world/WorldCreate';
import WorldDetail from './features/world/WorldDetail';
import WorldSettings from './features/world/WorldSettings';
import TemplePage from './features/world/TemplePage';
import PermissionsPage from './features/world/PermissionsPage';
import EntryEditor from './features/entry/EntryEditor';
import EntryDetail from './features/entry/EntryDetail';
import EntryList from './features/entry/EntryList';
import BurnView from './features/entry/BurnView';
import BurnMode from './features/entry/BurnMode';
import TimeMachine from './features/timecapsule/TimeMachine';
import FriendList from './features/social/FriendList';
import FriendManagement from './features/social/FriendManagement';
import ResonancePage from './features/social/ResonancePage';
import SettingsPage from './features/settings/SettingsPage';
import EditProfilePage from './features/settings/EditProfilePage';
import HelpPage from './features/settings/HelpPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<WorldHub />} />
            <Route path="/timecapsule" element={<TimeMachine />} />
            <Route path="/friends" element={<FriendList />} />
            <Route path="/friends/manage" element={<FriendManagement />} />
            <Route path="/resonance" element={<ResonancePage />} />
            <Route path="/entries" element={<EntryList />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/world/create" element={<WorldCreate />} />
            <Route path="/world/:id" element={<WorldDetail />} />
            <Route path="/world/:id/settings" element={<WorldSettings />} />
            <Route path="/world/:id/temple" element={<TemplePage />} />
            <Route path="/world/:id/permissions" element={<PermissionsPage />} />
            <Route path="/world/:worldId/entry/new" element={<EntryEditor />} />
            <Route path="/world/:worldId/entry/:entryId/edit" element={<EntryEditor />} />
            <Route path="/entry/:id" element={<EntryDetail />} />
            <Route path="/entry/:id/burn" element={<BurnView />} />
            <Route path="/burn" element={<BurnMode />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
