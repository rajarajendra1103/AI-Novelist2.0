import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import NovelOverview from './pages/NovelOverview';
import ChapterEditor from './pages/ChapterEditor';
import CharacterHub from './pages/CharacterHub';
import WorldBuilder from './pages/WorldBuilder';
import Timeline from './pages/Timeline';
import SceneSystem from './pages/SceneSystem';



import { useStory } from './context/StoryContext';

function App() {
  const { novelData } = useStory();

  return (
    <div className="app-container">
      {novelData && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/overview" element={novelData ? <NovelOverview /> : <Navigate to="/home" />} />
          <Route path="/chapter/:id" element={novelData ? <ChapterEditor /> : <Navigate to="/home" />} />
          <Route path="/characters" element={novelData ? <CharacterHub /> : <Navigate to="/home" />} />
          <Route path="/world" element={novelData ? <WorldBuilder /> : <Navigate to="/home" />} />
          <Route path="/timeline" element={novelData ? <Timeline /> : <Navigate to="/home" />} />
          <Route path="/scenes" element={novelData ? <SceneSystem /> : <Navigate to="/home" />} />



        </Routes>
      </main>
    </div>
  );
}

export default App;
