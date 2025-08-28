import React, { useEffect, useState } from 'react';
import QrCodeScanner from "../components/QrCodeScanner.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import "./Officer-styles.css";
import QrImage from './Qr Code.svg.png';
import { Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../api/axios.jsx";


function OfficerDashboard() {
    const [scanResult, setScanResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [add, setAdd] = useState(false);
    const [fines, setFines] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [issueFine, setIssueFine] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [selectedFine, setSelectedFine] = useState('');

    const token = localStorage.getItem('token');

    const fetchFines = async () => {
        try {
            const response = await api.get('/get-all-fines', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Ensure it's an array
            if (Array.isArray(response.data)) {
                setFines(response.data);
            } else if (Array.isArray(response.data.fines)) {
                setFines(response.data.fines);
            } else {
                console.error("Unexpected fine data format:", response.data);
                setFines([]);
            }
        } catch (error) {
            console.error("Error fetching fines:", error.response?.data || error.message);
            setFines([]);
        }
    };


    useEffect(() => {
        fetchFines();
    }, []);

    useEffect(() => {
        if (scanResult && selectedDriver) {
            const timer = setTimeout(() => {
                setAdd(true);
                setScanResult(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [scanResult, selectedDriver]);

    useEffect(() => {
        async function fetchData() {
            if (scanResult) {
                try {
                    console.log("Sending license number:", scanResult);
                    const response = await api.post('/check-license-number',
                        { driver_license_number: scanResult },
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );

                    if (response.status === 200) {
                        console.log(response.data);
                        const driver = response.data.driver;
                        const full_name = driver.full_name;
                        const license_no = driver.license_no;
                        const license_expiry_date = driver.license_expiry_date;

                        setSelectedDriver({
                            full_name,
                            license_no,
                            license_expiry_date
                        });
                    } else {
                        alert("Invalid Scan. Please try again.");
                        setSelectedDriver(null);
                    }
                } catch (error) {
                    console.error('Verification error:', error.response?.data || error.message);
                    alert("Error verifying driver. Please check your input or try again later.");
                }
            }
        }
        fetchData();
    }, [scanResult]);

    console.log(selectedDriver);

    const formik = useFormik({
        initialValues: {
            Fine: "",
            DriverQr: selectedDriver?.license_no || "",
        },
        validationSchema: Yup.object({
            Fine: Yup.string().required("Select a Fine"),
        }),
        onSubmit: (values) => {
            const formData = {
                ...values,
                DriverQr: selectedDriver?.license_no
            };
            setSubmittedData(formData);
            setIssueFine(true);
            console.log("Form submitted:", formData);
        }
    });

    const handleFineSelect = (event) => {
        const id = parseInt(event.target.value);
        const selected = fines.find(f => f.id === id);
        setSelectedFine(selected);
        formik.setFieldTouched('Fine', true); // ensure Formik validation works
        formik.setFieldValue('Fine', selected?.name || "");
    };


    const handleAdd = () => setAdd(true);

    const closeModal = () => {
        setShowModal(false);
        setIssueFine(false);
        setAdd(false);
        setScanResult(null);
        setSelectedDriver(null);
        setSubmittedData(null);
    };

    const addFine = async () => {
        if (!selectedFine?.id || !selectedDriver?.license_no) {
            alert("Missing fine or driver information.");
            return;
        }

        try {
            const response = await api.post('/charge-fine', {
                fine_id: selectedFine.id,
                driver_license_number: selectedDriver.license_no
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                alert("Fine issued Successfully!");
                console.log("Fine added:", response.data);
                setSubmittedData(null);
                closeModal();
            }
        } catch (error) {
            console.error("Error adding fine:", error.response?.data || error.message);
            alert("Failed to issue fine.");
        }
    };


    return (
        <>
            {!scanResult && !selectedDriver && !add && (
                <div id="ScanPage" className="bg-white bg-opacity-25 p-3 rounded justify-content-center" style={{ width: "85%", height: "60vh" }}>
                    <div className="row-cols-lg-auto d-lg-flex d-sm-block justify-content-center align-items-center mt-2">
                        <div className="Scan-col col-lg-5" style={{ height: "49vh" }}>
                            <h4>Scan Driver License QR here</h4>
                            <div className="Scanner bg-white pe-lg-4 rounded shadow d-flex justify-content-center align-items-center"
                                 style={{ height: "47vh", width: "85%" }}>
                                <QrCodeScanner setScanResult={setScanResult} />
                            </div>
                        </div>

                        <div className="help-col col-lg-5 text-primary-emphasis " style={{ height: "49vh" }}>
                            <h4 className="text-primary-emphasis">Check Fines Details Info</h4>
                            <a href="/assets/fines_list.pdf" download="fines_list.pdf" className="text-primary-emphasis text-decoration-none">
                            <div className="help-content bg-white px-lg-4 rounded shadow d-flex justify-content-center align-items-center"
                                     style={{ height: "47vh", width: "85%" }}>
                                    <FontAwesomeIcon icon={faFileLines} style={{ fontSize: "17vh" }} className="pdf-icon" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {scanResult && selectedDriver && !add && (
                <div id="SuccessPage" className="d-flex justify-content-center align-items-center">
                    <div className="row bg-white bg-opacity-75 p-3 rounded w-75 my-4">
                        <h4>QR Code Scanned Successfully</h4>
                        <div className="col-6">
                            <img src={QrImage} alt="QR Code Scanned Successfully" style={{ width: "65%" }} />
                        </div>
                        <div className="col-4 d-flex justify-content-center align-items-center">
                            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: "10vh" }} className="text-success" />
                        </div>
                    </div>
                </div>
            )}

            {selectedDriver && add && (
                <div id="ConfirmPage" className="d-flex justify-content-center align-content-center">
                    <div className="row">
                        <div className="card mt-4"
                             style={{ backgroundColor: "#f7f9fc", padding: "20px", fontSize: "medium", width: "150vh" }}>
                            <h4>Driver Details</h4>
                            <div>
                                <span className="info-label">Driver Name:</span>
                                <div className="info-value"> {selectedDriver.full_name}</div>
                            </div>
                            {/*<div>*/}
                            {/*    <span className="info-label">License Number:</span>*/}
                            {/*    <div className="info-value"> {selectedDriver.license_no}</div>*/}
                            {/*</div>*/}
                            <div>
                                <span className="info-label">License Expiry Date:</span>
                                <div className="info-value">{selectedDriver.license_expiry_date || "N/A"}</div>
                            </div>

                            <hr />
                            <br />
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                if (formik.isValid) handleAdd();
                                formik.handleSubmit(e);
                            }}>
                                <Form.Group controlId="Fine" className="mt-3">
                                    <Form.Label>Select Fine</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedFine?.id || ""}
                                        onChange={handleFineSelect}
                                    >
                                        <option value="">-- Select a Fine --</option>
                                        {fines.map((item) => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </Form.Control>

                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.Fine}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="row">
                                    <div className="d-flex justify-content-end mt-3">
                                        <button className="btn btn-secondary btn-lg me-3" type="reset"
                                                style={{ fontSize: "medium" }}
                                                onClick={closeModal}>
                                            Cancel Fine
                                        </button>
                                        <button className="btn btn-dark btn-lg" type="submit" style={{ fontSize: "medium" }}>
                                            Issue Fine
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            )}

            {issueFine && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <p>Confirm Issue the Fine?</p>
                        <div className="warning-box">
                            <p><strong>Fine:</strong> {selectedFine.name}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>
                                No, Cancel
                            </button>
                            <button className="btn-confirm" onClick={() => addFine()}>
                                Yes, Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default OfficerDashboard;
