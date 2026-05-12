import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/Codingboss-logo-1.png';
import CryptoJS from "crypto-js";
import './Navbar.css';
import apiClient from './utils/apiClient';

const NavbarComponent = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, progress, setProgress }) => {
    const navigate = useNavigate();
    const [storedUsername, setStoredUsername] = useState('');
    const [userid, setUserid] = useState('');
    const [localProgress, setLocalProgress] = useState(progress || 0);

    const updateProgress = typeof setProgress === 'function' ? setProgress : (val) => setLocalProgress(val);

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (username) {
            setStoredUsername(username);
        }
        const storedEncryptedUserID = localStorage.getItem('userID');
        if (storedEncryptedUserID) {
            const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
            setUserid(bytes.toString(CryptoJS.enc.Utf8));
        }
    }, []);

    useEffect(() => {
        const handleProfileUpdate = () => {
            if (isLoggedIn && userRole === 'company') {
                fetchProfileCompletion();
            }
        };
        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, [isLoggedIn, userRole, userid]);

    const fetchProfileCompletion = async () => {
        if (!userid) return; // 🛡️ Safety check
        try {
            const response = await apiClient(
                `trainer/trainers/get/${userid}`,
                "GET",
                null,
                { "Content-Type": "application/json" }
            );

            if (response && response[0]) {
                const profile = response[0];
                const requiredFields = ["name", "education", "resume", "current_location", "native_location"];
                let filledCount = 0;
                requiredFields.forEach((field) => {
                    if (profile && profile[field]) {
                        if (field === "education") {
                            if (Array.isArray(profile[field]) && profile[field].length > 0 &&
                                profile[field].some((edu) => edu.degree && edu.year && edu.institution)) {
                                filledCount++;
                            }
                        } else {
                            if (profile[field].toString().trim() !== "") {
                                filledCount++;
                            }
                        }
                    }
                });
                const completionPercent = (filledCount / requiredFields.length) * 100;
                updateProgress(Math.floor(completionPercent));
            }
        } catch (error) {
            if (!error.message.includes('404')) {
                console.error("Error fetching profile completion:", error);
            }
        }
    };

    useEffect(() => {
        if (isLoggedIn && userid && userRole === 'company') {
            fetchProfileCompletion();
        }
    }, [isLoggedIn, userRole, userid]);

    const handleLogoClick = () => {
        const currentRole = userRole || localStorage.getItem('role');
        const checkLogin = isLoggedIn || !!localStorage.getItem('username');

        if (checkLogin) {
            if (currentRole === 'admin') navigate('/adminPanel');
            else if (currentRole === 'staff') navigate('/teacherDashboard');
            else if (currentRole === 'doctor') navigate('/doctorDashboard');
            else navigate('/UserDashboard');
        } else {
            navigate('/');
        }
    };

    const handleProfileClick = () => {
        const currentRole = userRole || localStorage.getItem('role');
        if (currentRole === 'admin') navigate('/adminPanel');
        else if (currentRole === 'staff') navigate('/teacherDashboard');
        else if (currentRole === 'doctor') navigate('/doctorDashboard');
        else navigate('/UserDashboard');
    };

    const displayProgress = typeof progress === 'number' ? progress : localProgress;

    return (
        <div className="navigation-container">
            <Navbar expand="lg" className="custom-navbar">
                <Navbar.Brand className="brand-name" onClick={handleLogoClick}>
                    <img
                        src={logo}
                        alt="CodingBoss Logo"
                        style={{ height: '45px', marginRight: '12px', cursor: 'pointer' }}
                    />
                    <b style={{ cursor: 'pointer' }}>
                        Coding<span className="flash">Boss</span>
                    </b>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto acc-creation" style={{ marginLeft: 'auto' }}>
                        {isLoggedIn ? (
                            <Nav className="user-profile-section" style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                                <div style={{ marginRight: '15px' }}>
                                    <b> {storedUsername}</b>
                                </div>
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="unlink" className="profile-dropdown" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className="progress-circle-outline" style={{ '--progress': `${displayProgress}` }}>
                                            <span className="progress-text">{displayProgress}%</span>
                                        </div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={handleProfileClick}>
                                            <b>Dashboard</b>
                                        </Dropdown.Item>
                                        <Dropdown.Item as={Link} to="/" onClick={handleLogout}>
                                            <b>Logout</b>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        ) : (
                            <div className="d-flex justify-content-center align-items-center">
                                <Link to="/LoginPage">
                                    <Button variant="warning" className="get-started-btn my-3 mt-lg-0 my-lg-0">
                                        <b>Secure Login</b>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
};

export default NavbarComponent;
