import React, { useState, useEffect } from 'react';
import { fetchAllData, fetchData, fetchUpdateData } from '../Helpers/externapi';
import { useParams, useNavigate } from "react-router-dom";
import { Checkmark } from 'react-checkmark';
import { format } from 'date-fns';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { formatDate, calculateAge } from '../CommonFunctions/CommonFunctions';
import { useSelector, useDispatch } from 'react-redux';
import { setConfigValue, setHospitalImage } from '../ReduxFunctions/ReduxSlice';
import { logToCloudWatch } from '../Helpers/cloudwatchLogger';

const ConfirmBooking = () => {
    const configValues = useSelector((state) => state.configValues);
    const hospitalImage = useSelector((state) => state.hospitalImage);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [consultationData, setConsultationData] = useState([]);
    const [formData, setFormData] = useState({
        FullName: '', MobileNumber: '', Cardnumber: '', Gender: '', DateofBirth: '', Age: '', Address: '', Appointment: '',
        DateAndTime: '', DoctorName: '', ServiceType: null, MemberDependentId: null, LabPercentage: null, PharmacyPercentage: null,
        PaidAmount: '', TotalAmount: ''
    });
    const [formErrors, setFormErrors] = useState({ DateAndTime: '', ServiceType: '' });
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [hospitalName, setHospitalName] = useState(sessionStorage.getItem('hospitalName'));
    const [hospitalLogo, setHospitalLogo] = useState(sessionStorage.getItem('hospitalImage'));
    const [serviceTypes, setServiceTYpes] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [ohoLogo, setOhoLogo] = useState();
    const [isSuccess, setIsSuccess] = useState(false);
    const [isRejected, setIsRejected] = useState(false);

    const id = useParams();

    const getLogStreamName = () => {
        const today = new Date().toISOString().split('T')[0];
        return `${consultationData[0].HospitalId} (${consultationData[0].HospitalName})-${today}`;
    };

    const logGroupName = process.env.REACT_APP_LOGGER;
    const logStreamName = consultationData && consultationData.length > 0 && getLogStreamName();

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
        fetchDataById();
        fetchServiceTypes();
    }, []);

    useEffect(() => {
        if (!configValues.length > 0) {
            getConfigValues();
        } else {
            // if (!hospitalImage.length > 0) {
            const imageUrl = configValues && configValues.length > 0 && configValues.find(val => val.ConfigKey === "hospitalImagesURL");
            dispatch(setHospitalImage(imageUrl.ConfigValue + hospitalLogo))
            // }

            const ohoLogo = configValues && configValues.length > 0 && configValues.find(val => val.ConfigKey === "LogoWithoutName");
            setOhoLogo(ohoLogo);
        }

    }, [configValues, hospitalImage, hospitalLogo]);

    const getConfigValues = async () => {
        try {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            dispatch(setConfigValue(response));
        } catch (e) {
            console.error('Error in ConfigValues/all: ', e);
        }
    };

    const fetchDataById = async () => {
        try {
            const getData = await fetchAllData(`lambdaAPI/BookingConsultation/GetByConsultationHashCode/${id.Id}`);

            getData && getData.length > 0 && (
                setFormData({
                    FullName: getData[0].Name, MobileNumber: getData[0].MobileNumber, Cardnumber: getData[0].CardNumber,
                    Gender: getData[0].Gender, DateofBirth: formatDate(getData[0].DateofBirth), Age: calculateAge(getData[0].DateofBirth),
                    Address: getData[0].Address, Appointment: getData[0].Appointment, DateAndTime: getData[0].AppointmentDate,
                    DoctorName: getData[0].DoctorName, ServiceType: getData[0].ServiceTypeId, MemberDependentId: getData[0].MemberDependentId,
                    LabPercentage: getData[0].LabInvestigationPercentage, PharmacyPercentage: getData[0].PharmacyDiscountPercentage,
                    PaidAmount: getData[0].PaidAmount, TotalAmount: getData[0].TotalAmount
                })
            )
            setConsultationData(getData);
            setHospitalLogo(getData[0].Image);
            setHospitalName(getData[0].HospitalName);
            setIsDataFetched(true);
        } catch (e) {
            console.error("Error fetching BookingConsultation/GetById/${id.Id}: ", e)
        }
    };

    const fetchServiceTypes = async () => {
        const getServiceTypes = await fetchData("HospitalServices/all", { skip: 0, take: 0 });
        setServiceTYpes(getServiceTypes);
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
        if (formData.DateAndTime === '') {

            setFormErrors(preVal => ({
                ...preVal, DateAndTime: 'Please select appointment date & time *'
            }))
        }
        // else if (service === 'consultation' && !formData.ServiceType) {

        //     setFormErrors(preVal => ({
        //         ...preVal, ServiceType: 'Please Enter servicetype *'
        //     }))
        // } 
        else {
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const noError = checkErrors();

        if (noError) {




            const status = await fetchAllData(`lambdaAPI/Status/all`);
            const initiatedStatus = status.find(item => item.Value === "Visited");


            const updateData = [


                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "PharmacyDiscountPercentage",
                    "ColumnValue": formData.PharmacyPercentage,
                    "TableId": consultationData[0].BookingConsultationId,

                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "LabInvestigationPercentage",
                    "ColumnValue": formData.LabPercentage,
                    "TableId": consultationData[0].BookingConsultationId,

                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "Status",
                    "ColumnValue": initiatedStatus.StatusId,
                    "TableId": consultationData[0].BookingConsultationId,

                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "PaidAmount",
                    "ColumnValue": formData.PaidAmount,
                    "TableId": consultationData[0].BookingConsultationId,

                },
                {
                    "TableName": "BookingConsultation",
                    "ColumnName": "TotalAmount",
                    "ColumnValue": formData.TotalAmount,
                    "TableId": consultationData[0].BookingConsultationId,

                }
            ]


            const updateResponse = await fetchUpdateData("lambdaAPI/BookingConsultation/Update", updateData);


            // const payload = {
            //     name: formData.FullName,
            //     mobileNumber: formData.MobileNumber,
            //     cardNumber: formData.Cardnumber,
            //     gender: formData.Gender,
            //     dateofBirth: formateDatabaseDatetime(formData.DateofBirth),
            //     age: formData.Age,
            //     appointmentDate: formData.DateAndTime,
            //     address: formData.Address,
            //     hospitalName: consultationData[0].HospitalName,
            //     hospitalId: consultationData[0].HospitalId,
            //     serviceTypeId: formData.ServiceType,
            //     memberId: consultationData[0].MemberId,
            //     memberDependentId: formData.MemberDependentId,
            //     doctorName: formData.DoctorName,
            //     appointment: formData.Appointment,
            //     labInvestigationPercentage: formData.LabPercentage,
            //     pharmacyDiscountPercentage: formData.PharmacyPercentage,
            //     PaidAmount: formData.PaidAmount === '' ? 0 : formData.PaidAmount,
            //     TotalAmount: formData.TotalAmount === '' ? 0 : formData.TotalAmount,
            //     BookingConsultationId: consultationData[0].BookingConsultationId,
            //     Status: "Approved"
            // };

            // setSubmitLoading(true);

            // const responseEligible = await fetchUpdateData(`BookingConsultation/update`, { ...payload });

            if (updateResponse) {
                await logToCloudWatch(logGroupName, logStreamName, {
                    event: `${formData.Appointment === 'Free Consultation' ? 'Free Consultation Approved'
                        : formData.Appointment === 'Lab Investigation' ? 'Lab Investigation Approved' :
                            'Pharmacy Discount Approved'} Successfully`,
                    details: { response: updateResponse },
                });

                const currentTime = new Date().getTime();
                const expirationTime = currentTime + 24 * 60 * 60 * 1000;

                sessionStorage.setItem('hospitalName', consultationData[0].HospitalName);
                sessionStorage.setItem('hospitalImage', hospitalImage);
                sessionStorage.setItem('hospitalId', consultationData[0].HospitalId);
                sessionStorage.setItem('hospitalTime', expirationTime);

                const memberExpirationTime = currentTime + 10 * 60 * 1000;

                sessionStorage.setItem('memberId', consultationData[0].MemberId);
                sessionStorage.setItem('memberTime', memberExpirationTime);

                setIsSuccess(true);
                setSubmitLoading(false);

                setFormErrors({
                    DateAndTime: '', ServiceType: ''
                });

                setTimeout(() => {
                    setFormData(preVal => ({
                        ...preVal, DateAndTime: '', DoctorName: '', ServiceType: null, LabPercentage: null, PharmacyPercentage: null,
                        PaidAmount: '', TotalAmount: ''
                    }));

                    navigate("/bookconsultation", { replace: true });
                    window.history.replaceState(null, "", "/bookconsultation");
                }, 3000);
            }
        }
    };

    const onChangeHandler = (e) => {

        if (e.target.name === 'ServiceType') {
            setFormData(preVal => ({
                ...preVal, [e.target.name]: parseInt(e.target.value)
            }))
            if (e.target.value.length > 0) {
                setFormErrors(preVal => ({
                    ...preVal, [e.target.name]: ''
                }))
            }
        } else if (e.target.name === 'LabPercentage' || e.target.name === 'PharmacyPercentage') {

            if (/^\d*$/.test(e.target.value) && e.target.value.length <= 3) {
                setFormData(prevVal => ({
                    ...prevVal,
                    [e.target.name]: parseInt(e.target.value)
                }));
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

    const alertFunction = async (e) => {
        e.preventDefault();

        const response = window.confirm("Are you sure, You wanted to reject ?");

        if (response) {
            const payload = {
                name: formData.FullName,
                mobileNumber: formData.MobileNumber,
                cardNumber: formData.Cardnumber,
                gender: formData.Gender,
                dateofBirth: formateDatabaseDatetime(formData.DateofBirth),
                age: formData.Age,
                appointmentDate: formData.DateAndTime,
                address: formData.Address,
                hospitalName: consultationData[0].HospitalName,
                hospitalId: consultationData[0].HospitalId,
                serviceTypeId: formData.ServiceType,
                memberId: consultationData[0].MemberId,
                memberDependentId: formData.MemberDependentId,
                doctorName: formData.DoctorName,
                appointment: formData.Appointment,
                labInvestigationPercentage: formData.LabPercentage,
                pharmacyDiscountPercentage: formData.PharmacyPercentage,
                PaidAmount: formData.PaidAmount === '' ? 0 : formData.PaidAmount,
                TotalAmount: formData.TotalAmount === '' ? 0 : formData.TotalAmount,
                BookingConsultationId: consultationData[0].BookingConsultationId,
                Status: "Rejected"
            };

            await fetchUpdateData(`BookingConsultation/update`, { ...payload });

            setIsRejected(true);

            const currentTime = new Date().getTime();
            const expirationTime = currentTime + 24 * 60 * 60 * 1000;

            sessionStorage.setItem('hospitalName', consultationData[0].HospitalName);
            sessionStorage.setItem('hospitalImage', hospitalImage);
            sessionStorage.setItem('hospitalId', consultationData[0].HospitalId);
            sessionStorage.setItem('hospitalTime', expirationTime);

            const memberExpirationTime = currentTime + 10 * 60 * 1000;

            sessionStorage.setItem('memberId', consultationData[0].MemberId);
            sessionStorage.setItem('memberTime', memberExpirationTime);

            setTimeout(() => {
                setFormData(preVal => ({
                    ...preVal, DateAndTime: '', DoctorName: '', ServiceType: null, LabPercentage: null, PharmacyPercentage: null,
                    PaidAmount: '', TotalAmount: ''
                }));

                navigate("/bookconsultation", { replace: true });
                window.history.replaceState(null, "", "/bookconsultation");
            }, 3000);
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
                {isSuccess ? (
                    <div>
                        <Checkmark />
                        <p className='text-success text-center fs-5 p-3'>
                            {formData.Appointment === "Free Consultation" ? (
                                'Free Consultation Approved Successfully'
                            ) : formData.Appointment === "Lab Investigation" ? (
                                'Lab Investigation Approved Successfully'
                            ) : 'Pharmacy Discount Approved Successfully'}
                        </p>
                    </div>
                ) : isRejected ? (
                    <div>
                        <Checkmark color="red" />
                        <p className='text-danger text-center fs-5 p-3'>
                            {formData.Appointment === "Free Consultation" ? (
                                'Free Consultation Rejected Successfully'
                            ) : formData.Appointment === "Lab Investigation" ? (
                                'Lab Investigation Rejected Successfully'
                            ) : 'Pharmacy Discount Rejected Successfully'}
                        </p>
                    </div>
                ) : isDataFetched && (
                    <div>
                        {hospitalName || hospitalImage ? (
                            <div className="d-flex flex-column align-items-center mb-2 mt-3">
                                {hospitalLogo && hospitalImage && (
                                    <img src={hospitalImage} alt=""
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

                        {consultationData && consultationData.length > 0 ? (
                            formData.Appointment === 'Free Consultation' ? (
                                <div className="p-3 text-start">
                                    <h4 className='mb-5 text-center'>Free Consultation for <br />
                                        <span style={{ color: '#0E94C3' }} className='fs-5 text-success'>{formData.FullName}</span>
                                    </h4>

                                    <form>
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

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Doctor Name</label>
                                                <input type="text" name="DoctorName" className="form-control" placeholder="Enter Doctor Name"
                                                    value={formData.DoctorName} onChange={(e) => onChangeHandler(e)} />
                                            </div>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">
                                                    Servive Type<span className="text-danger"> *</span>
                                                </label>
                                                <select name="ServiceType" className="form-control" placeholder="Ex: Orthopedic"
                                                    value={formData.ServiceType} onChange={(e) => onChangeHandler(e)}>
                                                    <option>--- SELECT ---</option>
                                                    {serviceTypes && serviceTypes.length > 0 && serviceTypes.map(type => (
                                                        <option key={type.HospitalServicesId} value={type.HospitalServicesId}>{type.ServiceName}</option>
                                                    ))}
                                                </select>
                                                {formErrors && formErrors.ServiceType.length > 0 && <p className='text-danger m-0'>{formErrors.ServiceType}</p>}
                                            </div>

                                        </div>
                                        <div className="text-center">
                                            <button onClick={(e) => handleSubmit(e)} className="btn btn-success me-2" style={{ width: '80px', height: '40px' }}>
                                                {submitLoading ? (
                                                    <div className="spinner-border text-white" role="status">
                                                        {/* <span className="sr-only">Loading...</span> */}
                                                    </div>
                                                ) : (
                                                    'Accept'
                                                )}
                                            </button>
                                            {/* <button className="btn btn-danger" style={{ width: '80px', height: '40px' }}
                                                onClick={(e) => alertFunction(e)}
                                            >
                                                Reject
                                            </button> */}
                                        </div>
                                    </form>
                                </div>
                            ) : formData.Appointment === 'Lab Investigation' ? (
                                <div className="p-3 text-start">
                                    <h4 className='mb-5 text-center'>Booking Lab Investigation for <br />
                                        <span style={{ color: '#0E94C3' }} className='fs-5 text-success'>{formData.FullName}</span>
                                    </h4>

                                    <form>
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

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Discount Percentage (<span className='text-danger'>%</span>)</label>
                                                <input type="number" name="LabPercentage" className="form-control" placeholder="Enter Discount Percentage"
                                                    value={formData.LabPercentage} min={0} max={100} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Paid Amount (<i className="bi bi-currency-rupee text-danger"></i>)</label>
                                                <input type="number" name="PaidAmount" className="form-control" placeholder="Enter Paid Amount"
                                                    value={formData.PaidAmount} min={0} max={999999} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Total Amount (<i className="bi bi-currency-rupee text-danger"></i>)</label>
                                                <input type="number" name="TotalAmount" className="form-control" placeholder="Enter Total Amount"
                                                    value={formData.TotalAmount} min={0} max={999999} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                        </div>
                                        <div className="text-center">
                                            <button onClick={(e) => handleSubmit(e)} type="submit" className="btn btn-success" style={{ width: '80px', height: '40px' }}>
                                                {submitLoading ? (
                                                    <div className="spinner-border text-white" role="status">
                                                        {/* <span className="sr-only">Loading...</span> */}
                                                    </div>
                                                ) : (
                                                    'Accept'
                                                )}
                                            </button>
                                            {/* <button className="btn btn-danger" style={{ width: '80px', height: '40px' }}
                                                onClick={(e) => alertFunction(e)}
                                            >
                                                Reject
                                            </button> */}
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-3 text-start">
                                    <h4 className='mb-5 text-center'>Pharmacy Discount for <br />
                                        <span style={{ color: '#0E94C3' }} className='fs-5 text-success'>{formData.FullName}</span>
                                    </h4>

                                    <form>
                                        <div className='f-flex flex-column align-items-start' style={{ minWidth: '350px' }}>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Discount Percentage (<span className='text-danger'>%</span>)</label>
                                                <input type="number" name="PharmacyPercentage" className="form-control" placeholder="Enter Discount Percentage"
                                                    value={formData.PharmacyPercentage} min={0} max={100} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Paid Amount (<i className="bi bi-currency-rupee text-danger"></i>)</label>
                                                <input type="number" name="PaidAmount" className="form-control" placeholder="Enter Paid Amount"
                                                    value={formData.PaidAmount} min={0} max={999999} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                            <div className="d-flex flex-column mb-3">
                                                <label className="form-control-label">Total Amount (<i className="bi bi-currency-rupee text-danger"></i>)</label>
                                                <input type="number" name="TotalAmount" className="form-control" placeholder="Enter Total Amount"
                                                    value={formData.TotalAmount} min={0} max={999999} onChange={(e) => onChangeHandler(e)}
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </div>

                                        </div>
                                        <div className="text-center">
                                            <button onClick={(e) => handleSubmit(e)} type="submit" className="btn btn-success" style={{ width: '80px', height: '40px' }}>
                                                {submitLoading ? (
                                                    <div className="spinner-border text-white" role="status">
                                                        {/* <span className="sr-only">Loading...</span> */}
                                                    </div>
                                                ) : (
                                                    'Accept'
                                                )}
                                            </button>
                                            {/* <button className="btn btn-danger" style={{ width: '80px', height: '40px' }}
                                                onClick={(e) => alertFunction(e)}
                                            >
                                                Reject
                                            </button> */}
                                        </div>
                                    </form>
                                </div>
                            )
                        ) : (
                            <div className="spinner-border text-primary mt-4" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}

                        <div className="d-flex flex-column align-items-center mb-2 mt-auto">
                            {ohoLogo ? (
                                <img src={ohoLogo.ConfigValue} alt="logo"
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
                )}

            </div>
        </div>
    )
}

export default ConfirmBooking;