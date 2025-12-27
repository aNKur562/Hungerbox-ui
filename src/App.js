import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import './App.css';
import AuthContainer from './components/AuthContainer';
import TimeOutCounter from './components/TimeOutCounter';
import FoodCourt from './components/FoodCourt';
import MainCafe from './components/MainCafe';
import Profile from './components/Profile';

function App() {

  return (
   <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<AuthContainer />} />
          <Route path="/home" element={<Home />} />
          <Route path="/food/timeout" element={<TimeOutCounter />} />
          <Route path="/food/foodcourt" element={<FoodCourt />} />
          <Route path="/food/maincafe" element={<MainCafe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;