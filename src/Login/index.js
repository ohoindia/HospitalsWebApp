import React, { useState, useEffect, useRef } from 'react';
import { fetchData } from '../Helpers/externapi';
import { useNavigate } from 'react-router-dom';
import './input.css';

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    // const [otp, setOtp] = useState();
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
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendOtp, setResendOtp] = useState(false);    
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const inputsRef = useRef([]);

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

    const navigate = useNavigate();

    // Handle input change
    const handleChange = (value, index) => {
        if (!isNaN(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            console.log("newOtp: ", newOtp.join('').length);
            setOtp(newOtp);

            if (newOtp.join('').length < 6) {
                setDisableVerify(true);
            } else {
                setDisableVerify(false);
            }

            // Move focus to the next input if a valid digit is entered
            if (value && index < 5) {
                inputsRef.current[index + 1].focus();
            }
        }
    };

    // Handle key events (Backspace)
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];

            // If current box is not empty, clear it
            if (newOtp[index]) {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                // If current box is empty, move to the previous box
                inputsRef.current[index - 1].focus();
            }
        }
    };

    // Handle paste functionality
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);

        if (!isNaN(pastedData)) {
            const newOtp = [...otp]; // Copy existing OTP
            pastedData.split("").forEach((char, i) => {
                if (i < newOtp.length) {
                    newOtp[i] = char; // Fill only the starting boxes
                }
            });

            if (pastedData.length === 6) {
                setDisableVerify(false);
            };
            setOtp(newOtp);

            // Focus on the first empty box or the last box if all are filled
            const firstEmptyIndex = newOtp.findIndex((char) => char === "");
            inputsRef.current[firstEmptyIndex !== -1 ? firstEmptyIndex : 5].focus();
        }
    };

    useEffect(() => {
        let timer;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            setResendOtp(false);
            setOtp(new Array(6).fill(""));
            setOtpError('');

            if (mobileNumber.length >= 10) {
                setDisableOtp(false);
            }
        }

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleOtpSent = async () => {
        if (cardNumber.length === 14) {
            setOtpLoading(true);

            const otpResponse = await fetchData('OHOCards/CardNumberorMobileNoVerification', {
                cardNumber: cardNumber
            });

            console.log("card Res: ", otpResponse, {
                cardNumber: cardNumber
            });

            if (otpResponse) {
                if (otpResponse.status) {
                    setTimeLeft(120);
                    setIsRunning(true);
                    setNumberError('');
                    setDisableOtp(true);
                    setGuid(otpResponse.guid);
                    setOtpLoading(false);
                    setMobileNumber(otpResponse.mobileNumber)
                    if (isOtpSent) {
                        setResendOtp(true);
                    } else {
                        setIsOtpSent(true);
                    }
                } else {
                    setIsRunning(false);
                    setNumberError(otpResponse.msg);
                    setOtpLoading(false);
                }
            } else {
                setNumberError('Sorry, something went wrong. Please contact support team.');
                setOtpLoading(false);
            }
        } else if (mobileNumber.length === 10) {
            setOtpLoading(true);
            const otpResponse = await fetchData('OHOCards/CardNumberorMobileNoVerification', {
                mobileNumber
            });

            console.log("number Res: ", otpResponse, {
                mobileNumber
            });

            if (otpResponse) {
                if (otpResponse.status) {
                    setTimeLeft(120);
                    setIsRunning(true);
                    setNumberError('');
                    setDisableOtp(true);
                    setGuid(otpResponse.guid);
                    setOtpLoading(false);
                    setMobileNumber(otpResponse.mobileNumber)
                    if (isOtpSent) {
                        setResendOtp(true);
                    } else {
                        setIsOtpSent(true);
                    }
                } else {
                    setIsRunning(false);
                    setNumberError(otpResponse.msg);
                    setOtpLoading(false);
                }
            } else {
                setNumberError('Sorry, something went wrong. Please contact support team.');
                setOtpLoading(false);
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        console.log("Comming in verify", mobileNumber, cardNumber);

        if (mobileNumber.length === 10) {
            setVerifyLoading(true);
            const verifyResponse = await fetchData('Member/OTPValidation', {
                mobileNumber,
                otpGenerated: otp.join(''),
                guid
            });

            console.log("Veri: ", verifyResponse);

            if (verifyResponse.status) {
                setIsVerified(true);
                setMemberId(verifyResponse.memberId);
                setIsOtpSent(false);
                setVerifyLoading(false);

                navigate('/bookconsultation', {
                    replace: true,
                    state: { memberId: verifyResponse.memberId }
                });
            } else {
                setOtpError(verifyResponse.msg);
                setVerifyLoading(false);
            }
        } else if (cardNumber.length === 14) {
            setVerifyLoading(true);
            const verifyResponse = await fetchData('Member/OTPValidation', {
                cardNumber: cardNumber,
                otpGenerated: otp.join(''),
                guid
            });

            console.log("Veri: ", verifyResponse, {
                cardNumber: cardNumber,
                otpGenerated: otp.join(''),
                guid
            });

            if (verifyResponse.status) {
                setIsVerified(true);
                setMemberId(verifyResponse.memberId);
                setIsOtpSent(false);
                setVerifyLoading(false);

                navigate('/bookconsultation', {
                    replace: true,
                    state: { memberId: verifyResponse.memberId }
                });
            } else {
                setOtpError(verifyResponse.msg);
                setVerifyLoading(false);
            }
        }
    };

    const onChangeInput = (e) => {
        e.preventDefault();

        const { id, value } = e.target;

        if (id === "mobileNumber") {
            if (value.length <= 10) {
                setMobileNumber(value);
                setCardNumber("");

                if (value.length === 10 && !isRunning) {
                    setDisableOtp(false);
                } else {
                    setDisableOtp(true);
                }
            }
        } else if (id === "cardNumber") {
            if (value.length <= 14) {
                // Format card number dynamically
                const formattedValue = value
                    .replace(/\s/g, "") // Remove existing spaces
                    .match(/.{1,4}/g) // Break into chunks of 4
                    ?.join(" ") || ""; // Add spaces and handle empty string

                setCardNumber(formattedValue);
                setMobileNumber("");

                if (formattedValue.replace(/\s/g, "").length === 12 && !isRunning) {
                    setDisableOtp(false);
                } else {
                    setDisableOtp(true);
                }
            }
        } else {
            if (value.length <= 6) {
                setOtp(value);
                if (value.length === 6) {
                    setDisableVerify(false);
                } else {
                    setDisableVerify(true);
                }
            }
        }
    };

    const returnOtp = () => (
        <div className="card d-flex flex-column justify-content-center align-items-center p-3 py-5" 
            style={{minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                minHeight: '100vh'}}
        >
            <div className="d-flex flex-column align-items-center mb-2">
                <img src="/applogo.png" alt="logo"
                    style={{ height: '60px', width: '60px' }}
                />
                <span className="app-brand-text fw-bolder"
                    style={{ fontSize: '25px', color: '#041F60' }} >OHOINDIA</span>
            </div>

            {timeLeft <= 0 ? (
                <>
                    <h5 className='my-3 fw-bold'>OTP TIMED OUT</h5>
                    <div className='d-flex flex-row justify-content-between align-items-center my-3' style={{ minWidth: '320px' }}>
                        <div>
                            <span>Registered Mobile number is</span>
                            {mobileNumber && mobileNumber.length > 0 && (
                                <h6>+91 - {mobileNumber.slice(0, 3)}XXXX{mobileNumber.slice(7, 11)}</h6>
                            )}
                        </div>
                    </div>

                    <div className='d-flex flex-column justify-content-center'>
                        <button type="submit" className="btn btn-primary" onClick={(e) => handleOtpSent(e)}
                            style={{ backgroundColor: '#0E94C3', minWidth: '320px' }}>
                            RESEND OTP <i className="bi bi-chevron-right fw-bolder"></i>
                        </button>
                    </div>

                    <div className="d-flex flex-column align-items-center mt-auto mb-2">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                    </div>
                </>
            ) : (
                <>
                    <div className='d-flex flex-row justify-content-between align-items-center my-3' style={{ minWidth: '320px' }}>
                        <div>
                            <span>OTP Sent to Mobile number</span>
                            {mobileNumber && mobileNumber.length > 0 && (
                                <h6>+91 - {mobileNumber.slice(0, 3)}XXXX{mobileNumber.slice(7, 11)}</h6>
                            )}
                        </div>
                        <span className='border border-1 border-success rounded-pill p-2'>{timeLeft}</span>
                    </div>

                    <div className="mb-3 d-flex flex-column justify-content-start" style={{ minWidth: '320px' }}>
                        <label htmlFor="otp" className="form-label">Enter One time password (OTP)
                            {/* <span className="text-danger">*</span> */}
                        </label>
                        {/* <input type="number" className="form-control p-0" maxLength={6} id="otp" value={otp}
                            style={{ minHeight: '40px' }} min={0} onChange={(e) => onChangeInput(e)}
                        /> */}

                        <div style={{ display: "flex", gap: "14px" }} onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        textAlign: "center",
                                        fontSize: "1.5rem",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='text-start mb-3'>
                        {/* {isRunning && (
                    <p className='text-success'>OTP sent successfully. Resend OTP in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
                    )} */}
                        {otpError && otpError.length > 0 && (
                            <p className='text-danger'>{otpError}</p>
                        )}
                    </div>

                    <div className='d-flex flex-column justify-content-center'>
                        <button type="submit" className="btn btn-primary" onClick={(e) => handleVerify(e)}
                            disabled={disableVerify} style={{ backgroundColor: '#0E94C3', minWidth: '320px' }}
                        >
                            {verifyLoading ? (
                                <div className="spinner-border text-white" role="status">
                                    {/* <span className="sr-only">Loading...</span> */}
                                </div>
                            ) : (<>
                                Verify  <i className="bi bi-chevron-right fw-bolder"></i></>
                            )}
                        </button>
                    </div>

                    <div className="d-flex flex-column align-items-center mt-auto mb-2">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                        <span className='fw-semibold mt-3' style={{color: '#0E94C3', fontSize: '13px'}}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div
            className="d-flex flex-column justify-content-start align-items-center"
            style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0E94C3' }}
        >
            {isOtpSent ? returnOtp() : (
                <div className="card d-flex flex-column justify-content-center flex-grow-1 align-items-center p-3 pb-5"
                    style={{minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
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
                    <h5 className="text-secondary mb-2 text-center fw-bold" style={{ fontSize: '16px' }}>MEMBERSHIP VERIFICATION</h5>
                    <form className='mt-3'>
                        <div className="text-start">

                            <div className="d-flex flex-column">
                                <label htmlFor="mobileNumber" className="form-label text-black fw-medium" style={{ fontSize: '14px' }}>Enter OHO Card Number
                                    {/* <span className="text-danger"> *</span> */}
                                </label>

                                <input type="text" className="ps-2" maxLength="14"
                                    id="cardNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                                    placeholder='XXXX XXXX XXXX'
                                    min={0} value={cardNumber}
                                    onChange={(e) => onChangeInput(e)}
                                />

                                <p className='text-center text-secondary my-2' style={{ fontSize: '12px' }}>
                                    -------------------- <span className='mx-3'>OR Enter </span> --------------------
                                </p>

                                <label htmlFor="mobileNumber" className="form-label text-black fw-medium" style={{ fontSize: '14px' }}>Registered Mobile Number
                                    {/* <span className="text-danger"> *</span> */}
                                </label>

                                <input type="number" className=" ps-2" maxLength="12"
                                    id="mobileNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                                    placeholder='XXXXXXXXXX'
                                    min={0} value={mobileNumber}
                                    onChange={(e) => onChangeInput(e)}
                                />

                                <div className='d-flex flex-column my-4'>
                                    <button type="button" className="btn btn-primary fw-semibold" style={{ backgroundColor: '#0E94C3' }} disabled={disableOtp}
                                        onClick={handleOtpSent} >
                                        {otpLoading ? (
                                            <div className="spinner-border text-white" role="status">
                                                {/* <span className="sr-only">Loading...</span> */}
                                            </div>
                                        ) : (<>
                                            SUBMIT  <i className="bi bi-chevron-right fw-bolder"></i></>
                                        )}

                                    </button>

                                    {numberError && numberError.length > 0 && (
                                        <p className='text-danger'>{numberError}</p>
                                    )}
                                </div>

                                <hr className='mt-5' />

                                <div className='d-flex flex-column align-items-center'>
                                    <span style={{ fontSize: '12px' }}>OHO card number shown as below</span>
                                    <div style={{
                                        width: '300px', height: '180px',
                                        backgroundImage: 'url(https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg)',
                                        backgroundSize: 'cover'
                                    }}>
                                        <p style={{
                                            fontSize: '1rem', color: 'white',
                                            textShadow: '1px 1px 2px black', marginTop: '135px', marginLeft: '30px'
                                        }}>
                                            2804 XXXX XX29
                                        </p>
                                    </div>
                                </div>

                                <hr className='mt-5' />

                                <div className="d-flex flex-column align-items-center mb-2">
                                    <img src="/applogo.png" alt="logo"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                    <span className="app-brand-text fw-bolder"
                                        style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                                    <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                                    <span className='fw-semibold mt-3' style={{color: '#0E94C3', fontSize: '13px'}}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                                </div>

                            </div>
                        </div>

                    </form>
                </div>
            )}
        </div>
    )
};

export default Login;