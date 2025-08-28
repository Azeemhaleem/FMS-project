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
  <div className="row mt-3">
    <div
      className="search-section container mb-5 justify-content-center align-items-center "
    style={{
      backgroundColor: "#d3e2fd",
      padding: "1rem",
      marginLeft: window.innerWidth < 576 ? "" : "1rem"

    }}>
      <h5 className="fw-bold text-secondary" style={{ margin: "7px" }}>
        Last 30 days Fines List
      </h5>

      {loading && <div className="text-center py-3">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== Desktop / tablet (md and up): table-like list ===== */}
      <ul
        className="list-group list-group-flush d-none d-md-block"
        style={{ maxHeight: "75vh", borderRadius: "10px", overflowY: "auto" }}
      >
        {/* Header row (sticky) */}
        <li className="list-group-item bg-transparent fw-bold position-sticky top-0 z-1">
          <div className="row text-center text-dark">
            <div className="col-2">Fine ID</div>
            <div className="col-3">Fine Name</div>
            <div className="col-3">Area</div>
            <div className="col-2">Paid Status</div>
            <div className="col-2 text-end">Issued Time</div>
          </div>
        </li>

        {notifications.length === 0 && !loading ? (
          <li className="list-group-item text-center text-muted">
            No fines issued in the last 14 days.
          </li>
        ) : (
          notifications.map((item) => (
            <li key={item.id || Math.random()} className="list-group-item">
              <div className="row align-items-center text-center">
                <div className="col-2">{item.fine_id || "N/A"}</div>
                <div className="col-3">{item.fine_name || "N/A"}</div>
                <div className="col-3">{item.area || "N/A"}</div>
                <div className="col-2">
                  {item.paid_at ? (
                    <span className="badge text-bg-success">Paid</span>
                  ) : (
                    <span className="badge text-bg-warning">Unpaid</span>
                  )}
                </div>
                <div className="col-2 text-end">
                  <span className="text-muted small">
                    {formatDate(item.charged_at)}
                  </span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* ===== Mobile (below md): card list ===== */}
      <div className="d-md-none" style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {notifications.length === 0 && !loading ? (
          <div className="text-center text-muted py-3">
            No fines issued in the last 14 days.
          </div>
        ) : (
          notifications.map((item) => {
            const isPaid = !!item.paid_at;
            return (
              <div
                key={item.id || Math.random()}
                className="card border-0 shadow-sm mb-3 rounded-4"
              >
                <div className="card-body">
                  {/* Top line */}
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">Fine #{item.fine_id || "N/A"}</div>
                      <div className="text-muted small">
                        Issued • {formatDate(item.charged_at)}
                      </div>
                    </div>
                    <span
                      className={`badge ${isPaid ? "text-bg-success" : "text-bg-warning"}`}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  {/* Body fields */}
                  <hr className="my-2" />
                  <div className="small">
                    <div className="mb-1">
                      <span className="text-muted d-block">Fine Name</span>
                      <span className="fw-semibold">{item.fine_name || "N/A"}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-muted d-block">Area</span>
                      <span className="fw-semibold">{item.area || "N/A"}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-muted d-block">Paid Status</span>
                      <span className="fw-semibold">
                        {isPaid ? `Paid at ${formatDate(item.paid_at)}` : "Not paid yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

}

export default DriverMyFines

