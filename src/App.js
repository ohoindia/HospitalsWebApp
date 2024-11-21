import logo from './logo.svg';
import './App.css';
import Login from './Login/index';
import Home from './Home/index';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HospitalValidation from './HospitalValidation/HospitalValidation';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HospitalValidation />} />
                <Route path="/verify" element={<Login />} />
                <Route path="/bookconsultation" element={<Home />} />
            </Routes>
        </Router>

        //<Home />
    );
}

export default App;
