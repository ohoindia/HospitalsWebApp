import React, { useState, useEffect } from 'react';
import { fetchData } from '../Helpers/externapi';
import { formatDate } from '../CommonFunctions/CommonFunctions';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [hosAppointments, setHosAppointments] = useState();
    const [hospitalImage, setHospitalImage] = useState('');

    const hospitalId = sessionStorage.getItem('hospitalId');
    const hospitalName = sessionStorage.getItem('hospitalName');
    const hospitalLogo = sessionStorage.getItem('hospitalImage');
    const navigate = useNavigate();

    console.log("hosAppointments: ", hosAppointments);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const getMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "hospitalImagesURL");
            setHospitalImage(imageUrl.ConfigValue + hospitalLogo);
        };

        getMocUrl();
        fetchHospitalAppointments();
    }, [])

    const fetchHospitalAppointments = async () => {
        try {
            const getHosAppoinments = await fetchData('BookingConsultation/ConsultationListByHospitalId', {
                skip: 0, take: 0, HospitalId: hospitalId
            });

            setHosAppointments(getHosAppoinments.data);
        } catch (e) {
            console.error('Error fetching BookingConsultation/ConsultationListByHospitalId: ', e);
        }
    };

    return (
        <div className="d-flex flex-column justify-content-start align-items-center"
            style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0E94C3' }}
        >
            <div className="card"
                style={{
                    minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                    minHeight: '100vh', position: 'relative'
                }}
            >
                <div
                    style={{
                        position: 'sticky',
                        top: '20px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}
                >
                    <button
                        style={{
                            backgroundColor: '#0E94C3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '30px',
                            width: '150px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            marginLeft: '20px',
                            cursor: 'pointer',
                            zIndex: 1000,
                        }}
                        onClick={() => navigate('/verify')}
                    >
                        Membership Verification
                    </button>
                </div>

                {hospitalName || hospitalImage ? (
                    <div className="d-flex flex-column align-items-center mb-2 sticky-top"
                        style={{
                            minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%'
                        }}
                    >
                        {hospitalImage && (
                            <img src={hospitalImage} alt="logo"
                                style={{ maxHeight: '100px', maxWidth: '100px' }}
                            />
                        )}

                        {hospitalName && (
                            <span className="app-brand-text fw-bolder text-center"
                                style={{ fontSize: '20px', color: '#041F60' }} >{hospitalName}</span>
                        )}

                        <h5 className="text-secondary mt-3 text-center fw-bold" style={{ fontSize: '16px' }}>CONSULTATION LIST</h5>
                    </div>
                ) : (
                    <div className="d-flex flex-column align-items-center mb-2 mt-5"
                        style={{
                            minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%'
                        }}
                    >
                        <img src="/applogo.png" alt="logo"
                            style={{ maxHeight: '60px', maxWidth: '60px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '25px', color: '#041F60' }} >OHOINDIA</span>
                        <h5 className="text-secondary mt-3 text-center fw-bold" style={{ fontSize: '16px' }}>CONSULTATION LIST</h5>
                    </div>
                )}

                <div className='d-flex flex-column px-3 px-md-5 my-4'
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '75%'
                    }}
                >
                    {hosAppointments && hosAppointments.length > 0 && hosAppointments.map(app => (
                        <div className='d-flex flex-column shadow-sm p-2 px-3 mb-4'>
                            <div className='d-flex flex-row justify-content-between'>
                                <h6>{app.Name}</h6>
                                <span>{formatDate(app.AppointmentDate)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default Customers;