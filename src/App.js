import logo from './logo.svg';
import './App.css';
import Login from './Login/index';
import Home from './Home/index';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HospitalValidation from './HospitalValidation/HospitalValidation';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import Customers from './Customers/Customers';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HospitalValidation />} />
                <Route path="/customerslist" element={<Customers />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/verify" element={<Login />} />                    
                    <Route path="/bookconsultation" element={<Home />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
