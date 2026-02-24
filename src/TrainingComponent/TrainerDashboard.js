import React, { useState,useEffect } from 'react'
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  Divider,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery, 
  Grid,
  Paper,
  CardContent, 
} from '@mui/material'

import CalendarComponent from './CalendarView' // Import your 
// Component
import Navbar from '../NavbarComponent.js' // Import Navbar
import CreativeForm from './CreativeForm'
import {
  CalendarMonth,
  PendingActions,
  CheckCircle,
  Cancel,
  Person,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import apiClient from '../utils/apiClient';
import CryptoJS from "crypto-js";
import { IconButton, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import Preloader from "../Preloader.js";

const TrainerDashboard = ({ isLoggedIn,setIsLoggedIn, username, userRole, handleLogout }) => {
  const [selectedTab, setSelectedTab] = useState('calendar')
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: '1',
      title: 'Locked: Training at College A',
      start: new Date('2024-11-20'),
      end: new Date('2024-11-25'),
      color: '#FF6347',
    },
    {
      id: '2',
      title: 'Training at College B',
      start: new Date('2024-12-05'),
      end: new Date('2024-12-10'),
      color: '#42A5F5',
    },
  ])

  
  //   {
  //     id: 1,
  //     title: "Leadership Training",
  //     description: "Corporate leadership training for professionals.",
  //     requester: "John Doe",
  //     date: "2025-04-01",
  //     company_name: "ABC Corp",
  //     program_title: "Leadership Training",
  //     event_place: "Conference Hall A",
  //     location: "New York",
  //     no_of_days: 3,
  //     start_date: "2025-04-10",
  //     end_date: "2025-04-12",
  //     toc: "Introduction, Workshops, Q&A",
  //     status: "pending",
  //   },
  //   {
  //     id: 2,
  //     title: "Communication Skills Workshop",
  //     description: "Enhance communication skills for managers.",
  //     requester: "Jane Smith",
  //     date: "2025-03-28",
  //     company_name: "XYZ Ltd.",
  //     program_title: "Communication Skills Workshop",
  //     event_place: "Meeting Room B",
  //     location: "Los Angeles",
  //     no_of_days: 2,
  //     start_date: "2025-05-01",
  //     end_date: "2025-05-02",
  //     toc: "Theory, Practice, Role-play",
  //     status: "accepted",
  //   },
  //   {
  //     id: 3,
  //     title: "Time Management Seminar",
  //     description: "Time management strategies for busy professionals.",
  //     requester: "Michael Lee",
  //     date: "2025-03-25",
  //     company_name: "Tech Solutions",
  //     program_title: "Time Management Seminar",
  //     event_place: "Board Room C",
  //     location: "San Francisco",
  //     no_of_days: 1,
  //     start_date: "2025-04-20",
  //     end_date: "2025-04-20",
  //     toc: "Time-blocking, Prioritization, Tools",
  //     status: "denied",
  //   },
  // ]);
  const [userId, setUserId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [deniedRequests, setDeniedRequests] = useState([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [currentToc, setCurrentToc] = useState('');
  const [loading, setLoading] = useState(true);
 

   const navigate = useNavigate()
  


  const isMobile = useMediaQuery('(max-width: 600px)') // Check if the screen is mobile

  
   useEffect(() => {
      const autoLogin = async () => {
        if (!isLoggedIn) {
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
              if (!response.status === "success") {
                navigate('/LoginPage');
                return; 
              } else {
                setIsLoggedIn(true);
                if (response.role !== "company") {
                  if (response.role === "college") {
                    navigate('/UserDashboard');
                    return; 
                  } else {
                    navigate('/');
                    return; 
                  }
                }
              }
            } catch (error) {
              navigate('/LoginPage');
              return; 
            }
          } else {
            navigate('/LoginPage');
            return; 
          }
        } else if (userRole !== "company") {
          if (userRole === "college") {
            navigate('/UserDashboard');
            return; 
          } else {
            navigate('/');
            return; 
          }
        }
        setLoading(false);
      };
    
      autoLogin();
    }, []);
    
  


    // 🔐 Decrypt User ID from session storage
    useEffect(() => {
      const storedEncryptedUserID = localStorage.getItem('userID');
      if (storedEncryptedUserID) {
        try {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
          console.log("Decrypted User ID:", decryptedUserId);
          setUserId(decryptedUserId);
        } catch (error) {
          console.error("Error decrypting user ID:", error);
        }
      } else {
        console.warn("No user ID found in localStorage.");
      }
    }, []);

    useEffect(() => {
      if (userId) {
        // Fetch Pending Requests
        axios.get(`https://api.codingboss.in/trainer/filter_by_status/Pending/?user=${userId}`)
          .then(response => {
            setPendingRequests(response.data);
          })
          .catch(error => {
            console.error("Error fetching pending requests:", error);
          });
    
        // Fetch Accepted Requests
        axios.get(`https://api.codingboss.in/trainer/filter_by_status/Accepted/?user=${userId}`)
          .then(response => {
            setAcceptedRequests(response.data);
          })
          .catch(error => {
            console.error("Error fetching accepted requests:", error);
          });
    
        // Fetch Denied Requests
        axios.get(`https://api.codingboss.in/trainer/filter_by_status/Denied/?user=${userId}`)
          .then(response => {
            setDeniedRequests(response.data);
          })
          .catch(error => {
            console.error("Error fetching denied requests:", error);
          });
      }
    }, [userId,selectedTab]);
  

  // Handlers
  const handleDateBlock = (newEvent) => {
    setCalendarEvents((prevEvents) => [...prevEvents, newEvent])
  }

  const handleDateUnblock = (eventId) => {
    setCalendarEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    )
  }

   
const renderFile = (toc) => {
  if (!toc) {
    return <Typography color="error">No TOC Available</Typography>;
  }

  const fileName = toc.split('/').pop();  // Assuming 'toc' is a URL or path



  return (
    <Box>
      <Tooltip title={`Download ${fileName}`}>
        <IconButton
          sx={{
            color: "#1565c0",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          }}
          onClick={() => handleDownload(toc)} // Trigger download
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>
      <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
        {fileName}
      </Typography>
    </Box>
  );
};

// Handle the download
const handleDownload = async (toc) => {
  const fileUrl = `https://snappier-reapply-kieth.ngrok-free.dev${toc}`;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('File not found!');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const fileName = toc.split('/').pop();  // Extract the filename
    link.setAttribute("download", fileName);  // Suggest filename

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);  // Clean up
  } catch (error) {
    console.error("Error downloading the file:", error);
    alert("File could not be downloaded.");
  }
};




const handleAcceptRequest = async (id) => {
  const payload = {
    user: userId,
   status:"Accepted"
  };

  try {
    const response = await axios.put(
      `https://api.codingboss.in/trainer/program/update/${id}`,
      payload
    );

  
    setSelectedTab('accepted');
  } catch (error) {
    console.error("Error updating program:", error);
  }

};


const handleDenyRequest = async (id) => {
  const payload = {
    user: userId,
   status:"Denied"
  };

  try {
    const response = await axios.put(
      `https://api.codingboss.in/trainer/program/update/${id}`,
      payload
    );

  
    setSelectedTab('denied');
  } catch (error) {
    console.error("Error updating program:", error);
  }

};


  const handleRestoreRequest = async (id) => {
    const payload = {
      user: userId,
     status:"Pending"
    };
  
    try {
      const response = await axios.put(
        `https://api.codingboss.in/trainer/program/update/${id}`,
        payload
      );
  
      setSelectedTab('pending')
    } catch (error) {
      console.error("Error updating program:", error);
    }
  
  };

  const InfoRow = ({ label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: "wrap" }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{ color: "#1565c0", mr: 1, minWidth: "100px" }}
      >
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
  

  const renderContent = () => {
    switch (selectedTab) {
      case 'calendar':
        return (
          <>
            <Typography variant="h4" textAlign="center" mb={4}>
              My Calendar
            </Typography>
            <Box mt={4}>
              <CalendarComponent
                events={calendarEvents}
                isEditable={true}
                onDateBlock={handleDateBlock} 
                onDateUnblock={handleDateUnblock}
              />
            </Box>
          </>
        )
        case 'pending':
          return (
            <Box sx={{ width: "100%", p: { xs: 1, sm: 3 } }}>
              <Typography
                variant="h4"
                textAlign="center"
                mb={4}
                fontWeight="bold"
                color="#ff9800"
              >
                Pending Requests
              </Typography>
        
              {pendingRequests.length === 0 ? (
                <Typography textAlign="center" color="text.secondary">
                  No pending requests found.
                </Typography>
              ) : (
                pendingRequests.map((req) => (
                  <Card
                    key={req.id}
                    elevation={6}
                    sx={{
                      mb: 3,
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#fff",
                      boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #ff9800, #ff5722)",
                        p: { xs: 2, sm: 3 },
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {req.program_title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {req.company_name}
                        </Typography>
                      </Box>
                      <Box sx={{ fontSize: 40 }}>📄</Box>
                    </Box>
        
                    {/* Details */}
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="🏢 Company:" value={req.company_name} />
                          <InfoRow label="🎯 Program:" value={req.program_title} />
                          <InfoRow label="📍 Location:" value={req.location} />
                        </Grid>
        
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="📅 Event Place:" value={req.event_place || "N/A"} />
                          <InfoRow label="⏳ Duration:" value={`${req.no_of_days} days`} />
                          <InfoRow label="🗓 Dates:" value={`${req.start_date} → ${req.end_date}`} />
                        </Grid>
                      </Grid>
        
                      <Divider sx={{ my: 2 }} />
        
                      {/* TOC File Section */}
                      <Box sx={{ mt: 2 }}>{renderFile(req.toc)}</Box>
                    </CardContent>
        
                    {/* Footer */}
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        background: "#fafafa",
                        borderTop: "2px solid #ff9800",
                      }}
                    >
                      <Box sx={{ mb: { xs: 1, sm: 0 } }}>
                        <Typography><strong>👤 Requester:</strong> {req.requester}</Typography>
                        <Typography><strong>📆 Request Date:</strong> {new Date(req.date).toLocaleDateString()}</Typography>
                      </Box>
        
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          sx={{
                            background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                            color: "white",
                            "&:hover": { background: "#1b5e20" }
                          }}
                          onClick={() => handleAcceptRequest(req.id)}
                        >
                          ✅ Accept
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            background: "linear-gradient(135deg, #e53935, #b71c1c)",
                            color: "white",
                            "&:hover": { background: "#b71c1c" }
                          }}
                          onClick={() => handleDenyRequest(req.id)}
                        >
                          ❌ Deny
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          );
        
          case 'accepted':
            return (
              <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h4"
                  textAlign="center"
                  mb={4}
                  fontWeight="bold"
                  color="#1565c0"
                >
                  Accepted Requests
                </Typography>
          
                {acceptedRequests.length === 0 ? (
                  <Typography textAlign="center" color="text.secondary">
                    No accepted requests found.
                  </Typography>
                ) : (
                  acceptedRequests.map((req) => (
                    <Card
                      key={req.id}
                      elevation={6}
                      sx={{
                        mb: 3,
                        borderRadius: "16px",
                        overflow: "hidden",
                        backdropFilter: "blur(10px)",
                        background: "rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.02)" }
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          background: "linear-gradient(135deg, #1565c0, #1e88e5)",
                          p: { xs: 2, sm: 3 },
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {req.program_title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {req.company_name}
                          </Typography>
                        </Box>
                        <Box sx={{ fontSize: 40 }}>✅</Box>
                      </Box>
          
                      {/* Details */}
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                🏢 Company:
                              </Typography>
                              <Typography variant="body1">{req.company_name}</Typography>
                            </Box>
          
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                🎯 Program:
                              </Typography>
                              <Typography variant="body1">{req.program_title}</Typography>
                            </Box>
          
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                📍 Location:
                              </Typography>
                              <Typography variant="body1">{req.location}</Typography>
                            </Box>
                          </Grid>
          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                📅 Event Place:
                              </Typography>
                              <Typography variant="body1">{req.event_place || "N/A"}</Typography>
                            </Box>
          
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                ⏳ Duration:
                              </Typography>
                              <Typography variant="body1">{req.no_of_days} days</Typography>
                            </Box>
          
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>
                                🗓 Dates:
                              </Typography>
                              <Typography variant="body1">
                                {req.start_date} → {req.end_date}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
          
                        <Divider sx={{ my: 2 }} />
          
                        {/* TOC File */}
                        <Box sx={{ mt: 2 }}>
                          {req.toc ? renderFile(req.toc) : (
                            <Typography color="error">No TOC Available</Typography>
                          )}
                        </Box>
                      </CardContent>
          
                      {/* Footer */}
                      <Box
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "center" },
                          background: "#f0f7ff",
                          borderTop: "2px solid #1565c0",
                          gap: { xs: 1, sm: 0 }
                        }}
                      >
                        <Box>
                          <Typography>
                            <strong>👤 Requester:</strong> {req.requester}
                          </Typography>
                          <Typography>
                            <strong>📆 Request Date:</strong>{" "}
                            {new Date(req.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))
                )}
              </Box>
            );
          
          
            case 'denied':
              return (
                <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h4"
                    textAlign="center"
                    mb={4}
                    fontWeight="bold"
                    color="#d32f2f"
                  >
                    Denied Requests
                  </Typography>
            
                  {deniedRequests.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                      No denied requests found.
                    </Typography>
                  ) : (
                    deniedRequests.map((req) => (
                      <Card
                        key={req.id}
                        elevation={6}
                        sx={{
                          mb: 3,
                          borderRadius: "16px",
                          overflow: "hidden",
                          backdropFilter: "blur(10px)",
                          background: "rgba(255, 0, 0, 0.1)",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid rgba(255, 0, 0, 0.2)",
                          transition: "transform 0.3s ease",
                          "&:hover": { transform: "scale(1.02)" }
                        }}
                      >
                        {/* Header */}
                        <Box
                          sx={{
                            background: "linear-gradient(135deg, #b71c1c, #d32f2f)",
                            p: { xs: 2, sm: 3 },
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {req.program_title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {req.company_name}
                            </Typography>
                          </Box>
                          <Box sx={{ fontSize: 40 }}>❌</Box>
                        </Box>
            
                        {/* Details */}
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  🏢 Company:
                                </Typography>
                                <Typography variant="body1">{req.company_name}</Typography>
                              </Box>
            
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  🎯 Program:
                                </Typography>
                                <Typography variant="body1">{req.program_title}</Typography>
                              </Box>
            
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  📍 Location:
                                </Typography>
                                <Typography variant="body1">{req.location}</Typography>
                              </Box>
                            </Grid>
            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  📅 Event Place:
                                </Typography>
                                <Typography variant="body1">{req.event_place || "N/A"}</Typography>
                              </Box>
            
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  ⏳ Duration:
                                </Typography>
                                <Typography variant="body1">{req.no_of_days} days</Typography>
                              </Box>
            
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>
                                  🗓 Dates:
                                </Typography>
                                <Typography variant="body1">
                                  {req.start_date} → {req.end_date}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
            
                          <Divider sx={{ my: 2 }} />
            
                          {/* TOC File */}
                          <Box sx={{ mt: 2 }}>
                            {req.toc ? renderFile(req.toc) : (
                              <Typography color="error">No TOC Available</Typography>
                            )}
                          </Box>
                        </CardContent>
            
                        {/* Footer */}
                        <Box
                          sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "center" },
                            background: "#ffebee",
                            borderTop: "2px solid #b71c1c",
                            gap: { xs: 1, sm: 0 }
                          }}
                        >
                          <Box>
                            <Typography>
                              <strong>👤 Requester:</strong> {req.requester}
                            </Typography>
                            <Typography>
                              <strong>📆 Request Date:</strong>{" "}
                              {new Date(req.date).toLocaleDateString()}
                            </Typography>
                          </Box>
            
                          {/* Restore Button */}
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#1565c0",
                              color: "#fff",
                              width: { xs: "100%", sm: "auto" },
                              "&:hover": { backgroundColor: "#0d47a1" }
                            }}
                            onClick={() => handleRestoreRequest(req.id)}
                          >
                            🔄 Restore
                          </Button>
                        </Box>
                      </Card>
                    ))
                  )}
                </Box>
              );
            
            
      case 'Profile':
        return <CreativeForm setSelectedTab={setSelectedTab} />;
  
      default:
        return null;
    }
  }


  const [progress, setProgress] = useState();
    const fetchProfileCompletion = async () => {
      try {
        const response = await apiClient(
          `trainer/trainers/get/${userId}`,
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
          setProgress(Math.floor(completionPercent));
  
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
          setProgress(0);
        }
      } catch (error) {
        console.error("Error fetching profile completion:", error);
        setProgress(0);
      }
    };
  
    useEffect(()=> {
      fetchProfileCompletion();
    }, [selectedTab])

  return (
    <>
    {loading ? (<Preloader/>
    ): (
    <div>
      <Navbar
        isLoggedIn={isLoggedIn}
        setSelectedTab={setSelectedTab}
        username={username}
        userRole={userRole}
        handleLogout={handleLogout}
        progress={progress}
        setProgress={setProgress}
      />

      <div style={{ paddingTop: '100px', paddingLeft:"20px", paddingRight:"20px", maxWidth: '1500px', margin: '0 auto' }}>
        {!isMobile ? (
          <Box
            style={{
              display: 'flex',
              gap: '20px',
              borderRadius: '12px',
            }}
          >
            {/* Sidebar */}
            <Box
              style={{
                // width: '250px',
                marginTop:'100px',
                height:'300px',
                padding: '20px',
                backgroundColor: '#1976d2',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Trainer Dashboard
              </Typography>
              <Divider
                style={{ marginBottom: '20px', backgroundColor: '#fff' }}
              />
              {['calendar', 'pending', 'accepted', 'denied', 'Profile'].map(
                (tab) => (
                  <Typography
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    style={{
                      marginBottom: '16px',
                      cursor: 'pointer',
                      color:
                        selectedTab === tab
                          ? '#fff'
                          : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: selectedTab === tab ? 'bold' : 'normal',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {tab=='pending' ? 'Pending Requests' : tab=='accepted' ? 'Accepted Trainings' : tab=='denied' ? 'Denied / Expired' : tab=='calendar' ? 'Calendar' :tab}
                  </Typography>
                )
              )}
            </Box>

            {/* Main Content */}
            <Box style={{ flex: 1 }}>{renderContent()}</Box>
          </Box>
        ) : (
          <>
            <Box style={{ flex: 1, paddingBottom: '56px' }}>
              {renderContent()}
            </Box>
            <BottomNavigation
              value={selectedTab}
              onChange={(event, newValue) => setSelectedTab(newValue)}
              showLabels
              sx={{
                position: 'fixed',
                bottom: 0,
                height:80,
                left: 0,
                right: 0,
                backgroundColor: '#1976d2', // Solid color, no transparency
                zIndex: 1300, // Ensure it sits above other elements
                '& .Mui-selected': {
                  color: '#fff', // Change the selected tab icon and label color to white
                  transition: 'color 0.3s ease-in-out', // Smooth animation
                },
                '& .MuiBottomNavigationAction-root': {
                  color: 'rgba(255, 255, 255, 0.7)', // Default color for unselected items
                  transition: 'color 0.3s ease-in-out', // Smooth animation
                },
                '& .MuiBottomNavigationAction-root:hover': {
                  color: '#ffffff', // Change color on hover
                },
              }}
            >
              <BottomNavigationAction
                label="Calendar"
                value="calendar"
                icon={<CalendarMonth />}
              />
               <BottomNavigationAction
                label="Accepted"
                value="accepted"
                icon={<CheckCircle />}
              />
              <BottomNavigationAction
                label="Pending"
                value="pending"
                icon={<PendingActions />}
              />
              <BottomNavigationAction
                label="Denied"
                value="denied"
                icon={<Cancel />}
              />
              <BottomNavigationAction
                label="Profile"
                value="Profile"
                icon={<Person />}
              />
            </BottomNavigation>
          </>
        )}
      </div>
    </div>
    )}
    </>
  )
}

export default TrainerDashboard;
