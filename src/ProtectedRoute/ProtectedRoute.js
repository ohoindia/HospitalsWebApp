import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = () => {
    const navigate = useNavigate();
    const hospitalTime = sessionStorage.getItem('hospitalTime');
    const memberTime = sessionStorage.getItem('memberTime');    

    React.useEffect(() => {
        const currentTime = new Date().getTime();

        if (!hospitalTime) {
            navigate("/", { replace: true });
        } else if (currentTime >= parseInt(hospitalTime, 10)) {
            sessionStorage.clear();
            navigate("/", { replace: true });
        } else if (!memberTime) {
            navigate("/verify", { replace: true });
        } else if (memberTime && currentTime < parseInt(memberTime, 10)) {
            navigate("/bookconsultation", { replace: true });
        } else if (memberTime && currentTime >= parseInt(memberTime, 10)) {
            sessionStorage.removeItem('memberId');
            sessionStorage.removeItem('memberTime');
            navigate("/verify", { replace: true });
        }
    }, [hospitalTime, memberTime, navigate]);

    return <Outlet />;
};


export default ProtectedRoute;
