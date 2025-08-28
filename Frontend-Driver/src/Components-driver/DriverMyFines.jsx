import React, { useEffect, useState } from 'react';
import api from "../api/axios.jsx";
import { useNavigate } from "react-router-dom";
import "./Driver-styles.css";

function DriverMyFines() {
    const token = localStorage.getItem('token');
    const [notifications, setNotifications] = useState([]); // Default to empty array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchNotifications();
        }
    }, [navigate, token]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/get-my-fines', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = Array.isArray(response?.data?.data) ? response.data.data : [];
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch Fine Details", err);
            setError("Failed to load Fine Details. Please try again.");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return isNaN(date) ? "Invalid date" : `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
        } catch (e) {
            return "Invalid date";
        }
    };

    return (
        <div className='row mt-3'>
            
            <div className="search-section container mb-5 justify-content-center align-items-center "
    style={{
      backgroundColor: "#d3e2fd",
      padding: "1rem",
      marginLeft: window.innerWidth < 576 ? "3rem" : "2rem"

    }}>
                <h5 className="fw-bold text-secondary" style={{ margin: "7px" }}>Last 30 days Fines List</h5>

                {loading && <div className="text-center py-3">Loading...</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <ul className="list-group list-group-flush" style={{ maxHeight: "75vh", borderRadius: "10px" }}>
                    <li className="list-group-item d-flex w-100 text-dark fw-bold">
                        <span className="d-flex w-25 justify-content-center">Fine ID</span>
                        <span className="d-flex w-25 justify-content-center">Fine Name</span>
                        <span className="d-flex w-50 justify-content-center">Area</span>
                        <span className="d-flex w-50 justify-content-center">Paid Status</span>
                        <span className="d-flex w-25 justify-content-center text-end">Issued Time</span>
                    </li>
                    {notifications.length === 0 && !loading ? (
                        <li className="list-group-item text-center text-muted">
                            No fines issued in the last 14 days.
                        </li>
                    ) : (
                        notifications.map((item) => (
                            <li key={item.id || Math.random()} className="list-group-item d-flex w-100">
                                <span className="d-flex w-25 justify-content-center">{item.fine_id || "N/A"}</span>
                                <span className="d-flex w-25 justify-content-center">{item.fine_name || "N/A"}</span>
                                <span className="d-flex w-50 justify-content-center">{item.area || "N/A"}</span>
                                <span className="d-flex w-50 justify-content-center">{item.paid_at|| "N/A"}</span>
                                <span className="text-muted small d-flex w-25 justify-content-center text-end">
                                    {formatDate(item.charged_at)}
                                </span>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default DriverMyFines

