
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import { PersonalizedDashboard as Dashboard } from './pages/PersonalizedDashboardClean';
import CareersPage from './pages/CareersPage';
import Recommendations from './pages/Recommendations';
import StreamRecommendations from './pages/StreamRecommendations';
import NearbyCollegesMap from './pages/NearbyCollegesMap';
import CareerInsightsSimple from './pages/CareerInsightsSimple';
import CareerInsightsPortal from './pages/CareerInsightsPortal';
import AIPsychometricTest from './pages/AIPsychometricTest';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/stream-recommendations" element={<StreamRecommendations />} />
        <Route path="/nearby-colleges-map" element={<NearbyCollegesMap />} />
        <Route path="/career-insights" element={<CareerInsightsSimple />} />
        <Route path="/career-insights-portal/:streamId" element={<CareerInsightsPortal />} />
        <Route path="/quiz" element={<AIPsychometricTest />} />
        <Route path="/ai-assessment" element={<AIPsychometricTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
