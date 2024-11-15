import logo from './logo.svg';
import './App.css';
import Login from './Login/index';
import Home from './Home/index';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/bookconsultation" element={<Home />} />
          </Routes>
      </Router>

      //<Home />
  );
}

export default App;
