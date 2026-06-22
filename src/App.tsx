import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Seeds from '@/pages/Seeds';
import Chemicals from '@/pages/Chemicals';
import Sales from '@/pages/Sales';
import Credit from '@/pages/Credit';
import Collection from '@/pages/Collection';
import Registration from '@/pages/Registration';
import Settings from '@/pages/Settings';
import SeedingCalendar from '@/pages/SeedingCalendar';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/seeds" element={<Seeds />} />
          <Route path="/chemicals" element={<Chemicals />} />
          <Route path="/seeding-calendar" element={<SeedingCalendar />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/credit" element={<Credit />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
