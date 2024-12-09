import React, { useEffect, useState } from 'react';
import { Checkmark } from 'react-checkmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { fetchAllData, fetchData } from '../Helpers/externapi';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Login/input.css';
import { format } from 'date-fns';
import { formatDate } from '../CommonFunctions/CommonFunctions';

const Home = () => {
    const [memberDetails, setMemberDetails] = useState();
    const [dependents, setDependents] = useState();
    const [isformOpen, setIsformOpen] = useState(false);
    const [formData, setFormData] = useState({
        FullName: '', MobileNumber: '', Cardnumber: '', Gender: '', DateofBirth: '', Age: '', Address: '',
        DateAndTime: '', DoctorName: '', ServiceType: ''
    });
    const [formErrors, setFormErrors] = useState({ DateAndTime: '', ServiceType: ''});
    const [eligibilityMessage, setEligibilityMessage] = useState();
    const [formSuccessMessage, setFormSuccessMessage] = useState();
    const [isDiscountedPercentVisible, setIsDiscountedPercentVisible] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [isFlipped, setIsFlipped] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState();
    const [displayCoupons, setDisplayCoupons] = useState(false);
    const [isBookingSuccess, setIsBookingSuccess] = useState(false);
    const [hospitalImage, setHospitalImage] = useState('');
    const [serviceTypes, setServiceTYpes] = useState([]);    
    const [previousAppointments, setPreviousAppointments] = useState();

    const navigate = useNavigate();
    const location = useLocation();
    const memberId = sessionStorage.getItem('memberId');
    const hospitalId = sessionStorage.getItem('hospitalId');
    const hospitalName = sessionStorage.getItem('hospitalName');
    const hospitalLogo = sessionStorage.getItem('hospitalImage');    

    // const memberId = 25587;
    console.log("PREV Appp: ", previousAppointments);

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
        const fetchMemberDetails = async () => {
            const responseMemberDetails = await fetchAllData(`OHOCards/GetMemberDetailsId/${memberId}`);
            setMemberDetails(responseMemberDetails);
            setIsDataFetched(true);
            responseMemberDetails && responseMemberDetails.length > 0 && (
                setFormData((preVal) => ({
                    ...preVal, FullName: responseMemberDetails[0].FullName, MobileNumber: responseMemberDetails[0].MobileNumber, Cardnumber: responseMemberDetails[0].OHOCardNumber,
                    Gender: responseMemberDetails[0].Gender, DateofBirth: formatDate(responseMemberDetails[0].DateofBirth), Age: calculateAge(responseMemberDetails[0].DateofBirth),
                    Address: responseMemberDetails[0].AddressLine1
                }))
            )
        };

        const fetchDependents = async () => {
            const responseDependents = await fetchAllData(`MemberDependent/GetByMemberId/${memberId}`);
            setDependents(responseDependents);
        };

        const getMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "hospitalImagesURL");
            setHospitalImage(imageUrl.ConfigValue + hospitalLogo);
        };

        const fetchServiceTypes = async () => {
            const getServiceTypes = await fetchData("HospitalServices/all", {skip: 0, take: 0});
            setServiceTYpes(getServiceTypes);
        };

        getMocUrl();
        fetchMemberDetails();
        fetchDependents();
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        if (memberDetails && memberDetails.length > 0) {
            const inputDate = memberDetails[0].EndDate;
            const today = new Date();
            const parsedInputDate = new Date(inputDate);

            setIsValid(parsedInputDate > today);
        }
    }, [memberDetails])

    function calculateAge(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const monthDifference = today.getMonth() - dob.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    };

    const onChangeHandler = (e) => {

        if (e.target.name === 'FullName') {
            memberDetails[0].FullName === e.target.value ? (
                setFormData((preVal) => ({
                    ...preVal, FullName: memberDetails[0].FullName, MobileNumber: memberDetails[0].MobileNumber, Cardnumber: memberDetails[0].OHOCardNumber,
                    Gender: memberDetails[0].Gender, DateofBirth: formatDate(memberDetails[0].DateofBirth), Age: calculateAge(memberDetails[0].DateofBirth),
                    Address: memberDetails[0].AddressLine1
                }))
            ) : dependents.map(each => (
                each.fullName === e.target.value && (
                    setFormData((preVal) => ({
                        ...preVal, FullName: each.fullName, Gender: each.gender, DateofBirth: formatDate(each.dateofBirth), Age: calculateAge(each.dateofBirth),
                    }))
                )
            ))

            setFormData(preVal => ({
                ...preVal, [e.target.name]: e.target.value
            }))

        } else if (e.target.name === 'ServiceType') {
            setFormData(preVal => ({
                ...preVal, [e.target.name]: parseInt(e.target.value)
            }))
            if (e.target.value.length > 0) {
                setFormErrors(preVal => ({
                    ...preVal, [e.target.name]: ''
                }))
            }
        } else {
            setFormData(preVal => ({
                ...preVal, [e.target.name]: e.target.value
            }))
            if (e.target.value.length > 0) {
                setFormErrors(preVal => ({
                    ...preVal, [e.target.name]: ''
                }))
            }
        }
    };

    const formateDatabaseDatetime = (inp) => {
        const date = new Date(inp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const onChangeDateTime = (e) => {
        const dateStr = e.toString();

        const date = formateDatabaseDatetime(dateStr.slice(0, 24));

        if (date.length > 0) {
            setFormErrors(preVal => ({
                ...preVal, DateAndTime: ''
            }))
        }

        setFormData(preVal => ({
            ...preVal, DateAndTime: date
        }))
    };

    const checkErrors = () => {
        if (formData.DateAndTime === '' ||
            formData.ServiceType.length < 2 || formData.Appointment === '') {

            if (formData.DateAndTime === '') {
                setFormErrors(preVal => ({
                    ...preVal, DateAndTime: 'Please select appointment date & time *'
                }))
            }
            // if (formData.HospitalName.length < 2) {
            //     setFormErrors(preVal => ({
            //         ...preVal, HospitalName: 'Please Enter valid hospital name *'
            //     }))
            // }
            // if (formData.Branch.length < 2) {
            //     setFormErrors(preVal => ({
            //         ...preVal, Branch: 'Please Enter valid branch name *'
            //     }))
            // }
            if (formData.ServiceType.length < 2) {
                setFormErrors(preVal => ({
                    ...preVal, ServiceType: 'Please Enter servicetype *'
                }))
            }
            // if (formData.Appointment === '') {
            //     setFormErrors(preVal => ({
            //         ...preVal, Appointment: 'Please select appoointment type *'
            //     }))
            // }
        } else {
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const noError = checkErrors();

        if (noError) {
            const payload = {
                name: formData.FullName,
                mobileNumber: formData.MobileNumber,
                cardNumber: formData.Cardnumber,
                gender: formData.Gender,
                dateofBirth: formateDatabaseDatetime(formData.DateofBirth),
                age: formData.Age,
                appointmentDate: formData.DateAndTime,
                address: formData.Address,
                hospitalName: hospitalName,
                hospitalId: hospitalId,
                serviceTypeId: formData.ServiceType,
                memberId: memberId,
                doctorName: formData.DoctorName
            };

            setSubmitLoading(true);

            const responseEligible = await fetchData(`BookingConsultation/bookAppointment/add`, { ...payload });

            if (responseEligible.status) {
                setFormSuccessMessage(responseEligible.message);
                setEligibilityMessage('');
                setSubmitLoading(false);
                setIsBookingSuccess(true);

                setFormErrors({
                    DateAndTime: '', ServiceType: ''
                });

                setTimeout(() => {
                    setFormData(preVal => ({
                        ...preVal, DateAndTime: '', DoctorName: '', ServiceType: ''
                    }));

                    setIsformOpen(false);
                    setDisplayCoupons(false);
                    setIsBookingSuccess(false);
                    setEligibilityMessage('');
                    setFormSuccessMessage('');

                    getAvailableCoupons();
                }, 3000);
            } else if (responseEligible.message) {
                setEligibilityMessage(responseEligible.message);
                setFormSuccessMessage('');
                setSubmitLoading(false);
            } else {
                setEligibilityMessage('Sorry, Your appointment haven`t booked.');
                setFormSuccessMessage('');
                setSubmitLoading(false);
            }

        } else {
            setEligibilityMessage('');
            setFormSuccessMessage('');
        }
    };

    const handleReset = (e) => {
        e.preventDefault();

        setFormData(preVal => ({
            ...preVal, DateAndTime: '', HospitalName: '', Branch: '', DoctorName: '', ServiceType: '', Appointment: '',
            DiscountPercentage: 0.0, ConsultationFee: 0
        }));

        setFormErrors({
            DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: ''
        })
    };

    const handleCancel = () => {
        setFormData(preVal => ({
            ...preVal, DateAndTime: '', HospitalName: '', Branch: '', DoctorName: '', ServiceType: '', Appointment: '',
            DiscountPercentage: 0.0, ConsultationFee: 0
        }));
        setFormErrors('');
        setIsformOpen(false);
        setEligibilityMessage('');
        setFormSuccessMessage('');
        setFormErrors({
            DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: ''
        })
    };

    const getAvailableCoupons = async () => {
        const fetchAvailableCoupons = await fetchData('BookingConsultation/checkAvailableCoupons', {
            cardNumber: memberDetails[0].OHOCardNumber,
            hospitalId
        });

        if (fetchAvailableCoupons && fetchAvailableCoupons.status) {
            setAvailableCoupons(fetchAvailableCoupons.availableCoupons);
        }
    };

    const fetchPreviousAppointments = async (payload) => {
        const getPrevAppointments = await fetchData('BookingConsultation/CustomerConsultationListByHospitalId', {...payload});
        console.log("getPrevAppointments: ", getPrevAppointments);

        setPreviousAppointments(getPrevAppointments.data);
    };

    const bookAppointment = async (data, value) => {
        getAvailableCoupons();

        console.log("MEM: ", data);

        if (value === 'member') {
            setFormData((preVal) => ({
                ...preVal, FullName: data[0].FullName, MobileNumber: data[0].MobileNumber, Cardnumber: data[0].OHOCardNumber,
                Gender: data[0].Gender, DateofBirth: formatDate(data[0].DateofBirth), Age: calculateAge(data[0].DateofBirth),
                Address: data[0].AddressLine1
            }))

            await fetchPreviousAppointments({ "skip":0, "take":0, "HospitalId":hospitalId,
                "MemberDependentId": 0, "MemberId": data[0].CardPurchasedMemberId})

            setDisplayCoupons(true);
        } else {
            setFormData((preVal) => ({
                ...preVal, FullName: data.fullName, Gender: data.gender, DateofBirth: formatDate(data.dateofBirth), Age: calculateAge(data.dateofBirth),
            }))

            setDisplayCoupons(true);
        }

        const currDate = formateDatabaseDatetime(new Date());

        setFormData(preVal => ({
            ...preVal, DateAndTime: currDate
        }))
    };

    const goBackToLogin = () => {
        const isConfirmed = window.confirm("Are you sure, You want to go back for Member Verification?");
        if (isConfirmed) {
            sessionStorage.removeItem('memberId');
            sessionStorage.removeItem('memberTime')
            navigate('/verify', {
                replace: true,
            });
        }
    };

    const returnDetails = () => {
        return (
            <div className="d-flex flex-column justify-content-start align-items-center"
                style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0E94C3' }}
            >
                <div className="card d-flex flex-column justify-content-start align-items-center p-3 py-5"
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                        minHeight: '100vh', position: 'relative'
                    }}
                >
                    <Checkmark size='medium' />
                    <h5 className="text-black m-2 text-center fw-bold" style={{ fontSize: '18px' }}>OHOINDIA MEMBERSHIP VERIFICATION SUCCESS !</h5>

                    {isDataFetched && (
                        <>
                            <div className='d-flex flex-column p-2 my-3 border rounded' style={{ backgroundColor: '#e8ebe9', minWidth: '350px' }}>
                                <div className='d-flex flex-row justify-content-between' style={{ minWidth: '350px' }}>
                                    <div className='d-flex flex-column align-items-center'>
                                        <span>Status</span>
                                        {isValid ? (
                                            <span className='d-flex flex-row align-items-center fw-semibold'>
                                                <FontAwesomeIcon icon={faCircle} className='me-2' style={{ color: "#04d928", fontSize: "20px" }} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className='d-flex flex-row align-items-center fw-semibold'>
                                                <FontAwesomeIcon icon={faCircle} className='me-2' style={{ color: "red", fontSize: "20px" }} />
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    <div className='d-flex flex-column align-items-center'>
                                        <span>{isValid ? 'Valid till' : 'Expired On'}</span>
                                        <span className='fw-semibold'>
                                            {memberDetails && formatDate(memberDetails[0].EndDate)}
                                        </span>
                                    </div>
                                </div>
                                <p className='mt-2 m-0'><strong>Address: </strong> {memberDetails && memberDetails[0].AddressLine1}</p>
                            </div>

                            <h5 className='fw-bold'>SELECT FAMILY MEMBER</h5>

                            <ul className='mt-3 list-unstyled'>
                                <li className='d-flex flex-row justify-content-between align-items-center border border-2 rounded px-2 py-1'
                                    style={{ minWidth: '350px', cursor: 'pointer' }}
                                    key={memberDetails && memberDetails[0].CardPurchasedMemberId}
                                    onClick={() => bookAppointment(memberDetails, 'member')}
                                >
                                    <div>
                                        <p className='m-0 fw-bold'>{memberDetails && memberDetails[0].FullName}</p>
                                        <span>{memberDetails && memberDetails[0].Gender} | {memberDetails && calculateAge(memberDetails[0].DateofBirth)} years | 
                                            <span className='fw-bold' style={{color: '#0E94C3'}}> ( </span>Self<span className='fw-bold' style={{color: '#0E94C3'}}> ) </span></span>
                                    </div>

                                    <i className="bi bi-chevron-right fw-bolder"></i>
                                </li>

                                {dependents && dependents.length > 0 && dependents.map(each => (
                                    <li className='d-flex flex-row justify-content-between align-items-center border border-2 rounded p-2 mt-2'
                                        style={{ minWidth: '350px', cursor: 'pointer' }}
                                        key={each.memberDependentId}
                                        onClick={() => bookAppointment(each, 'dependent')}
                                    >
                                        <div>
                                            <p className='m-0 fw-bold'>{each.fullName}</p>
                                            <span>{each.gender} | {calculateAge(each.dateofBirth)} years | 
                                            <span className='fw-bold' style={{color: '#0E94C3'}}> ( </span>{each.relationship && each.relationship}<span className='fw-bold' style={{color: '#0E94C3'}}> ) </span></span>
                                        </div>

                                        <i className="bi bi-chevron-right fw-bolder"></i>
                                    </li>
                                ))}
                            </ul>

                            <div className='d-flex flex-column mt-5'>
                                <div
                                    style={{
                                        width: "350px", height: "200px", margin: "10px",
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
                                        <div
                                            style={{
                                                position: "absolute", width: "100%", height: "100%",
                                                backfaceVisibility: "hidden", borderRadius: "10px",
                                                overflow: "hidden"
                                            }}
                                        >
                                            <img
                                                src={"https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg"}
                                                alt="Front side"
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                            <p
                                                style={{
                                                    position: "absolute", bottom: "15px", left: "40px",
                                                    color: "white", fontSize: "1.1rem"
                                                }}
                                            >
                                                {memberDetails && memberDetails[0].OHOCardNumber}
                                            </p>
                                        </div>

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
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className='d-flex flex-row justify-content-center align-items-center bg-success text-white fw-semibold rounded'
                                style={{ backgroundColor: '#0E94C3', minWidth: '350px', minHeight: '30px', cursor: 'pointer' }}
                                onClick={() => goBackToLogin()}
                            >
                                <i className="bi bi-x-lg me-2"></i>
                                <span>CLOSE</span>
                            </div>

                            <p className='text-center fw-semibold mt-3'>Need any support ?</p>
                            <div className='d-flex flex-row mb-4 fw-semibold' style={{ fontSize: '15px' }}>
                                <a className='me-3' href="tel:+917671997108" style={{ textDecoration: 'none', color: '#0E94C3' }}>
                                    <i className="bi bi-telephone"></i>
                                    +91 7671 997 108
                                </a>
                                <a className='ms-3' href="tel:+917671997108" style={{ textDecoration: 'none', color: '#0E94C3' }}>
                                    <i className="bi bi-telephone"></i>
                                    +91 7032 107 108
                                </a>
                            </div>

                            <div className="d-flex flex-column align-items-center mb-2">
                                <img src="/applogo.png" alt="logo"
                                    style={{ height: '40px', width: '40px' }}
                                />
                                <span className="app-brand-text fw-bolder"
                                    style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                                <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                                <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                                    style={{ color: '#0E94C3' }}>Privacy Policy</a>
                            </div>
                        </>
                    )}

                    <div
                        style={{
                            position: 'sticky',
                            bottom: '30px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '100%',
                        }}
                    >
                        <button
                            style={{
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: windowSize.width < 576 ? '50px' : '60px',
                                height: windowSize.width < 576 ? '50px' : '60px',
                                backgroundColor: '#0E94C3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                zIndex: 1000, // Ensures it stays above the content
                            }}
                            onClick={() => goBackToLogin()}
                        >
                            <i className="bi bi-house-door me-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        isBookingSuccess ? (
            <div className="d-flex flex-column justify-content-start align-items-center" style={{ minHeight: '100vh', minWidth: '350px', backgroundColor: '#0E94C3' }}>
                <div className="card d-flex flex-column justify-content-center align-items-center p-3 py-3"
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                        minHeight: '100vh', position: 'relative'
                    }}
                >
                    <Checkmark />

                    {formSuccessMessage && formSuccessMessage.length > 0 && <p className='text-success text-center fs-5 p-3'>{formSuccessMessage}</p>}
                </div>
            </div>
        ) : isformOpen ? (
            <div className="d-flex flex-column justify-content-start align-items-center" style={{ minHeight: '100vh', minWidth: '350px', backgroundColor: '#0E94C3' }}>
                <div className="card d-flex flex-column justify-content-center align-items-center p-3 py-3"
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                        minHeight: '100vh', position: 'relative'
                    }}
                >
                    <div
                        style={{
                            position: 'sticky',
                            top: '30px',
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
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                zIndex: 1000, // Ensures it stays above the content
                            }}
                            onClick={handleCancel}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    </div>

                    {hospitalName || hospitalImage ? (
                        <div className="d-flex flex-column align-items-center mb-2 mt-3">
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

                    <div className="p-3 text-start">

                        <h4 className='mb-5 text-center'>Free Booking Consultation for <br />
                            <span style={{ color: '#0E94C3' }} className='fs-5 text-success'>{formData.FullName}</span>
                        </h4>

                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className='f-flex flex-column align-items-start' style={{ minWidth: '350px' }}>

                                <div className="d-flex flex-column mb-3">
                                    <label htmlFor="flatpickr-datetime" className="form-control-label">
                                        Consultation Date &amp; Time<span className="text-danger"> *</span>
                                    </label>
                                    <Flatpickr
                                        className="form-control"
                                        placeholder="YYYY-MM-DD HH:MM"
                                        id="flatpickr-datetime"
                                        name="DateAndTime"
                                        value={formData.DateAndTime}
                                        onChange={(e) => onChangeDateTime(e)}
                                        options={{
                                            enableTime: true,
                                            dateFormat: "Y-m-d H:i",
                                            time_24hr: false,
                                            minDate: format(new Date(), "yyyy-MM-dd")
                                        }}
                                    />
                                    {formErrors && formErrors.DateAndTime.length > 0 && <p className='text-danger m-0'>{formErrors.DateAndTime}</p>}
                                </div>

                                {/* <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Hospital Name<span className="text-danger"> *</span>
                                    </label>
                                    <input type="text" name="HospitalName" className="form-control" placeholder="Enter Hospital Name"
                                        value={formData.HospitalName} onChange={(e) => onChangeHandler(e)}
                                    />
                                    {formErrors && formErrors.HospitalName.length > 0 && <p className='text-danger m-0'>{formErrors.HospitalName}</p>}
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Branch
                                    </label>
                                    <input type="text" name="Branch" className="form-control" placeholder="Enter Branch Name"
                                        value={formData.Branch} onChange={(e) => onChangeHandler(e)} />
                                </div> */}

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">Doctor Name</label>
                                    <input type="text" name="DoctorName" className="form-control" placeholder="Enter Doctor Name"
                                        value={formData.DoctorName} onChange={(e) => onChangeHandler(e)} />
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Servive Type<span className="text-danger"> *</span>
                                    </label>
                                    {/* <input type="text" name="ServiceType" className="form-control" placeholder="Ex: Orthopedic"
                                        value={formData.ServiceType} onChange={(e) => onChangeHandler(e)} /> */}
                                    <select name="ServiceType" className="form-control" placeholder="Ex: Orthopedic"
                                        value={formData.ServiceType} onChange={(e) => onChangeHandler(e)}>
                                            <option>--- SELECT ---</option>
                                            {serviceTypes && serviceTypes.length > 0 && serviceTypes.map(type => (
                                                <option key={type.HospitalServicesId} value={type.HospitalServicesId}>{type.ServiceName}</option>
                                            ))}
                                    </select>
                                    {formErrors && formErrors.ServiceType.length > 0 && <p className='text-danger m-0'>{formErrors.ServiceType}</p>}
                                </div>

                                {/* <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Appointment<span className="text-danger"> *</span>
                                    </label>
                                    <div className="d-flex flex-column">
                                        <div className="form-check me-3">
                                            <input className="form-check-input" name="Appointment" type="radio" id="FreeConsultation"
                                                checked={formData.Appointment === 'FreeConsultation'} onChange={(e) => onChangeHandler(e)} />
                                            <label className="form-check-label" htmlFor="FreeConsultation">Free Consultation</label>
                                        </div>
                                        <div className="form-check me-3">
                                            <input className="form-check-input" name="Appointment" type="radio" id="DiscountedConsultation"
                                                checked={formData.Appointment === 'DiscountedConsultation'} onChange={(e) => onChangeHandler(e)} />
                                            <label className="form-check-label" htmlFor="DiscountedConsultation">Discounted Consultation</label>
                                        </div>
                                        <div className="form-check me-3">
                                            <input className="form-check-input" name="Appointment" type="radio" id="DiscountedPharmacy"
                                                checked={formData.Appointment === 'DiscountedPharmacy'} onChange={(e) => onChangeHandler(e)} />
                                            <label className="form-check-label" htmlFor="DiscountedPharmacy">Discounted Pharmacy</label>
                                        </div>
                                        <div className="form-check me-3">
                                            <input className="form-check-input" name="Appointment" type="radio" id="DiscountedInvestigation"
                                                checked={formData.Appointment === 'DiscountedInvestigation'} onChange={(e) => onChangeHandler(e)} />
                                            <label className="form-check-label" htmlFor="DiscountedInvestigation">Discounted Investigation</label>
                                        </div>
                                    </div>
                                    {formErrors && formErrors.Appointment.length > 0 && <p className='text-danger m-0'>{formErrors.Appointment}</p>}
                                </div> */}

                                {isDiscountedPercentVisible && (
                                    <>
                                        <div className="d-flex flex-column mb-3">
                                            <label className="form-control-label">Discount Percentage %</label>
                                            <input type="number" min="0" max="100" name="DiscountPercentage" className="form-control"
                                                placeholder="Enter Discount percentage" value={formData.DiscountPercentage} onChange={(e) => onChangeHandler(e)} />
                                        </div>

                                        <div className="d-flex flex-column mb-3">
                                            <label className="form-control-label">Consultation Fee (Rs)</label>
                                            <input type="number" min="0" max="100000" name="ConsultationFee" className="form-control"
                                                placeholder="Enter Consultation Fee" value={formData.ConsultationFee} onChange={(e) => onChangeHandler(e)} />
                                        </div>
                                    </>
                                )}

                            </div>
                            <div className="text-center">
                                <button type="button" className="btn btn-secondary me-1" onClick={(e) => handleCancel(e)}>Cancel</button>
                                <button type="button" className="btn btn-danger me-1" onClick={(e) => handleReset(e)}>Reset</button>
                                <button type="submit" className="btn btn-success" style={{ width: '80px', height: '40px' }}>
                                    {submitLoading ? (
                                        <div className="spinner-border text-white" role="status">
                                            {/* <span className="sr-only">Loading...</span> */}
                                        </div>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            </div>
                            {formSuccessMessage && formSuccessMessage.length > 0 && <p className='text-success text-center'>{formSuccessMessage}</p>}
                            {eligibilityMessage && eligibilityMessage.length > 0 && <p className='text-danger text-center'>{eligibilityMessage}</p>}
                        </form>
                    </div>

                    <div className="d-flex flex-column align-items-center mb-2 mt-auto">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                        <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                        <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                            style={{ color: '#0E94C3' }}>Privacy Policy</a>
                    </div>
                </div>
            </div>
        ) : displayCoupons ? (
            <div className="d-flex flex-column justify-content-start align-items-center" style={{ minHeight: '100vh', minWidth: '350px', backgroundColor: '#0E94C3' }}>
                <div className="card d-flex flex-column align-items-center p-2 py-3 p-sm-3 pb-5"
                    style={{
                        minWidth: windowSize.width < 576 ? '100vw' : windowSize.width <= 992 ? '75%' : '50%',
                        minHeight: '100vh', position: 'relative'
                    }}
                >
                    <div
                        style={{
                            position: 'sticky',
                            top: '30px',
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
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                zIndex: 1000, // Ensures it stays above the content
                            }}
                            onClick={() => {
                                setDisplayCoupons(false);
                                setPreviousAppointments();
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    </div>

                    {hospitalName || hospitalImage ? (
                        <div className="d-flex flex-column align-items-center mb-2 mt-3">
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

                    <div className='my-3 m-sm-3 d-flex flex-column align-items-center'>
                        <h3 className='fw-bold'>Available Coupons</h3>

                        <div className="card my-3" style={{ maxWidth: '550px', maxHeight: '300px' }}>
                            <div className="row g-0">
                                {/* <div className="col-4">
                                    <img src={`${process.env.PUBLIC_URL}/consultation.jpg`} className="img-fluid rounded"
                                        alt="Hospital Consultation" style={{ height: '100%' }} />
                                </div> */}
                                <div className="col-12">
                                    <div className="p-1 p-sm-2 d-flex flex-column">
                                        <h5 className="">Free Consultation</h5>
                                        {availableCoupons && availableCoupons > 0 ? (
                                            <p className="card-text m-0">You have Maximum of <span className='fs-4 text-danger fw-bold'>{availableCoupons}</span> coupons.</p>
                                        ) : (
                                            <p className="card-text">Sorry, You dont't have any coupons for this Hospital.</p>
                                        )}
                                        <button type='button' className='btn btn-warning p-1 px-2 fw-semibold align-self-end mt-1'
                                            disabled={!availableCoupons || availableCoupons === 0} style={{fontSize: '13px'}}
                                            onClick={() => setIsformOpen(true)}>
                                            Avail One Coupon <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                    </div>                    
                    
                    {previousAppointments && previousAppointments.length > 0 && (
                        <div className='d-flex flex-column my-3 mb-4'>
                            <h5 className='w-semibold mb-2'>Previous Appointments</h5>
                            {previousAppointments.map(app => (
                                <div className='d-flex flex-row justify-content-between align-items-center mb-1' key={app.AppointmentDate}>
                                    <span className='me-5'>{app.Name}</span>
                                    <span>{formatDate(app.AppointmentDate)}</span>
                                </div>
                            ))}
                        </div>
                    )}                    

                    <div className="d-flex flex-column align-items-center mb-2 mt-auto">
                        <img src="/applogo.png" alt="logo"
                            style={{ height: '40px', width: '40px' }}
                        />
                        <span className="app-brand-text fw-bolder"
                            style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                        <span style={{ fontSize: '13px' }}>All rights reserved. Copy right <i className="bi bi-c-circle"></i> OHOINDIA</span>
                        <span className='fw-semibold mt-3' style={{ color: '#0E94C3', fontSize: '13px' }}>Powerd by OHOINDIA TECHNOLOGY v1.0</span>
                        <a href='https://www.ohoindialife.in/privacypolicy' target='_blank'
                            style={{ color: '#0E94C3' }}>Privacy Policy</a>
                    </div>

                </div>
            </div>
        ) : returnDetails()
    )
};

export default Home;