import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import SubmitPrototype from "./pages/SubmitPrototype";
import EditPrototype from "./pages/EditPrototype";
import AssignStorage from "./pages/AssignStorage";
import ReviewPrototypes from "./pages/ReviewPrototypes";
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import ViewAllPrototype from './pages/ViewAllPrototype';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("access_token");
  return token ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/submit-prototype" element={<PrivateRoute element={<SubmitPrototype />} />} />
        <Route path="/prototypes/edit/:id" element={<PrivateRoute element={<EditPrototype />} />} />
        <Route path="/assign-storage/:id" element={<AssignStorage />} /> {}
        <Route path="/reviews" element={<ReviewPrototypes />} />  
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/prototypes" element={<PrivateRoute element={<ViewAllPrototype/>} />} />


      </Routes>
    </Router>
  );
}

export default App;