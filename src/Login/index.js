import React, { useState, useEffect } from 'react';
import { fetchData } from '../Helpers/externapi';
import { useNavigate } from 'react-router-dom';
import './input.css';

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState();
    const [otp, setOtp] = useState();
    const [disableOtp, setDisableOtp] = useState(true);
    const [disableVerify, setDisableVerify] = useState(true);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isRunning, setIsRunning] = useState(false);
    const [numberError, setNumberError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [guid, setGuid] = useState();
    const [isVerified, setIsVerified] = useState(false);
    const [memberId, setMemberId] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            setIsOtpSent(false);

            if (mobileNumber.length >= 10) {
                setDisableOtp(false);
            }
        }
        
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleOtpSent = async () => {
                
        if (mobileNumber.length === 12) {
            console.log("MO 12: ", mobileNumber, mobileNumber.length);
            const otpResponse = await fetchData('OHOCards/CardNumberorMobileNoVerification', {
                cardNumber: mobileNumber
            });

            if (otpResponse.status) {
                setTimeLeft(120);
                setIsRunning(true);
                setNumberError('');
                setIsOtpSent(true);
                setDisableOtp(true);
                setGuid(otpResponse.guid);
            } else {
                setIsRunning(false);
                setNumberError(otpResponse.message);
            }
        } else if (mobileNumber.length === 10) {            
            const otpResponse = await fetchData('OHOCards/CardNumberorMobileNoVerification', {
                mobileNumber
            });

            console.log("MO 10: ", otpResponse);

            if (otpResponse.status) {
                setTimeLeft(120);
                setIsRunning(true);
                setNumberError('');
                setIsOtpSent(true);
                setDisableOtp(true);
                setGuid(otpResponse.guid);
            } else {
                setIsRunning(false);
                setNumberError(otpResponse.msg);
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

            if (mobileNumber.length === 10) {
                const verifyResponse = await fetchData('Member/OTPValidation', {
                    mobileNumber,
                    otpGenerated: otp,
                    guid
                });

                if (verifyResponse.status) {
                    setIsVerified(true);
                    setMemberId(verifyResponse.memberId);
                    setIsOtpSent(false);

                    navigate('/bookconsultation', {
                        replace: true,
                        state: { memberId: verifyResponse.memberId }
                    });
                } else {
                    setOtpError(verifyResponse.msg);
                }
            } else if (mobileNumber.length === 12) {
                const verifyResponse = await fetchData('Member/OTPValidation', {
                    cardNumber: mobileNumber,
                    otpGenerated: otp,
                    guid
                });

                if (verifyResponse.status) {
                    setIsVerified(true);
                    setMemberId(verifyResponse.memberId);
                    setIsOtpSent(false);

                    navigate('/bookconsultation', {
                        replace: true,
                        state: { memberId: verifyResponse.memberId }
                    });
                } else {
                    setOtpError(verifyResponse.msg);
                }
            }
    };

    const onChangeInput = (e) => {
        e.preventDefault();

        if (e.target.id === 'mobileNumber') {
            if (e.target.value.length <= 12) {
                setMobileNumber(e.target.value);

                if (e.target.value.length >= 10 && !isRunning) {
                    setDisableOtp(false);
                } else {
                    setDisableOtp(true);
                }
            }

        } else {
            if (e.target.value.length <= 6) {
                setOtp(e.target.value);
                if (e.target.value.length === 6) {
                    setDisableVerify(false);
                } else {
                    setDisableVerify(true);
                }
            }
        }
    };

    const returnOtp = () => (
        <div className="card shadow-sm p-2 p-md-3" data-aos="zoom-in">
            <div className="d-flex flex-row justify-content-center align-items-center mb-3">
                <img src="/applogo.png" alt="logo"
                    style={{ height: '50px', width: '50px' }}
                />
                <span className="app-brand-text text-secondary fw-bolder ms-2"
                    style={{ fontSize: '30px' }} >OHOINDIA</span>
            </div>

            <h5 className="text-secondary mb-3 text-center">Verify Customer</h5>            

            <div className="mb-3 text-start">
                <label htmlFor="otp" className="form-label">Enter OTP<span className="text-danger">
                    *</span>
                </label>
                <input type="number" className="form-control p-0" maxLength={6} id="otp" value={otp}
                    style={{ minHeight: '40px' }} min={0} onChange={(e) => onChangeInput(e)}
                />                
            </div>

            <div className='text-start mb-3'>
                {isRunning && (
                    <p className='text-success'>OTP sent successfully. Resend OTP in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
                )}
                {otpError && otpError.length > 0 && (
                    <p className='text-danger'>{otpError}</p>
                )}
            </div>

            <div className='d-flex flex-column justify-content-center'>
                <button type="submit" className="btn btn-primary align-self-center" onClick={(e) => handleVerify(e)}
                    disabled={disableVerify}>Verify
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ backgroundColor: 'rgb(240, 242, 242)', height: '100vh', width: '100vw' }}
        >
            {isOtpSent ? returnOtp() : (

                <div className="card shadow-sm p-2 p-md-3" data-aos="zoom-in">
                    <div className="d-flex flex-row justify-content-center align-items-center mb-3">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '50px', width: '50px' }}
                        />
                        <span className="app-brand-text text-secondary fw-bolder ms-2"
                            style={{ fontSize: '30px' }} >OHOINDIA</span>
                    </div>
                    <h5 className="text-secondary mb-3 text-center">Verify Customer</h5>
                    <form>
                        <div className="text-start">

                            <label htmlFor="mobileNumber" className="form-label">Mobile Number/OHOCard Number<span
                                className="text-danger"> *</span>
                            </label>

                            <div className="d-flex flex-column">
                                <input type="number" className="form-control p-0" maxLength="12"
                                    id="mobileNumber" style={{ minHeight: '40px', minWidth: '350px' }} min={0} value={mobileNumber} onChange={(e) => onChangeInput(e)}
                                />

                                {numberError && numberError.length > 0 && (
                                    <p className='text-danger'>{numberError}</p>
                                )}

                                <button type="button" className="btn btn-primary align-self-center mt-3" disabled={disableOtp}
                                    onClick={handleOtpSent} >Send OTP
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

            )}
        </div>
        
    )
};

export default Login;