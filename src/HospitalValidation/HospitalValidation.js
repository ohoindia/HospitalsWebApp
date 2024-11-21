import React, { useEffect, useState } from 'react';

const HospitalValidation = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

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

                            <input type="text" className="ps-2" maxLength="14"
                                id="cardNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                                placeholder='XXXXXXXX'
                            />

                            <p className='text-center text-secondary my-2' style={{ fontSize: '12px' }}>
                                -------------------- <span className='mx-3'>OR Select </span> --------------------
                            </p>

                            <label htmlFor="mobileNumber" className="form-label text-black fw-medium" style={{ fontSize: '14px' }}>Select Your Hospital
                                {/* <span className="text-danger"> *</span> */}
                            </label>

                            <input type="number" className=" ps-2" maxLength="12"
                                id="mobileNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                            />


                            

                            <div className='d-flex flex-column my-4'>
                                <button type="button" className="btn btn-primary fw-semibold" style={{ backgroundColor: '#0E94C3' }} >
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