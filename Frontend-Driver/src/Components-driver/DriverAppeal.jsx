import React, { useState ,useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AiOutlineExclamationCircle, AiOutlineFileText, AiOutlineCheckCircle } from 'react-icons/ai';
import { Tooltip } from 'bootstrap';
import api from "../api/axios.jsx";
import './Driver-styles.css'

const DriverAppeal = () => {
  const [formData, setFormData] = useState({
    fineId: '',
    issueType: '',
    description: '',
    evidence: null,
  });

  const token = localStorage.getItem('token');

  const [fines, setFines] = useState([]);

  const appealStatus = [
    { date: '2025-02-23', status: 'Pending' },
    { date: '2024-08-01', status: 'In Review' },
    { date: '2023-02-27', status: 'Resolved' },
    { date: '2023-04-10', status: 'Resolved' },
    { date: '2022-09-06', status: 'Resolved' },
  ];

  const fetchFines = async () => {
    try {
      const response = await api.get('/get-all-unpaid-fines', {
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
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Appeal submitted!');
  };

  return (
  <div className="search-section container mb-5 justify-content-center align-items-center "
    style={{
      backgroundColor: "#d3e2fd",
      padding: "1rem",
      marginLeft: window.innerWidth < 576 ? "2rem" : "3rem"

    }}>
    <div className="container">
      <div className="row g-4">
        {/* Appeal Form */}
        <div className="col-12 col-lg-8">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100">
            <h5 className="fw-semibold mb-3">Appeal</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Fine ID :</label>
                <input
                  type="text"
                  className="form-control"
                  name="fineId"
                  value={formData.fineId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Issue Type :</label>
                <select
                  className="form-control"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    -- Select a Fine --
                  </option>
                  {fines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description :</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Buttons: full width on xs, side-by-side from sm+ */}
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </div>
                <div className="col-12 col-sm-6">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={() =>
                      setFormData({
                        fineId: "",
                        issueType: "",
                        description: "",
                        evidence: null,
                      })
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Appeal Status */}
        <div className="col-12 col-lg-4">
          <div
            className="bg-white p-4 rounded-4 shadow-sm h-100"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            <h5 className="fw-semibold mb-3 border-bottom pb-2">Appeal Status</h5>
            {appealStatus.map((item, index) => {
              const dateObj = new Date(item.date);
              const day = String(dateObj.getDate()).padStart(2, "0");
              const month = dateObj
                .toLocaleString("default", { month: "short" })
                .toUpperCase();
              const year = dateObj.getFullYear();

              let statusColor = "text-warning";
              let Icon = AiOutlineExclamationCircle;
              if (item.status === "Resolved") {
                statusColor = "text-success";
                Icon = AiOutlineCheckCircle;
              } else if (item.status === "In Review") {
                statusColor = "text-primary";
                Icon = AiOutlineFileText;
              }

              return (
                <div key={index} className="d-flex align-items-center mb-4">
                  <div className="text-center me-3" style={{ minWidth: 56 }}>
                    <h4 className="mb-0 fw-bold">{day}</h4>
                    <small className="d-block">{month}</small>
                    <small className="d-block">{year}</small>
                  </div>
                  <div className="me-2">
                    <span
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title={`Fine ID: ${item.fineId}\nViolation: ${item.violation}`}
                      style={{ cursor: "pointer" }}
                    >
                      ⋮
                    </span>
                  </div>
                  <div className="d-flex align-items-center me-2">
                    <Icon className="me-2" size={20} />
                  </div>
                  <div className="flex-grow-1">
                    <span className={`fw-semibold ${statusColor}`}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default DriverAppeal;
