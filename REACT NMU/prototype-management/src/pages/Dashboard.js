import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../pages/Materials/css/Dashboard.css";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import SubmitPrototypeModal from "./SubmitPrototype";
import { Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storageFilter, setStorageFilter] = useState("");
  const [storageLocations, setStorageLocations] = useState([]);
  const [prototypes, setPrototypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prototypeCount, setPrototypeCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availablePrototypeCount, setAvailablePrototypeCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [monthlySubmissions, setMonthlySubmissions] = useState({
    labels: [],
    datasets: [
      {
        label: 'Prototypes Added',
        data: [],
        backgroundColor: [],
      },
    ],
  });

  const handleShowSubmitModal = () => setShowSubmitModal(true);
  const handleCloseSubmitModal = () => setShowSubmitModal(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    fetchUser();
    fetchStorageLocations();
    fetchInitialPrototypeCount(); // Fetch initial prototype count
    fetchMonthlyPrototypeSubmissions(currentYear);
  }, [currentYear]);

  useEffect(() => {
    if (user?.role) {
      fetchPrototypes();
    }
  }, [user, searchTerm, storageFilter, currentPage, showSubmitModal]);

  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchInitialPrototypeCount = async () => {
    try {
      const response = await api.get("prototypes/count/"); // New API endpoint for total count
      setPrototypeCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching initial prototype count:", error);
    }
  };

  const fetchPrototypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `prototypes/?search=<span class="math-inline">\{searchTerm\}&storage\_location\=</span>{storageFilter}&page=${currentPage}&page_size=10`
      );
      setPrototypes(Array.isArray(response.data) ? response.data : response.data.results || []);
      setAvailablePrototypeCount(prototypes.filter(p => p.status === 'available').length);
      setTotalPages(Math.ceil((response.data.count || 1) / 10));
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setPrototypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageLocations = async () => {
    try {
      const response = await api.get("prototypes/storage_locations/");
      setStorageLocations(response.data || []);
    } catch (error) {
      console.error("Error fetching storage locations:", error);
    }
  };

  const fetchMonthlyPrototypeSubmissions = async (year) => {
    try {
      const response = await api.get(`prototypes/monthly_submissions/?year=${year}`);
      const submissionCounts = response.data;
      const data = months.map(month => submissionCounts[month] || 0);
      const backgroundColors = data.map(() => {
        return (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradientBg = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradientBg.addColorStop(0, 'rgba(100, 162, 147, 0.8)');
          gradientBg.addColorStop(1, 'rgba(0, 0, 255, 0.8)');
          return gradientBg;
        };
      });

      setMonthlySubmissions({
        labels: months,
        datasets: [
          {
            label: 'Prototypes Added',
            data: data,
            backgroundColor: backgroundColors,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching monthly prototype submissions:", error);
      setMonthlySubmissions({
        labels: months,
        datasets: [
          {
            label: 'Prototypes Added',
            data: months.map(() => 0),
            backgroundColor: 'rgba(100, 162, 147, 0.8)',
          },
        ],
      });
    }
  };

  const handleExport = async (format) => {
    if (userRole === 'admin' || userRole === 'staff') {
      try {
        const response = await api.get(`prototypes/export_${format}/`, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `prototypes.${format === "excel" ? "xlsx" : "pdf"}`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error(`Export ${format} error:`, error);
        alert(`Failed to export as ${format}. Please try again.`);
      }
    } else {
      alert("You do not have permission to export prototypes.");
    }
  };

  const navigateToPrototypes = () => {
    navigate("/prototypes");
  };

  const displayedPrototypes = prototypes.slice(0, 6);

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Prototype Submissions - ${currentYear}`,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Prototypes',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Component */}
      <DashboardSidebar />
      
      <div className="main-content p-2 shadow-sm">
        {/* Header Component */}
        <DashboardHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleShowSubmitModal={handleShowSubmitModal}
          userRole={userRole}
        />

        {/* Dashboard Content - First Section (Cards) */}
        <div className=" row mb-4 mx-5">
          <div className="col ">
            <div className="card card-prototype gradient-card" style={{ width: '390px', height: '129px', border:'none' , borderRadius:'24px'}}>
              <div className="card-body">
                <h5 className="card-title text-white">Your Prototypes</h5>
                <p className="card-text display-4 text-white">{prototypeCount}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card card-available gradient-card" style={{ width: '390px', height: '129px' , border:'none' , borderRadius:'24px' }}>
              <div className="card-body">
                <h5 className="card-title text-white">Available Prototypes</h5>
                <p className="card-text display-4 text-white">{availablePrototypeCount}</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card bg-image-card text-white d-flex flex-column justify-content-between" style={{ width: '629px', height: '129px' , border:'none' , borderRadius:'24px'}}>
              <div className="">
                <h5 className="card-title" style={{ color: '#64A293', marginLeft: '20px', marginTop: '20px' }}>Your Innovation Hub</h5>
                <p className="card-text text-dark" style={{ marginLeft: '20px' }}>Creative design</p>
              </div>
              <div className="d-flex justify-content-end mb-3 m-2">
                <button className="btn btn-success">Start Now</button>
              </div>
            </div>
          </div>
        </div>
          {/* Render the Modal Directly in Dashboard */}
        <div className="prototype-btns d-flex justify-content-start mb-4" style={{marginLeft:'70px'}}>
        <SubmitPrototypeModal
          show={showSubmitModal}
          onHide={handleCloseSubmitModal}
          onPrototypeSubmitted={() => {
            console.log("Prototype submitted from modal in Dashboard!");
            // After submission, re-fetch the total prototype count
            fetchInitialPrototypeCount();
            fetchPrototypes();
            handleCloseSubmitModal();
          }}
        />

        {/* Privilege and Export Buttons */}
        {(userRole === 'admin' || userRole === 'staff') && (
          <div className="mb-4 mx-5">
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => handleExport('excel')}>
                Export as CSV
              </Button>
              <Button variant="outline-danger" onClick={() => handleExport('pdf')}>
                Export as PDF
              </Button>
            </div>
          </div>
        )}

        </div>

        {/* Dashboard Content - Second Section (Grid Cards) */}
        <div className="row mx-5">
          {/* Left Side - Prototypes List */}
          <div className="col">
            <div className="card" style={{ width: '100%', maxWidth: '1059px', height: '322px', border: '1px solid #EFEFEF', borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title">Recent Prototypes</h5>
                <div className="row row-cols-1 row-cols-md-3 g-3 mt-1" style={{ maxHeight: '200px', overflowY: 'none' }}>
                  {displayedPrototypes.map((proto) => (
                    <div key={proto.id} className="col">
                      <div className="prototype-item" style={{ height: '85px', borderLeft: '4px solid #64A293', paddingLeft: '10px' }}>
                        <p className="mb-0">{proto.title || 'Untitled'}</p>
                        <p className="mb-0">{proto.barcode || 'Untitled'}</p>
                      </div>
                    </div>
                  ))}
                  {displayedPrototypes.length < 6 && Array.from({ length: 6 - displayedPrototypes.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="col">
                      <div className="prototype-item placeholder-item" style={{ height: '85px', borderLeft: '4px solid #64A293', paddingLeft: '10px', backgroundColor: ' #FFFFFF' }}>
                        <p className="mb-0 text-muted">No prototype</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button className="btn btn-outline-success justify-content-center align-content-center mt-3" onClick={navigateToPrototypes}>Preview All</button>
                </div>
              </div>
            </div>
            {/* Histogram charts */}
            <div className="card mt-4" style={{ width: '100%', maxWidth: '1059px', height: '600px', border: '1px solid #EFEFEF', borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title">Monthly Prototype Submissions</h5>
                <Bar data={monthlySubmissions} options={chartOptions} />
              </div>
            </div>

          </div>

          {/* Right Side - Three Cards */}
          <div className=" col-md-4">
            <div className="right-cards">
              <div className="mb-4">
                <div className="card" style={{ width: '100%', maxWidth: '559px', height: '258px', borderRadius: '24px', border: '1px solid #EFEFEF' }}>
                  <div className="card-body">
                    <div className="avatar">
                      <img
                        src={require("../pages/auth/assets/img/man.png")}
                        alt="User Avatar"
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    </div>
                    <h5 className="card-title">{user?.name || 'User Name'}</h5>
                    <p className="card-text">{user?.email || 'user@email.com'}</p>
                    <p className="card-text text-muted">{userRole}</p>
                    {/* Add more user info here */}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="card" style={{ width: '100%', maxWidth: '559px', height: '258px', borderRadius: '24px', border: '1px solid #EFEFEF' }}>
                  <div className="card-body">
                    <h5 className="card-title"><strong>Institution Details</strong></h5>
                    <p className="card-text">University Name  : {user?.institution_id || 'Nelson Mandela University'}</p>
                    <p className="card-text">Department/Faculty : {user?.department || 'Department'}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="card" style={{ width: '100%', maxWidth: '559px', height: '258px', borderRadius: '24px', border: '1px solid #EFEFEF' }}>
                  <div className="card-body">
                    <h5 className="card-title">Contact</h5>
                    <p className="card-text">Phone number : {user?.phone || 'No contact'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;