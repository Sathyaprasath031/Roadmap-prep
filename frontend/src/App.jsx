import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Roadmaps from './pages/Roadmaps';
import RoadmapDetail from './pages/RoadmapDetail';
import Questions from './pages/Questions';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import CommunityRoadmaps from './pages/CommunityRoadmaps';
import ProgressReport from './pages/ProgressReport';
import Review from './pages/Review';
import Flashcards from './pages/Flashcards';
import FocusMode from './pages/FocusMode';
import Notes from './pages/Notes';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen theme-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/community" element={<CommunityRoadmaps />} />
            <Route path="/report" element={<ProgressReport />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/review" element={<Review />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/focus" element={<FocusMode />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
