import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HospitalValidation = () => {
    const [hospitalCode, setHospitalCode] = useState('');
    const [confirmDisable, setConfirmDisable] = useState(true);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

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

    const handleHospitalCode = () => {
        if (hospitalCode.length === 6) {
            navigate('/verify', {replace: true});
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
                                <button type="button" className="btn btn-primary fw-semibold" style={{ backgroundColor: '#0E94C3' }} 
                                    onClick={handleHospitalCode} disabled={confirmDisable}
                                >
                                    CONFIRM
                                </button>
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