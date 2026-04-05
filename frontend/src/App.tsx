import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AddCandidate from './components/AddCandidate/AddCandidate';
import DashboardHome from './components/Dashboard/DashboardHome';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/candidates/new" element={<AddCandidate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
