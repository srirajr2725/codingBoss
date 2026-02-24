import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from './images/Codingboss-logo-1.png';
import CryptoJS from "crypto-js";
import './Navbar.css';
import apiClient from './utils/apiClient';

const NavbarComponent = ({ isLoggedIn, setIsLoggedIn, userRole, handleLogout, progress, setProgress }) => {
    const navigate = useNavigate();
    const [storedUsername, setStoredUsername] = useState('');
    const [userid, setUserid] = useState('');
    // Ensure progress is properly initialized if not passed as prop
    const [localProgress, setLocalProgress] = useState(progress || 0);

    // Use either the prop function or a local no-op function to prevent errors
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
        // Event listener to refresh profile completion when profile is updated
        const handleProfileUpdate = () => {
            if (isLoggedIn && userRole === 'company') {
                fetchProfileCompletion();
            }
        };

        window.addEventListener('profile-updated', handleProfileUpdate);

        // Clean up the event listener when component unmounts
        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, [isLoggedIn, userRole, userid]);

    const autoLogin = async () => {
        if (localStorage.getItem("username") && localStorage.getItem("password")) {
            const email = localStorage.getItem("username");
            const EncryptPassword = localStorage.getItem("password");
            const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
            const password = bytes.toString(CryptoJS.enc.Utf8);
            try {
                const response = await apiClient(
                    "quiz/users/login/",
                    "POST",
                    JSON.stringify({ email, password }),
                    { "Content-Type": "application/json" }
                );
                if (response.status === "success") {
                    setIsLoggedIn(true);
                    if (response.role === "college") {
                        navigate('/UserDashboard');
                    } else if (response.role === "company") {
                        navigate('/TrainerDashboard');
                    } else {
                        navigate('/');
                    }
                } else {
                    navigate('/LoginPage');
                }
            } catch (error) {
                navigate('/LoginPage');
            }
        } else {
            navigate('/LoginPage');
        }
    };

    const fetchProfileCompletion = async () => {
        try {
            const response = await apiClient(
                `trainer/trainers/get/${userid}`,
                "GET",
                null,
                { "Content-Type": "application/json" }
            );

            if (response && response[0]) {
                const profile = response[0];
                // These are the required fields for completion percentage
                const requiredFields = [
                    "name",
                    "education",
                    "resume",
                    "current_location",
                    "native_location",
                ];
                let filledCount = 0;
                const totalFields = requiredFields.length; // Always 5 fields

                requiredFields.forEach((field) => {
                    if (field === "education") {
                        // For education array, check if it exists and has at least one entry with required data
                        if (
                            Array.isArray(profile[field]) &&
                            profile[field].length > 0 &&
                            profile[field].some(
                                (edu) => edu.degree && edu.year && edu.institution
                            )
                        ) {
                            filledCount++;
                        }
                    } else {
                        // For other fields, check if they have a non-empty value
                        if (profile[field] && profile[field].toString().trim() !== "") {
                            filledCount++;
                        }
                    }
                });

                const completionPercent = (filledCount / totalFields) * 100;
                updateProgress(Math.floor(completionPercent)); // Use the safe function

                const event = new CustomEvent("profile-completion-updated", {
                    detail: { completion: Math.floor(completionPercent) },
                });
                window.dispatchEvent(event);

                // Console log for debugging
                console.log("Profile completion fields:", {
                    name: !!profile.name,
                    education: !!(
                        Array.isArray(profile.education) &&
                        profile.education.length > 0 &&
                        profile.education.some(
                            (edu) => edu.degree && edu.year && edu.institution
                        )
                    ),
                    resume: !!profile.resume,
                    current_location: !!profile.current_location,
                    native_location: !!profile.native_location,
                    completionPercent,
                });
            } else {
                updateProgress(0); // Use the safe function
            }
        } catch (error) {
            console.error("Error fetching profile completion:", error);
            updateProgress(0); // Use the safe function
        }
    };

    useEffect(() => {
        if (isLoggedIn && userid) {
            fetchProfileCompletion();
        }
    }, [isLoggedIn, userRole, userid]);

    const handleLogoClick = () => {
        if (!userRole) {
            autoLogin();
        } else if (userRole === 'college') {
            navigate('/UserDashboard');
        }
        // else if (userRole === 'company') {
        //     navigate('/TrainerDashboard');
        // }
    };

    const handleProfileClick = () => {
        if (userRole === 'college') {
            navigate('/UserDashboard');
        } else if (userRole === 'company') {
            navigate('/TrainerDashboard');
        }
    };

    // Use either the prop value or the local state value
    const displayProgress = typeof progress === 'number' ? progress : localProgress;

    return (
        <div className="navigation-container">
            <Navbar expand="lg" className="custom-navbar">
                <Navbar.Brand className="brand-name">
                    <img src={logo} alt="Logo" className="logo" onClick={handleLogoClick} />
                    <b onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                        Coding<span className="flash">boss</span>
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
                                            <span className="progress-text">{progress}%</span>
                                        </div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item as={Link} to="/" onClick={handleLogout}>
                                            <b>Logout</b>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        ) : (
                            <div className="d-flex justify-content-center">
                                <Link to="/LoginPage">
                                    <Button variant="warning" className="get-started-btn my-3 me-3 mt-3 mt-lg-0 my-lg-0">
                                        <b>Login</b>
                                    </Button>
                                </Link>
                                <Link to="/SignUp">
                                    {/* <Button variant="warning" className="get-started-btn my-3 mt-3 mt-lg-0 my-lg-0">
                                        <b>Sign Up</b>
                                    </Button> */}
                                </Link>
                            </div>
                        )}
                    </Nav>

                    {isLoggedIn && userRole === 'company' && typeof displayProgress === 'number' && (
                        <div className={`profile-progress-text ${displayProgress === 100 ? 'complete' : ''}`} style={{ marginLeft: '20px', fontWeight: 'bold' }}>
                        </div>
                    )}
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
};

export default NavbarComponent;