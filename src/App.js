// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import JewelGrid from "./components/JewelGrid";
import SimilarJewelsPage from "./components/SimilarJewelsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JewelGrid />} />
        <Route path="/jewel/:jewelId" element={<SimilarJewelsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
