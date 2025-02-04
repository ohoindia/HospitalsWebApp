import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../Helpers/externapi';
import { logToCloudWatch } from '../Helpers/cloudwatchLogger';
import { useSelector, useDispatch } from 'react-redux';
import { setConfigValue } from '../ReduxFunctions/ReduxSlice';

const HospitalValidation = () => {
    const configValues = useSelector((state) => state.configValues);
    const dispatch = useDispatch();

    const [hospitalCode, setHospitalCode] = useState('');
    const [confirmDisable, setConfirmDisable] = useState(true);
    const [confirmLoad, setConfirmLoad] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [hosCodeError, setHosCodeError] = useState('');
    const [logo, setLogo] = useState();

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
        if (!configValues.length > 0) {
            getConfigValues();
        } else {
            const ohoLogo = configValues && configValues.length > 0 && configValues.find(val => val.ConfigKey === "LogoWithoutName");
            setLogo(ohoLogo);
        }
    }, [configValues]);

    const getConfigValues = async () => {
        try {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            dispatch(setConfigValue(response));
        } catch (e) {
            console.error('Error in ConfigValues/all: ', e);
        }
    };

    const onChangeHosCode = (e) => {
        setHospitalCode(e.target.value);

        if (e.target.value.length === 6) {
            setConfirmDisable(false);
        } else {
            setConfirmDisable(true);
        }
    };

    const handleHospitalCode = async (e) => {
        e.preventDefault();

        if (hospitalCode.length === 6) {
            setConfirmLoad(true);
            const hosCodeResponse = await fetchData('Hospital/hospitalLogin', { hospitalCode })

            if (hosCodeResponse.status) {
                const currentTime = new Date().getTime();
                const expirationTime = currentTime + 24 * 60 * 60 * 1000;

                sessionStorage.setItem('hospitalName', hosCodeResponse.hospitalName);
                sessionStorage.setItem('hospitalImage', hosCodeResponse.hospitalImage);
                sessionStorage.setItem('hospitalId', hosCodeResponse.hospitalId);
                sessionStorage.setItem('hospitalTime', expirationTime);

                const getLogStreamName = () => {
                    const today = new Date().toISOString().split('T')[0];
                    return `${hosCodeResponse.hospitalId} (${hosCodeResponse.hospitalName})-${today}`;
                };

                const logGroupName = process.env.REACT_APP_LOGGER;
                const logStreamName = getLogStreamName();

                await logToCloudWatch(logGroupName, logStreamName, {
                    event: 'Hospital Logged In',
                    details: { hospitalName: hosCodeResponse.hospitalName, hospitalId: hosCodeResponse.hospitalId },
                });

                setHosCodeError('');

                navigate('/verify', { replace: true });
            } else {
                setHosCodeError(hosCodeResponse.message);
            }
            setConfirmLoad(false);
        }
    };

    return (
        <div
            className="d-flex flex-column justify-content-start align-items-center"
            style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0E94C3' }}
        >
            <div className="card d-flex flex-column justify-content-center flex-grow-1 align-items-center p-3 pb-5"
                style={{
                    minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                    minHeight: '100vh'
                }}
            >
                <div className="d-flex flex-column align-items-center mb-2 mt-5">
                    {logo ? (
                        <img src={logo.ConfigValue} alt="logo"
                            style={{ height: '60px', width: '60px' }}
                        />
                    ) : (
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    )}

                    <span className="app-brand-text fw-bolder"
                        style={{ fontSize: '25px', color: '#0094c6' }} >OHOINDIA</span>
                </div>

                <form className='mt-3'>
                    <div className="text-start">

                        <div className="d-flex flex-column">
                            <label htmlFor="mobileNumber" className="form-label text-black fw-medium" style={{ fontSize: '14px' }}>Enter Hospital Code
                                {/* <span className="text-danger"> *</span> */}
                            </label>

                            <input type="text" className="ps-2" maxLength="6"
                                id="cardNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                                placeholder='Enter Hospital Code'
                                onChange={(e) => onChangeHosCode(e)}
                            />

                            <div className='d-flex flex-column my-4'>
                                <button type="submit" className="btn btn-primary fw-semibold" style={{ backgroundColor: '#0E94C3', maxHeight: '38px' }}
                                    onClick={(e) => handleHospitalCode(e)} disabled={confirmDisable || confirmLoad}
                                >
                                    {confirmLoad ? (
                                        <div className="spinner-border text-white fs-5" role="status">
                                            {/* <span className="sr-only">Loading...</span> */}
                                        </div>
                                    ) : (
                                        'SUBMIT'
                                    )}
                                </button>
                                {hosCodeError && hosCodeError.length > 0 && (
                                    <p className='text-danger m-0' style={{ maxWidth: '350px' }}>{hosCodeError}</p>
                                )}
                            </div>

                            <hr className='mt-5' />

                            <div className="d-flex flex-column align-items-center mb-2">
                                {logo ? (
                                    <img src={logo.ConfigValue} alt="logo"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                ) : (
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                )}

                                <span className="app-brand-text fw-bolder"
                                    style={{ fontSize: '18px', color: '#0094c6' }} >OHOINDIA</span>
                                <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                                <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                                <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                                    style={{ color: '#0E94C3' }}>Privacy Policy</a>
                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </div>
    )
};

export default HospitalValidation;