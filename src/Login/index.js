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
    const [isFlipped, setIsFlipped] = useState(false);
    const hospitalName = sessionStorage.getItem('hospitalName');
    const hospitalLogo = sessionStorage.getItem('hospitalImage');
    const [hospitalImage, setHospitalImage] = useState('');
    const [remainingOtp, setRemainingOtp] = useState();

    const inputsRef = useRef([]);

    useEffect(() => {
        const getMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "hospitalImagesURL");
            setHospitalImage(imageUrl.ConfigValue + hospitalLogo);
        };

        getMocUrl();
    }, []);

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

    const handleChange = (value, index) => {
        if (!isNaN(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
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

            if (otpResponse) {
                if (otpResponse.status) {
                    setTimeLeft(120);
                    setIsRunning(true);
                    setNumberError('');
                    setDisableOtp(true);
                    setGuid(otpResponse.guid);
                    setOtpLoading(false);
                    setMobileNumber(otpResponse.mobileNumber);
                    setRemainingOtp(otpResponse.remainingAttempts);
                    if (isOtpSent) {
                        setResendOtp(true);
                    } else {
                        setIsOtpSent(true);
                    }
                } else {
                    setIsRunning(false);
                    setNumberError(otpResponse.message);
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

            if (otpResponse) {
                if (otpResponse.status) {
                    setTimeLeft(120);
                    setIsRunning(true);
                    setNumberError('');
                    setDisableOtp(true);
                    setGuid(otpResponse.guid);
                    setOtpLoading(false);
                    setMobileNumber(otpResponse.mobileNumber);
                    setRemainingOtp(otpResponse.remainingAttempts);
                    if (isOtpSent) {
                        setResendOtp(true);
                    } else {
                        setIsOtpSent(true);
                    }
                } else {
                    setIsRunning(false);
                    setNumberError(otpResponse.message);
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

        if (mobileNumber.length === 10) {
            setVerifyLoading(true);
            const verifyResponse = await fetchData('Member/OTPValidation', {
                mobileNumber,
                otpGenerated: otp.join(''),
                guid
            });

            if (verifyResponse.status) {
                const currentTime = new Date().getTime();
                const expirationTime = currentTime + 10 * 60 * 1000;

                setIsVerified(true);
                setMemberId(verifyResponse.memberId);
                setIsOtpSent(false);
                setVerifyLoading(false);
                sessionStorage.setItem('memberId', verifyResponse.memberId);
                sessionStorage.setItem('memberTime', expirationTime);

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

            if (verifyResponse.status) {
                const currentTime = new Date().getTime();
                const expirationTime = currentTime + 10 * 60 * 1000;

                setIsVerified(true);
                setMemberId(verifyResponse.memberId);
                setIsOtpSent(false);
                setVerifyLoading(false);
                sessionStorage.setItem('memberId', verifyResponse.memberId);
                sessionStorage.setItem('memberTime', expirationTime);

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
            style={{
                minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                minHeight: '100vh'
            }}
        >
            {hospitalName || hospitalImage ? (
                <div className="d-flex flex-column align-items-center mb-2 mt-5">
                    {hospitalImage && (
                        <img src={hospitalImage} alt="logo"
                            style={{ maxHeight: '100px', maxWidth: '100px' }}
                        />
                    )}

                    {hospitalName && (
                        <span className="app-brand-text fw-bolder text-center"
                            style={{ fontSize: '20px', color: '#041F60' }} >{hospitalName}</span>
                    )}
                </div>
            ) : (
                <div className="d-flex flex-column align-items-center mb-2 mt-5">
                    <img src="/applogo.png" alt="logo"
                        style={{ maxHeight: '60px', maxWidth: '60px' }}
                    />
                    <span className="app-brand-text fw-bolder"
                        style={{ fontSize: '25px', color: '#041F60' }} >OHOINDIA</span>
                </div>
            )}

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
                            style={{ backgroundColor: '#0E94C3', minWidth: '320px', maxHeight: '38px' }}>
                            {otpLoading ? (
                                <div className="spinner-border text-white fs-5" role="status">
                                    {/* <span className="sr-only">Loading...</span> */}
                                </div>
                            ) : (<>
                                RESEND OTP <i className="bi bi-chevron-right fw-bolder"></i></>
                            )}                            
                        </button>
                        {numberError && numberError.length > 0 && (
                            <p className='text-danger'>{numberError}</p>
                        )}
                    </div>

                    {remainingOtp && (
                        <span className='text-center'>Maxium of {remainingOtp} times more left</span>
                    )}

                    <div className="d-flex flex-column align-items-center mt-auto mb-2">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                        <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                            style={{ color: '#0E94C3'}}>Privacy Policy</a>
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

                    <div className='d-flex flex-column justify-content-center'>
                        <button type="submit" className="btn btn-primary" onClick={(e) => handleVerify(e)}
                            disabled={disableVerify || verifyLoading} style={{ backgroundColor: '#0E94C3', minWidth: '320px', maxHeight: '38px' }}
                        >
                            {verifyLoading ? (
                                <div className="spinner-border text-white fs-5" role="status">
                                    {/* <span className="sr-only">Loading...</span> */}
                                </div>
                            ) : (<>
                                Verify  <i className="bi bi-chevron-right fw-bolder"></i></>
                            )}
                        </button>
                        {otpError && otpError.length > 0 && (
                            <p className='text-danger'>{otpError}</p>
                        )}
                    </div>

                    <div className="d-flex flex-column align-items-center mt-auto mb-2">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                        <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                        <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                            style={{ color: '#0E94C3'}}>Privacy Policy</a>
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
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                        minHeight: '100vh'
                    }}
                >
                    {hospitalName || hospitalImage ? (
                        <div className="d-flex flex-column align-items-center mb-2 mt-5">
                            {hospitalImage && (
                                <img src={hospitalImage} alt="logo"
                                    style={{ maxHeight: '100px', maxWidth: '100px' }}
                                />
                            )}

                            {hospitalName && (
                                <span className="app-brand-text fw-bolder text-center"
                                    style={{ fontSize: '20px', color: '#041F60' }} >{hospitalName}</span>
                            )}
                        </div>
                    ) : (
                        <div className="d-flex flex-column align-items-center mb-2 mt-5">
                            <img src="/applogo.png" alt="logo"
                                style={{ maxHeight: '60px', maxWidth: '60px' }}
                            />
                            <span className="app-brand-text fw-bolder"
                                style={{ fontSize: '25px', color: '#041F60' }} >OHOINDIA</span>
                        </div>
                    )}

                    <h5 className="text-secondary mb-2 text-center fw-bold" style={{ fontSize: '16px' }}>OHOINDIA MEMBERSHIP VERIFICATION</h5>
                    <form className='mt-3'>
                        <div className="text-start">

                            <div className="d-flex flex-column">
                                <label htmlFor="mobileNumber" className="form-label text-black fw-medium" style={{ fontSize: '14px' }}>Enter OHO Card Number
                                    {/* <span className="text-danger"> *</span> */}
                                </label>

                                <input type="text" className="ps-2" maxLength="14"
                                    id="cardNumber" style={{ minHeight: '35px', minWidth: '350px' }}
                                    placeholder='Enter OHOCard Number'
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
                                    placeholder='Enter Mobile Number'
                                    min={0} value={mobileNumber}
                                    onChange={(e) => onChangeInput(e)}
                                />

                                <div className='d-flex flex-column my-4'>
                                    <button type="button" className="btn btn-primary fw-semibold" style={{ backgroundColor: '#0E94C3', maxHeight: '38px' }} disabled={disableOtp}
                                        onClick={handleOtpSent} >
                                        {otpLoading ? (
                                            <div className="spinner-border text-white fs-5" role="status">
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
                                    <span style={{ fontSize: '14px' }}>OHO card number shown as below</span>
                                    <div
                                        style={{
                                            width: "330px", height: "200px", margin: "10px",
                                            perspective: "1000px", borderRadius: "5px",
                                        }}
                                        onClick={() => setIsFlipped(!isFlipped)}
                                    >
                                        <div
                                            style={{
                                                position: "relative", width: "100%", height: "100%",
                                                textAlign: "center", transition: "transform 0.6s", transformStyle: "preserve-3d",
                                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            {/* Front Side */}
                                            <div
                                                style={{
                                                    position: "absolute", width: "100%", height: "100%",
                                                    backfaceVisibility: "hidden", borderRadius: "10px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <img
                                                    src={"https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg"}
                                                    alt="Front side"
                                                    style={{ width: "100%", height: "100%" }}
                                                />
                                                {/* Card Number Overlay */}
                                                <p className='border border-3 border-danger'
                                                    style={{
                                                        position: "absolute", bottom: "8px", left: "26px",
                                                        color: "white", fontSize: "1.1rem",
                                                        padding: "5px 10px", borderRadius: "5px"
                                                    }}
                                                >
                                                    2804 XXXX XX29
                                                </p>
                                            </div>

                                            {/* Back Side */}
                                            <div
                                                style={{
                                                    position: "absolute", width: "100%", height: "100%",
                                                    backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                                                    borderRadius: "10px", overflow: "hidden"
                                                }}
                                            >
                                                <img
                                                    src={
                                                        "https://ohoindia-mous.s3.ap-south-1.amazonaws.com/3b56a6e5-41ca-4049-a882-02a3d14e1d78.jpg"
                                                    }
                                                    alt="Back side"
                                                    style={{ width: "100%", height: "100%"}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className='d-flex flex-column align-items-center'>
                                    <span style={{ fontSize: '12px' }}>OHO card number shown as below</span>
                                    <div style={{
                                        width: '300px', height: '180px', borderRadius: '10px',
                                        backgroundImage: 'url(https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg)',
                                        backgroundSize: 'cover'
                                    }}>
                                        <p className='border border-3 border-danger' style={{
                                            fontSize: '1rem', color: 'white', width: '125px',
                                            textShadow: '1px 1px 2px black', marginTop: '140px', marginLeft: '30px'
                                        }}>
                                            2804 XXXX XX29
                                        </p>
                                    </div>
                                </div> */}

                                <hr className='mt-5' />

                                <div className="d-flex flex-column align-items-center mb-2">
                                    <img src="/applogo.png" alt="logo"
                                        style={{ height: '40px', width: '40px' }}
                                    />
                                    <span className="app-brand-text fw-bolder"
                                        style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                                    <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                                    <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                                    <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                                        style={{ color: '#0E94C3'}}>Privacy Policy</a>
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