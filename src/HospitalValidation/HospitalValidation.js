import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../Helpers/externapi';

const HospitalValidation = () => {
    const [hospitalCode, setHospitalCode] = useState('');
    const [confirmDisable, setConfirmDisable] = useState(true);
    const [confirmLoad, setConfirmLoad] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [hosCodeError, setHosCodeError] = useState('');

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

                setHosCodeError('');

                navigate('/verify', { replace: true });
            } else {
                setHosCodeError(hosCodeResponse.message);
            }
            setConfirmLoad(false);

            console.log("hosCodeResponse: ", hosCodeResponse);

        }
    }

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
                    <img src="/applogo.png" alt="logo"
                        style={{ height: '60px', width: '60px' }}
                    />
                    <span className="app-brand-text fw-bolder"
                        style={{ fontSize: '25px', color: '#041F60' }} >OHOINDIA</span>
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
                                <img src="/applogo.png" alt="logo"
                                    style={{ height: '40px', width: '40px' }}
                                />
                                <span className="app-brand-text fw-bolder"
                                    style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                                <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                                <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </div>
    )
};

export default HospitalValidation;