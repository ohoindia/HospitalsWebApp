import React, { useEffect, useState } from 'react';
import { Checkmark } from 'react-checkmark'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { fetchAllData, fetchData } from '../Helpers/externapi';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Login/input.css';

const Home = () => {
    const [memberDetails, setMemberDetails] = useState();
    const [previousAppointments, setPreviousAppointments] = useState();
    const [dependents, setDependents] = useState();
    const [isformOpen, setIsformOpen] = useState(false);
    const [formData, setFormData] = useState({
        FullName: '', MobileNumber: '', Cardnumber: '', Gender: '', DateofBirth: '', Age: '', Address: '',
        DateAndTime: '', HospitalName: '', Branch: '', DoctorName: '', ServiceType: '', Appointment: '', DiscountPercentage: '',
        ConsultationFee: ''
    });
    const [formErrors, setFormErrors] = useState({ DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: '' });
    const [eligibilityMessage, setEligibilityMessage] = useState();
    const [formSuccessMessage, setFormSuccessMessage] = useState();
    const [isDiscountedPercentVisible, setIsDiscountedPercentVisible] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    // const { memberId } = location.state || {};

    const memberId = 25587;

    console.log("memberDetails: ", memberDetails, dependents);
    console.log('Form Data: ', formData);

    const fetchPreviousAppointments = async () => {
        const responsePrevAppointments = await fetchAllData(`BookingConsultation/previousBookedAppointments/${memberId}`);

        if (responsePrevAppointments.status) {
            setPreviousAppointments(responsePrevAppointments.data);
        }
    };

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
        }

        const fetchDependents = async () => {
            const responseDependents = await fetchAllData(`MemberDependent/GetByMemberId/${memberId}`);

            setDependents(responseDependents);
        }

        fetchMemberDetails();
        fetchPreviousAppointments();
        fetchDependents();
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

    const formatDate = (dobString) => {
        const date = new Date(dobString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };

        return date.toLocaleDateString('en-US', options);
    };

    const onChangeHandler = (e) => {

        if (e.target.name === 'Appointment') {

            if (e.target.id === 'DiscountedConsultation' || e.target.id === 'DiscountedPharmacy' || e.target.id === 'DiscountedInvestigation') {
                setIsDiscountedPercentVisible(true);
            } else {
                setIsDiscountedPercentVisible(false);
            }

            setFormData(preVal => ({
                ...preVal, [e.target.name]: e.target.id
            }))
        } else if (e.target.name === 'FullName') {

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
    }

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
        if (formData.DateAndTime === '' || formData.HospitalName.length < 2 || formData.Branch.length < 2 ||
            formData.ServiceType.length < 2 || formData.Appointment === '') {

            if (formData.DateAndTime === '') {
                setFormErrors(preVal => ({
                    ...preVal, DateAndTime: 'Please select appointment date & time *'
                }))
            }
            if (formData.HospitalName.length < 2) {
                setFormErrors(preVal => ({
                    ...preVal, HospitalName: 'Please Enter valid hospital name *'
                }))
            }
            if (formData.Branch.length < 2) {
                setFormErrors(preVal => ({
                    ...preVal, Branch: 'Please Enter valid branch name *'
                }))
            }
            if (formData.ServiceType.length < 2) {
                setFormErrors(preVal => ({
                    ...preVal, ServiceType: 'Please Enter servicetype *'
                }))
            }
            if (formData.Appointment === '') {
                setFormErrors(preVal => ({
                    ...preVal, Appointment: 'Please select appoointment type *'
                }))
            }
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
                hospitalName: formData.HospitalName,
                branch: formData.Branch,
                serviceType: formData.ServiceType,
                consultationFee: formData.ConsultationFee,
                memberId: memberId,
                doctorName: formData.DoctorName,
                discountinPercentage: formData.DiscountPercentage,
                appointment: formData.Appointment
            }
            const responseEligible = await fetchData(`BookingConsultation/bookAppointment/add`, { ...payload });

            if (responseEligible.status) {
                setFormSuccessMessage(responseEligible.message);
                setEligibilityMessage('');

                fetchPreviousAppointments();

                setFormErrors({
                    DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: ''
                });

                setTimeout(() => {
                    setFormData(preVal => ({
                        ...preVal, DateAndTime: '', HospitalName: '', Branch: '', DoctorName: '', ServiceType: '', Appointment: '',
                        DiscountPercentage: '', ConsultationFee: ''
                    }));

                    setIsformOpen(false);
                    setEligibilityMessage('');
                    setFormSuccessMessage('');
                }, 3000);
            } else {
                setEligibilityMessage(responseEligible.message);
                setFormSuccessMessage('');
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
            DiscountPercentage: '', ConsultationFee: ''
        }));

        setFormErrors({
            DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: ''
        })
    };

    const handleCancel = () => {
        setFormData(preVal => ({
            ...preVal, DateAndTime: '', HospitalName: '', Branch: '', DoctorName: '', ServiceType: '', Appointment: '',
            DiscountPercentage: '', ConsultationFee: ''
        }));
        setFormErrors('');
        setIsformOpen(false);
        setEligibilityMessage('');
        setFormSuccessMessage('');
        setFormErrors({
            DateAndTime: '', HospitalName: '', Branch: '', ServiceType: '', Appointment: ''
        })
    };

    const bookAppointment = (data, value) => {

        if (value === 'member') {
            setFormData((preVal) => ({
                ...preVal, FullName: data[0].FullName, MobileNumber: data[0].MobileNumber, Cardnumber: data[0].OHOCardNumber,
                Gender: data[0].Gender, DateofBirth: formatDate(data[0].DateofBirth), Age: calculateAge(data[0].DateofBirth),
                Address: data[0].AddressLine1
            }))

            setIsformOpen(true);
        } else {
            setFormData((preVal) => ({
                ...preVal, FullName: data.fullName, Gender: data.gender, DateofBirth: formatDate(data.dateofBirth), Age: calculateAge(data.dateofBirth),
            }))

            setIsformOpen(true);
        }

    };

    const goBackToLogin = () => {
        navigate('/', {
            replace: true,
        });
    };

    const returnDetails = () => {
        return (
            <div className="container bg-white" style={{ minHeight: '100vh', minWidth: '350px' }}>
                <div className="d-flex flex-column justify-content-center align-items-center p-2 p-md-3">
                    <Checkmark />
                    <h5 className="text-black m-2 text-center fw-bold fs-4">MEMBERSHIP VERIFICATION SUCCESS !</h5>

                    {isDataFetched && (
                        <>
                            <div className='d-flex flex-column p-2 my-3' style={{ backgroundColor: '#e8ebe9', minWidth: '350px' }}>
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
                                <p className='mt-2'><strong>Address: </strong> {memberDetails && memberDetails[0].AddressLine1}</p>
                            </div>

                            <h5 className='fw-bold'>SELECT FAMILY MEMBER</h5>

                            <ul className='mt-3 list-unstyled'>
                                <li className='d-flex flex-row justify-content-between align-items-center border border-2 p-2'
                                    style={{ minWidth: '350px', cursor: 'pointer' }}
                                    key={memberDetails && memberDetails[0].CardPurchasedMemberId}
                                    onClick={() => bookAppointment(memberDetails, 'member')}
                                >
                                    <div>
                                        <p className='m-0 fw-bold'>{memberDetails && memberDetails[0].FullName}</p>
                                        <span>{memberDetails && memberDetails[0].Gender} | Age: {memberDetails && calculateAge(memberDetails[0].DateofBirth)} years</span>
                                    </div>

                                    <i className="bi bi-chevron-right fw-bolder"></i>
                                </li>

                                {dependents && dependents.length > 0 && dependents.map(each => (
                                    <li className='d-flex flex-row justify-content-between align-items-center border border-2 p-2 mt-2'
                                        style={{ minWidth: '350px', cursor: 'pointer' }}
                                        key={each.memberDependentId}
                                        onClick={() => bookAppointment(each, 'dependent')}
                                    >
                                        <div>
                                            <p className='m-0 fw-bold'>{each.fullName}</p>
                                            <span>{each.gender} | Age: {calculateAge(each.dateofBirth)} years</span>
                                        </div>

                                        <i className="bi bi-chevron-right fw-bolder"></i>
                                    </li>
                                ))}
                            </ul>

                            <div className='d-flex flex-column mt-5'>
                                <div style={{
                                    width: '300px', height: '180px',
                                    backgroundImage: 'url(https://ohoindia-mous.s3.ap-south-1.amazonaws.com/40831cda-bf5a-4945-b607-36b65f77ac70.jpg)',
                                    backgroundSize: 'cover',
                                    borderRadius: '10px'
                                }}>
                                    <p style={{
                                        fontSize: '1rem', color: 'white',
                                        textShadow: '1px 1px 2px black', marginTop: '135px', marginLeft: '30px'
                                    }}>
                                        {memberDetails && memberDetails[0].OHOCardNumber}
                                    </p>
                                </div>
                            </div>

                            <hr />

                            <div className='d-flex flex-row justify-content-center slign-items-center fw-semibold rounded'
                                style={{ backgroundColor: '#e8ebe9', minWidth: '350px', cursor: 'pointer' }}
                                onClick={() => goBackToLogin()}
                            >
                                <i className="bi bi-x-lg me-2"></i>
                                <span>CLOSE</span>
                            </div>

                            <p className='text-center fw-semibold mt-3'>Need any support ?</p>

                            <div className="d-flex flex-column align-items-center mb-2">
                                <img src="/applogo.png" alt="logo"
                                    style={{ height: '40px', width: '40px' }}
                                />
                                <span className="app-brand-text fw-bolder"
                                    style={{ fontSize: '18px', color: '#041F60' }} >OHOINDIA</span>
                            </div>
                        </>
                    )}





                    {/* <button type="button" className="text-primary align-self-start mb-2"
                        style={{ backgroundColor: 'transparent', border: '1px solid', borderRadius: '5px' }}
                        onClick={() => goBackToLogin()}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>

                    <div className="card p-3 mb-4 text-start">
                        <div className='d-flex flex-row alig-items-ceter mb-3'>
                            <h5 className="text-secondary fw-bolder">Customers Details</h5>
                            <button type="button" className="btn btn-success ms-3"
                                onClick={() => bookAppointment(memberDetails, 'member')}>
                                Book Service
                            </button>
                        </div>

                        {memberDetails && memberDetails.length > 0 && (
                            <div className="mb-3 row">
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2 fw-bold' style={{ color: '#4d4f52' }}>Name: </strong>
                                    <p>{memberDetails[0].FullName}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2 fw-bold' style={{ color: '#4d4f52' }}>Mobile Number: </strong>
                                    <p>{`${memberDetails[0].MobileNumber.slice(0, 2)}XXXXXX${memberDetails[0].MobileNumber.slice(8, 10)}`}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2 fw-bold' style={{ color: '#4d4f52' }}>Card Number: </strong>
                                    <p>{`${memberDetails[0].OHOCardNumber.slice(0, 3)}X XXXX X${memberDetails[0].OHOCardNumber.slice(10, 13)}`}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2 fw-bold' style={{ color: '#4d4f52' }}>Date of Birth: </strong>
                                    <p>{formatDate(memberDetails[0].DateofBirth)}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2 fw-bold' style={{ color: '#4d4f52' }}>Age: </strong>
                                    <p>{calculateAge(memberDetails[0].Age)}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2' style={{ color: '#4d4f52' }}>Gender: </strong>
                                    <p>{memberDetails[0].Gender}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2' style={{ color: '#4d4f52' }}>Validity: </strong>
                                    <p>{formatDate(memberDetails[0].EndDate)}</p>
                                </div>
                                <div className='col-12 col-md-4 d-flex flex-row'>
                                    <strong className='me-2' style={{ color: '#4d4f52' }}>Address: </strong>
                                    <p>{memberDetails[0].AddressLine1}</p>
                                </div>
                            </div>
                        )}

                        <h5 className="mb-3 text-secondary fw-bolder">Family Details</h5>

                        {dependents && dependents.length > 0 ? dependents.map(each => (
                            <div className="mb-3" key={each.memberDependentId}>
                                <span className="col-12 col-md-4 fw-bolder me-3" style={{ color: '#4d4f52' }}>
                                    {each.fullName} <span className="fw-normal"> ({each.relationship})</span>
                                </span>
                                <button type="button" className="btn btn-success"
                                    onClick={() => bookAppointment(each, 'dependent')}>
                                    Book Service
                                </button>
                            </div>
                        )) : <p className='text-danger ms-5'>Family details not availale</p>}
                    </div>

                    <h5 className="text-start mb-3 text-secondary fw-bolder">Your Appointments</h5>

                    <div className='row m-2'>
                        {previousAppointments && previousAppointments.length > 0 ?
                            previousAppointments.map(each => (
                                <div className='card col-12 col-sm-6 col-md-3 p-2 me-2'>
                                    <h4>{each.Name}</h4>
                                    <p>{each.HospitalName}</p>
                                    <div className='d-flex flex-row'>
                                        <strong>Date: </strong>
                                        <span className='ms-1'>{formatDate(each.BookingDate)}</span>
                                    </div>
                                </div>
                            )) :
                            <p className="text-danger text-center">No Appointments exisist</p>
                        }
                    </div> */}
                </div>
            </div>
        )
    };

    return (
        isformOpen ? (
            <div className="container bg-white" style={{ minHeight: '100vh', minWidth: '350px' }}>
                <div className="d-flex flex-column justify-content-center align-items-center p-2 p-md-3" >
                    <div className="d-flex flex-row justify-content-start align-items-center mb-3">
                        <img src="/applogo.png" alt="logo" style={{ height: '50px', width: '50px' }} />
                        <span className="app-brand-text fw-bolder ms-2" style={{ fontSize: '30px', color: 'rgb(6, 31, 92)' }} >
                            OHOINDIA
                        </span>
                    </div>
                    <div className="p-3 text-start">
                        <div className="d-flex flex-row align-items-center mb-3">
                            <button type="button" className="text-primary border border-primary rounded-pill p-1 px-2"
                                style={{ backgroundColor: 'transparent' }}
                                onClick={handleCancel}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>

                        <h4 className='mb-4 text-center'>{formData.FullName}</h4>

                        <form onSubmit={(e) => handleSubmit(e)}>
                            <div className='f-flex flex-column align-items-start' style={{ minWidth: '350px' }}>

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label htmlFor="FullName" className="form-select-label">*/}
                                {/*        Name<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <select name="FullName" id="FullName" className="form-select" value={formatDate.FullName} onChange={(e) => onChangeHandler(e)}>*/}
                                {/*        {customersList && customersList.length > 0 && customersList.map(list => (*/}
                                {/*            <option id={list.Id} value={list.Name} key={list.Id}>{list.Name}</option>*/}
                                {/*        ))}                                    */}
                                {/*    </select>*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label htmlFor="MobileNumber" className="form-control-label">*/}
                                {/*        Mobile Number<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <input name="MobileNumber" id="MobileNumber" type="tel" maxLength="10" className="form-control"*/}
                                {/*        placeholder="Enter Mobile Number" readOnly value={`${formData.MobileNumber.slice(0,4)}XXXXXX`} />*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label htmlFor="Cardnumber" className="form-control-label">*/}
                                {/*        Card Number<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <input name="Cardnumber" id="Cardnumber" className="form-control"*/}
                                {/*        placeholder="Enter Card Number" readOnly value={`${formData.Cardnumber.slice(0, 3)}X XXXX X${formData.Cardnumber.slice(10, 13)}`}*/}
                                {/*    />*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label className="form-control-label">*/}
                                {/*        Gender<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <div className="d-flex flex-row">*/}
                                {/*        <div className="form-check me-3">*/}
                                {/*            <input className="form-check-input" type="radio" name="Gender" id="Male" readOnly checked={formData.Gender === 'Male'} />*/}
                                {/*            <label className="form-check-label" htmlFor="Male">Male</label>*/}
                                {/*        </div>*/}
                                {/*        <div className="form-check me-3">*/}
                                {/*            <input className="form-check-input" type="radio" name="Gender" id="Female" readOnly checked={formData.Gender === 'Female'} />*/}
                                {/*            <label className="form-check-label" htmlFor="Female">Felame</label>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label htmlFor="flatpickr-human-friendly" className="form-control-label">*/}
                                {/*        DateofBirth<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <input type="text" className="form-control flatpickr-input" placeholder="Month DD, YYYY"*/}
                                {/*        id="flatpickr-human-friendly" name="DateofBirth" disabled="" value={formData.DateofBirth} readOnly*/}
                                {/*    />*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label className="form-control-label">*/}
                                {/*        Age<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <input type="text" name="Age" className="form-control" placeholder="Enter your age" readOnly value={formData.Age} />*/}
                                {/*</div>*/}

                                {/*<div className="d-flex flex-column col-12 col-md-4 mb-3">*/}
                                {/*    <label className="form-control-label">*/}
                                {/*        Address<span className="text-danger"> *</span>*/}
                                {/*    </label>*/}
                                {/*    <input type="text" name="Address" className="form-control" placeholder="Enter your Address" readOnly value={formData.Address} />*/}
                                {/*</div>*/}

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
                                            minDate: new Date()
                                        }}
                                    />
                                    {formErrors && formErrors.DateAndTime.length > 0 && <p className='text-danger'>{formErrors.DateAndTime}</p>}
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Hospital Name<span className="text-danger"> *</span>
                                    </label>
                                    <input type="text" name="HospitalName" className="form-control" placeholder="Enter Hospital Name"
                                        value={formData.HospitalName} onChange={(e) => onChangeHandler(e)}
                                    />
                                    {formErrors && formErrors.HospitalName.length > 0 && <p className='text-danger'>{formErrors.HospitalName}</p>}
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Branch<span className="text-danger"> *</span>
                                    </label>
                                    <input type="text" name="Branch" className="form-control" placeholder="Enter Branch Name"
                                        value={formData.Branch} onChange={(e) => onChangeHandler(e)} />
                                    {formErrors && formErrors.Branch.length > 0 && <p className='text-danger'>{formErrors.Branch}</p>}
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">Doctor Name</label>
                                    <input type="text" name="DoctorName" className="form-control" placeholder="Enter Doctor Name"
                                        value={formData.DoctorName} onChange={(e) => onChangeHandler(e)} />
                                </div>

                                <div className="d-flex flex-column mb-3">
                                    <label className="form-control-label">
                                        Servive Type<span className="text-danger"> *</span>
                                    </label>
                                    <input type="text" name="ServiceType" className="form-control" placeholder="Ex: Orthopedic"
                                        value={formData.ServiceType} onChange={(e) => onChangeHandler(e)} />
                                    {formErrors && formErrors.ServiceType.length > 0 && <p className='text-danger'>{formErrors.ServiceType}</p>}
                                </div>

                                <div className="d-flex flex-column mb-3">
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
                                    {formErrors && formErrors.Appointment.length > 0 && <p className='text-danger'>{formErrors.Appointment}</p>}
                                </div>

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
                                <button type="submit" className="btn btn-success">Submit</button>
                            </div>
                            {formSuccessMessage && formSuccessMessage.length > 0 && <p className='text-success text-center'>{formSuccessMessage}</p>}
                            {eligibilityMessage && eligibilityMessage.length > 0 && <p className='text-danger text-center'>{eligibilityMessage}</p>}
                        </form>
                    </div>
                </div>
            </div>
        ) : returnDetails()
    )
};

export default Home;