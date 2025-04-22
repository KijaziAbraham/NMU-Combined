import { useEffect, useState } from "react";
import api from "api/api";
import DashboardSidebar from '../../components/Sidebar';
import DashboardHeader from "../../components/ProfileNavbar";
import '../../pages/Materials/css/AdminDashboard.css'


const AdminDashboard = () => {
    const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [generalUsers, setGeneralUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState(null);
  

  const [modalData, setModalData] = useState({
    user: { username: "", email: "", role: "", department: "" },
    department: { name: "" },
    approval: { userId: null, username: "" }
  });
  const [loading, setLoading] = useState({
    users: false,
    generalUsers: false,
    departments: false,
    actions: false
  });
  const [errors, setErrors] = useState({
    users: null,
    generalUsers: null,
    departments: null
  });

  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    username: "",
    email: "",
    phone: "",
    institution_id: "",
    institution_name: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true, generalUsers: true, departments: true }));
      setErrors({ users: null, generalUsers: null, departments: null });
      
      const [usersRes, generalUsersRes, departmentsRes] = await Promise.all([
        api.get("/admin/users/"),
        api.get("/admin/users/general_users/"),
        api.get("/departments/")
      ]);
      
      setUsers(usersRes.data);
      setGeneralUsers(generalUsersRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setErrors({
        users: "Failed to load users",
        generalUsers: "Failed to load general users",
        departments: "Failed to load departments"
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false, generalUsers: false, departments: false }));
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setFormData({
        username: response.data.username || "",
        full_name: response.data.full_name || "",
        role: response.data.role || "",
        department: response.data.department || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        institution_id: response.data.institution_id || "",
        institution_name: response.data.institution_name || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.post("/admin/users/", modalData.user);
      await fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(prev => ({ ...prev, users: "Failed to create user" }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const createDepartment = async () => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.post("/departments/", modalData.department);
      await fetchDepartments();
      closeModal();
    } catch (error) {
      console.error("Error creating department:", error);
      setErrors(prev => ({ ...prev, departments: "Failed to create department" }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const approveUser = async () => {
    try {
      setLoading(prev => ({ ...prev, actions: true }));
      await api.post(`/admin/users/${modalData.approval.userId}/approve_user/`);
      await fetchGeneralUsers();
      closeModal();
    } catch (error) {
      console.error("Error approving user:", error);
      setErrors(prev => ({ ...prev, generalUsers: "Failed to approve user" }));
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await api.get("/admin/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrors(prev => ({ ...prev, users: "Failed to load users" }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchGeneralUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, generalUsers: true }));
      const response = await api.get("/admin/users/general_users/");
      setGeneralUsers(response.data);
    } catch (error) {
      console.error("Error fetching general users:", error);
      setErrors(prev => ({ ...prev, generalUsers: "Failed to load general users" }));
    } finally {
      setLoading(prev => ({ ...prev, generalUsers: false }));
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const response = await api.get("/departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setErrors(prev => ({ ...prev, departments: "Failed to load departments" }));
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  const openModal = (modalType, data = {}) => {
    setActiveModal(modalType);
    setModalData(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], ...data }
    }));
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleInputChange = (modalType, field, value) => {
    setModalData(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        [field]: value
      }
    }));
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGeneralUsers = generalUsers.filter(gu =>
    gu.username.toLowerCase().includes(search.toLowerCase()) ||
    gu.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="main-content">
      <DashboardHeader user={user} />
      <div className="admin-dashboard-container">
          <h2 className="page-title">Admin Dashboard</h2>

          <div className="custom-tabs">
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              className={activeTab === "general" ? "active" : ""}
              onClick={() => setActiveTab("general")}
            >
              General Users
            </button>
            <button
              className={activeTab === "departments" ? "active" : ""}
              onClick={() => setActiveTab("departments")}
            >
              Departments
            </button>
          </div>

          {/* USERS TAB */}
          {activeTab === "users" && (
            <>
              <div className="controls-row">
              <div class="search-control">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                </div>
                <div className="action-control primary" onClick={() => openModal("user")}>
                  <span>+</span> Add User
                </div>
              </div>

              {loading.users ? (
                <div>Loading users...</div>
              ) : errors.users ? (
                <div className="error-message">{errors.users}</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* GENERAL USERS TAB */}
          {activeTab === "general" && (
            <>
              <div className="controls-row">
              <div class="search-control">

                <input
                  type="text"
                  placeholder="Search general users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                </div>
              </div>

              {loading.generalUsers ? (
                <div>Loading general users...</div>
              ) : errors.generalUsers ? (
                <div className="error-message">{errors.generalUsers}</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGeneralUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.is_approved ? "Approved" : "Pending"}</td>
                        <td>
                            {!user.is_approved && (
                              <div 
                                className="action-control success"
                                onClick={() => openModal('approval', { 
                                  userId: user.id,
                                  username: user.username 
                                })}
                              >
                                Approve
                              </div>
                            )}
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === "departments" && (
            <>
              <div className="controls-row">
              <div class="search-control">

                <input
                  type="text"
                  placeholder="Search departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                </div>
                <div className="action-control primary" onClick={() => openModal("department")}>
                  <span>+</span> Add Department
                </div>
              </div>

              {loading.departments ? (
                <div>Loading departments...</div>
              ) : errors.departments ? (
                <div className="error-message">{errors.departments}</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map(dept => (
                      <tr key={dept.id}>
                        <td>{dept.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    
      {/* Add User Modal */}
      {activeModal === 'user' && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={modalData.user.username}
                  onChange={(e) => handleInputChange('user', 'username', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={modalData.user.email}
                  onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={modalData.user.role}
                  onChange={(e) => handleInputChange('user', 'role', e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={modalData.user.department}
                  onChange={(e) => handleInputChange('user', 'department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="submit-button" 
                onClick={createUser}
                disabled={loading.actions}
              >
                {loading.actions ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {activeModal === 'department' && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Department</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">

                <label>Department Name</label>
                <input
                  type="text"
                  value={modalData.department.name}
                  onChange={(e) => handleInputChange('department', 'name', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">  
            
                <label>Code</label>
                 <input
                  type="text"
                  value={modalData.department.code}
                  onChange={(e) => handleInputChange('department', 'code', e.target.value)}
                  autoFocus
                />

              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="submit-button" 
                onClick={createDepartment}
                disabled={loading.actions}
              >
                {loading.actions ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve User Modal */}
      {activeModal === 'approval' && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Approval</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to approve <strong>{modalData.approval.username}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="submit-button" 
                onClick={approveUser}
                disabled={loading.actions}
              >
                {loading.actions ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;