import React, { useState, useEffect } from 'react';
import { fetchData } from '../Helpers/externapi';
import { formatDate } from '../CommonFunctions/CommonFunctions';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setConfigValue, setHospitalImage } from '../ReduxFunctions/ReduxSlice';

const Customers = () => {
    const configValues = useSelector((state) => state.configValues);
    const hospitalImage = useSelector((state) => state.hospitalImage);
    const dispatch = useDispatch();

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [hosAppointments, setHosAppointments] = useState();
    const [Loading, setLoading] = useState(true);

    const hospitalId = sessionStorage.getItem('hospitalId');
    const hospitalName = sessionStorage.getItem('hospitalName');
    const hospitalLogo = sessionStorage.getItem('hospitalImage');
    const navigate = useNavigate();

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
        fetchHospitalAppointments();
    }, [])

    useEffect(() => {
        if (!configValues.length > 0) {
            getConfigValues();
        } else {
            if (!hospitalImage.length > 0) {
                const imageUrl = configValues && configValues.length > 0 && configValues.find(val => val.ConfigKey === "hospitalImagesURL");
                dispatch(setHospitalImage(imageUrl.ConfigValue + hospitalLogo))
            }
        }
    }, [configValues, hospitalImage]);

    const getConfigValues = async () => {
        try {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            dispatch(setConfigValue(response));
        } catch (e) {
            console.error('Error in ConfigValues/all: ', e);
        }
    };

    const fetchHospitalAppointments = async () => {
        try {
            setLoading(true);
            const getHosAppoinments = await fetchData('BookingConsultation/ConsultationListByHospitalId', {
                skip: 0, take: 0, HospitalId: hospitalId
            });

            setHosAppointments(getHosAppoinments.data);
        } catch (e) {
            console.error('Error fetching BookingConsultation/ConsultationListByHospitalId: ', e);
        } finally {
            setLoading(false);
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
                        zIndex: 2
                    }}
                >
                    <button
                        style={{
                            backgroundColor: '#0E94C3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            marginLeft: '20px',
                            cursor: 'pointer'
                        }}
                        className='fw-semibold p-2 px-3'
                        onClick={() => navigate('/verify')}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Back
                    </button>
                </div>

                {hospitalName || hospitalImage ? (
                    <div className="d-flex flex-column align-items-center mb-2 sticky-top bg-white"
                        style={{
                            minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                            zIndex: 1
                        }}
                    >
                        {hospitalLogo && hospitalImage && (
                            <img src={hospitalImage} alt=""
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

                {Loading ? (
                    <div className='d-flex flex-row justify-content-center pt-5'>
                        <div class="spinner-border text-info" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className='d-flex flex-column px-3 px-md-5 my-4'
                        style={{
                            minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '75%'
                        }}
                    >
                        {hosAppointments && hosAppointments.length > 0 ? hosAppointments.map(app => (
                            <div className='d-flex flex-column shadow-sm p-2 px-3 mb-4'>
                                <div className='d-flex flex-row justify-content-between align-items-center'>
                                    <div>
                                        <h6 className='m-0'>{app.Name}</h6>
                                        {app.ServiceName && app.ServiceName.length > 0 && (
                                            <div className='d-flex flex-row justify-content-start align-items-center'>
                                                <span className='me-1'>{app.ServiceName}</span>
                                                {app.DoctorName && app.DoctorName.length > 0 && (
                                                    <span>(Dr. {app.DoctorName})</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span>{formatDate(app.AppointmentDate)}</span>
                                </div>

                            </div>
                        )) : <span className='text-danger text-center fw-semibold fs-5'>No Customers till the date.</span>}
                    </div>
                )}
            </div>
        </div>
    )
};

export default Customers;