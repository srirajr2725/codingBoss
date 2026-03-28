import React, { useState ,useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card,Chip,Link,CardMedia, Paper,Grid ,Divider,Checkbox, MenuItem, Pagination, Select,Modal,Avatar, CardContent, FormControl, InputLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField
 } from '@mui/material';
 import { LocationOn, School, Work, Timeline, 
  MenuBook,
  Star,
  Description,
  Folder,
  Close as CloseIcon,
  LinkedIn,
  Cake,
  Phone,
  Home,
 } from "@mui/icons-material"; 
 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import DashboardStatistics from './DashboardStatistics' ;
import Autocomplete from '@mui/material/Autocomplete';
import CryptoJS from 'crypto-js';



const AdminPanel = ({ isLoggedIn, setIsLoggedIn, setUserRole, username, handleLogout, userRole }) => {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
 const [selectedTrainer, setSelectedTrainer] = useState('');
const [newEvent, setNewEvent] = useState({
  trainer: [], // <- must be an array
  program_title: "",
  event_place: "",
  location: "",
  startDate: "",
  endDate: "",
  no_of_days: 1,
  toc: null,
    tocFile: null, // Actual file to be sent to backend
  });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
 const [selectedExperience, setSelectedExperience] = useState("");
 const [selectedSkills, setSelectedSkills] = useState([]);
 const [selectedProgram, setSelectedProgram] = useState('');
 const [pendingProgram, setPendingProgram] = useState('');
const [pendingTrainer, setPendingTrainer] = useState('');
const [deniedProgram, setDeniedProgram] = useState('');
const [deniedTrainer, setDeniedTrainer] = useState('');
const [currentView, setCurrentView] = useState("Trainer-Profiles");
const [openProfileModal, setOpenProfileModal] = useState(false);
const [selectedTrainerProfile, setSelectedTrainerProfile] = useState(null);
const [trainers, setTrainers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
 const [userName, setUserName] = React.useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
const [requests, setRequests] = useState([]);
const [userId, setUserId] = useState(null); // ✅ This is necessary
 const [pendingRequests, setPendingRequests] = useState([]);
const [acceptedRequests, setAcceptedRequests] = useState([]);
const [deniedRequests, setDeniedRequests] = useState([]);
   const [page, setPage] = useState(1);
   const trainersPerPage = 5;
   const totalPages = Math.ceil(trainers.length / trainersPerPage);
   

   const resetBookingForm = () => {
    setNewEvent({
      trainer: [],
      program_title: "",
      event_place: "",
      location: "",
      startDate: "",
      endDate: "",
      no_of_days: "",
      toc: null,
    });
    setUserName("");
  };
  

   React.useEffect(() => {
    const email = localStorage.getItem("username");
    if (email) {
      setUserName(email.split("@")[0]);
    }
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
        const fetchTrainers = async () => {
          try {
            const res = await axios.get("https://api.codingboss.in/trainer/list_profiles/");
            
            // Validate the response data
            if (Array.isArray(res.data)) {
              const formattedTrainers = res.data.map(trainer => ({
                id: trainer.user_id, // Ensuring this matches event.user and decrypted userId
                name: trainer.name,
                location: trainer.location,
                degree: trainer.degree,
                passoutYear: trainer.passout_year,
                experience: trainer.experience,
                trainings: trainer.trainings_count,
                skills: trainer.skills || [],
                status: trainer.status,
                photoUrl: trainer.photo || `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 10)}.jpg`
              }));
      
              setTrainers(formattedTrainers);
            } else {
              console.error("Response data is not an array", res.data);
              setTrainers([]); // fallback to empty array
            }
      
          } catch (err) {
            console.error("Failed to fetch trainers:", err);
            setTrainers([
              {
                id: 'T1',
                name: 'Alice Walker',
                location: 'New York',
                degree: 'M.Tech',
                passoutYear: 2018,
                experience: 5,
                trainings: 25,
                skills: ['Python', 'Django', 'REST APIs'],
                status: 'Teaching',
                photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
              },
              {
                id: 'T2',
                name: 'David Lee',
                location: 'Chicago',
                degree: 'B.Sc IT',
                passoutYear: 2016,
                experience: 8,
                trainings: 50,
                skills: ['JavaScript', 'React', 'Node.js'],
                status: 'Available',
                photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg'
              },
              {
                id: 'T3',
                name: 'Michael Johnson',
                location: 'Los Angeles',
                degree: 'B.E.',
                passoutYear: 2017,
                experience: 7,
                trainings: 40,
                skills: ['Java', 'Spring Boot', 'Microservices'],
                status: 'Teaching',
                photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
              },
              {
                id: 'T4',
                name: 'Sophia Green',
                location: 'Seattle',
                degree: 'B.Tech',
                passoutYear: 2019,
                experience: 4,
                trainings: 20,
                skills: ['HTML', 'CSS', 'Vue.js'],
                status: 'Available',
                photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
              },
              {
                id: 'T5',
                name: 'James Brown',
                location: 'Houston',
                degree: 'MCA',
                passoutYear: 2015,
                experience: 9,
                trainings: 55,
                skills: ['C#', '.NET', 'Azure'],
                status: 'On Leave',
                photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg'
              },
              {
                id: 'T6',
                name: 'Emma Davis',
                location: 'San Francisco',
                degree: 'BCA',
                passoutYear: 2020,
                experience: 3,
                trainings: 18,
                skills: ['Flutter', 'Firebase', 'Dart'],
                status: 'Teaching',
                photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg'
              },
              {
                id: 'T7',
                name: 'William Martin',
                location: 'Boston',
                degree: 'B.Sc CS',
                passoutYear: 2014,
                experience: 10,
                trainings: 70,
                skills: ['AWS', 'DevOps', 'Terraform'],
                status: 'Available',
                photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg'
              },
              {
                id: 'T8',
                name: 'Olivia Wilson',
                location: 'Denver',
                degree: 'M.Sc IT',
                passoutYear: 2013,
                experience: 11,
                trainings: 85,
                skills: ['Data Science', 'Machine Learning', 'Python'],
                status: 'Teaching',
                photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg'
              },
              {
                id: 'T9',
                name: 'Liam Thomas',
                location: 'Phoenix',
                degree: 'B.Tech',
                passoutYear: 2021,
                experience: 2,
                trainings: 12,
                skills: ['Kotlin', 'Android', 'Jetpack Compose'],
                status: 'Available',
                photoUrl: 'https://randomuser.me/api/portraits/men/9.jpg'
              },
              {
                id: 'T10',
                name: 'Ava Robinson',
                location: 'Atlanta',
                degree: 'B.Sc IT',
                passoutYear: 2018,
                experience: 5,
                trainings: 30,
                skills: ['PHP', 'Laravel', 'MySQL'],
                status: 'Teaching',
                photoUrl: 'https://randomuser.me/api/portraits/women/10.jpg'
              }
            ]);
          }
        };
      
        fetchTrainers();
      }, []);
      

  // Fetch events for selected trainer
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedTrainer) return;
  
      try {
        const response = await axios.get(
          `https://api.codingboss.in/trainer/filter_program_by_user_id/?user_id=${selectedTrainer}`
        );
        setCalendarEvents(response.data); // assuming the data is directly the event list
      } catch (error) {
        console.error("Error fetching events:", error);
  
        // Set static event as fallback
        setCalendarEvents([
          {
            id: 1,
            user: 'T1',
            company_name: "Trew",
            program_title: "Full Stack Bootcamp",
            event_place: "Tech Park",
            location: "Bangalore",
            start_date: "2025-02-25",
            end_date: "2025-02-25",
            no_of_days: "1",
            toc: "/media/uploads/trainer_toc/Arun_Kumar_S.pdf",
            status: "Accepted",
            working_days: null,
            non_working_days: null
          },
          {
            id: 2,
            user: 'T1',
            company_name: "InnovaSoft",
            program_title: "Advanced Java",
            event_place: "Office Campus A",
            location: "Hyderabad",
            start_date: "2025-03-10",
            end_date: "2025-03-12",
            no_of_days: "3",
            toc: "/media/uploads/trainer_toc/Advanced_Java.pdf",
            status: "Accepted",
            working_days: null,
            non_working_days: null
          },
          {
            id: 3,
            user: 'T1',
            company_name: "NextGen IT",
            program_title: "Cloud Computing Essentials",
            event_place: "Main Auditorium",
            location: "Chennai",
            start_date: "2025-04-01",
            end_date: "2025-04-03",
            no_of_days: "3",
            toc: "/media/uploads/trainer_toc/Cloud_Computing.pdf",
            status: "Accepted",
            working_days: null,
            non_working_days: null
          },
          {
            id: 4,
            user: 'T1',
            company_name: "CodeCraft",
            program_title: "React Mastery",
            event_place: "Room 202",
            location: "Mumbai",
            start_date: "2025-04-15",
            end_date: "2025-04-16",
            no_of_days: "2",
            toc: "/media/uploads/trainer_toc/React_Masterclass.pdf",
            status: "Accepted",
            working_days: null,
            non_working_days: null
          },
          {
            id: 5,
            user: 'T1',
            company_name: "Digitronix",
            program_title: "Python for Data Science",
            event_place: "Innovation Hub",
            location: "Pune",
            start_date: "2025-05-05",
            end_date: "2025-05-07",
            no_of_days: "3",
            toc: "/media/uploads/trainer_toc/Python_DS.pdf",
            status: "Accepted",
            working_days: null,
            non_working_days: null
          }
        ]);
        
          
      }
    };
  
    fetchEvents();
  }, [selectedTrainer]);
  


 // Automatically calculate the number of days based on the start and end date
useEffect(() => {
  if (newEvent.startDate && newEvent.endDate) {
    const start = new Date(newEvent.startDate);
    const end = new Date(newEvent.endDate);

    if (start <= end) {
      const days = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1; // Including the end date
      setNewEvent((prev) => ({
        ...prev,
        no_of_days: days,
      }));
    }
  }
}, [newEvent.startDate, newEvent.endDate]);
const handleCloseTrainerModal = () => {
  setSelectedTrainer(null);
  setOpenModal(false);
};


useEffect(() => {
  if (selectedTab === "calendar") {
    const el = document.getElementById("calendar-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
}, [selectedTab]);


// Handle closing the booking modal
const handleClose = () => {
  setOpenBookingModal(false);
};

// Handle file upload
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setNewEvent((prev) => ({
      ...prev,
      toc: file.name, // Store file name, modify if needed
    }));
  }
};

// Handle date selection on the calendar
const handleDateSelect = (selectInfo) => {
  const selectedStartDate = selectInfo.startStr;
  const selectedEndDate = selectInfo.endStr || selectedStartDate;

  if (new Date(selectedStartDate) > new Date(selectedEndDate)) {
    console.error("Start date cannot be after end date");
    return;
  }

  // Filter available trainers who are not booked in the selected period
  const availableTrainers = trainers.filter((trainer) =>
    !calendarEvents.some((event) =>
      event.trainerId === trainer.id &&
      new Date(event.startDate) <= new Date(selectedEndDate) &&
      new Date(event.endDate) >= new Date(selectedStartDate)
    )
  );

  setFilteredTrainers(availableTrainers);
  setNewEvent((prev) => ({
    ...prev,
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    no_of_days:
      Math.ceil((new Date(selectedEndDate) - new Date(selectedStartDate)) / (1000 * 60 * 60 * 24)) + 1, // Ensure no_of_days is accurate
  }));
  setOpenBookingModal(true);
};

const filteredALLTrainers = trainers.filter((trainer) => {
  const matchesLocation = selectedLocation === "" || trainer.location === selectedLocation;
  const matchesExperience = selectedExperience === "" || trainer.experience >= parseInt(selectedExperience);
  const matchesSkills = selectedSkills.length === 0 || selectedSkills.every(skill => trainer.skills.includes(skill));
  return matchesLocation && matchesExperience && matchesSkills;
});

const handleViewCalendar = (trainerId) => {
  setSelectedTrainer(trainerId);  // Filter calendar events
  setCurrentView("calendar");     // Show the calendar section
};


  

 const handleBookEvent = async () => {
  if (
    !newEvent.trainer.length ||
    !newEvent.program_title ||
    !newEvent.startDate ||
    !newEvent.endDate
  ) {
    return;
  }

  try {
    for (const trainerId of newEvent.trainer) {
      const formData = new FormData();
      formData.append("user", userId);
      formData.append("program_title", newEvent.program_title);
      formData.append("start_date", newEvent.startDate);
      formData.append("end_date", newEvent.endDate);
      formData.append("company_name", userName || "");
      formData.append("event_place", newEvent.event_place || "");
      formData.append("location", newEvent.location || "");
      formData.append("no_of_days", newEvent.no_of_days || "");
      formData.append("status", "pending");

      if (newEvent.toc instanceof File) {
        formData.append("toc", newEvent.toc); // ✅ correctly append file
      }

      await axios.post("https://api.codingboss.in/trainer/program/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setOpenBookingModal(false);
    resetBookingForm();
    alert("Requests sent successfully.");
  } catch (error) {
    console.error("Error submitting request", error);
    alert("Submission failed.");
  }
};







// ✅ Approve Request (Change Status Locally)
const handleApproveRequest = (eventId) => {
  setCalendarEvents((prevEvents) =>
    prevEvents.map((event) =>
      event.id === eventId ? { ...event, status: "Confirmed" } : event
    )
  );

  // Remove from requests list
  setEventRequests((prevRequests) => prevRequests.filter((req) => req.id !== eventId));
};

// ✅ Reject Request (Remove Locally)
const handleRejectRequest = (eventId) => {
  setCalendarEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  setEventRequests((prevRequests) => prevRequests.filter((req) => req.id !== eventId));
};

// ✅ Filter Events
const filteredEvents = calendarEvents
  .filter((event) => (selectedTrainer ? event.trainerId === selectedTrainer : true))
  .filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()));

// ✅ Handle Event Click (For Viewing Trainer Info)
const handleEventClick = (clickInfo) => {
  const trainerId = clickInfo.event.extendedProps?.trainerId;
  if (!trainerId) {
    console.error("Trainer ID not found in event data");
    return;
  }

  const trainer = trainers.find((t) => t.id === trainerId);
  if (trainer) {
    setSelectedTrainer(trainer);
    setOpenModal(true);
  } else {
    console.error("Trainer not found");
  }
};

const handleTocUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setNewEvent({ ...newEvent, toc: file });
  }
};


const renderFile = (toc) => {
  if (toc) {
    const fullURL = `https://snappier-reapply-kieth.ngrok-free.dev${toc}`;
    const fileName = toc.split('/').pop(); // optional: extract just the filename

    return (
      <Box>
        <Typography><strong>Table of Content:</strong></Typography>
        <Button 
          variant="contained" 
          color="primary" 
          href={fullURL} 
          download={fileName}
        >
          Download File
        </Button>
      </Box>
    );
  }
  return <Typography>No Table of Content available</Typography>;
};

  
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
  
  

   // Placeholder for Accept and Deny actions

const handleAcceptRequest = async (id) => {
  const payload = {
    user: userId,
    status: "Accepted"
  };

  try {
    const response = await axios.put(
      `https://api.codingboss.in/trainer/program/update/${id}`,
      payload
    );

    // ✅ Update calendar events
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, status: "Accepted" } : event
      )
    );

    // ✅ Update main requests list
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: "Accepted" } : req
      )
    );

    // ✅ Optional: switch tab
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

  
  const renderContent = () => {
  switch (selectedTab) {
    case "dashboard":
      return (
        <Box sx={{ p: 3 }}>
          <DashboardStatistics />
        </Box>
      );

      case "Trainer-Profiles":
        return (
          <Box sx={{ width: "100%", p: 3 }}>
            <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold">
              Trainer Overview
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2} mb={3} justifyContent="center">
  {/* Location Filter */}
  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>Location</InputLabel>
    <Select
      value={selectedLocation}
      onChange={(e) => setSelectedLocation(e.target.value)}
      label="Location"
    >
      <MenuItem value="">All</MenuItem>
      {[...new Set(trainers.map((t) => t.location))].map((loc) => (
        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* Experience Filter */}
  <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>Experience</InputLabel>
    <Select
      value={selectedExperience}
      onChange={(e) => setSelectedExperience(e.target.value)}
      label="Experience"
    >
      <MenuItem value="">All</MenuItem>
      {[...new Set(trainers.map((t) => t.experience))].sort((a, b) => a - b).map((exp) => (
        <MenuItem key={exp} value={exp}>{exp}+ years</MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* Skills Filter */}
  <Autocomplete
    multiple
    options={[...new Set(trainers.flatMap((t) => t.skills))]}
    value={selectedSkills}
    onChange={(e, value) => setSelectedSkills(value)}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip key={index} label={option} {...getTagProps({ index })} />
      ))
    }
    renderInput={(params) => (
      <TextField {...params} label="Skills" placeholder="Select Skills" sx={{ minWidth: 300 }} />
    )}
  />
</Box>

            <Grid container spacing={2} justifyContent="center">
              {filteredALLTrainers
                .slice((page - 1) * trainersPerPage, page * trainersPerPage)
                .map((trainer) => (
                  <Grid item xs={12} md={10} key={trainer.id}>
                 <Paper
  sx={{
    p: 3,
    bgcolor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
    "&:hover": { transform: "scale(1.02)" },
  }}
>
  <Grid container spacing={2} alignItems="center">
    {/* Profile Image - 2 columns */}
    <Grid item xs={12} sm={3}>
      <Box>
        <img
          src={`https://snappier-reapply-kieth.ngrok-free.dev${trainer.photoUrl}`}
          alt={trainer.name}
          style={{
            width: "100%",
            maxWidth: "200px",
            height: "200px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid white",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
      </Box>
    </Grid>

    {/* Trainer Details - 6 columns */}
    <Grid item xs={12} sm={6}>
      <Typography variant="h6" fontWeight="bold">
        {trainer.name}
      </Typography>

      <Box display="flex" alignItems="center" mt={1}>
        <LocationOn color="primary" />
        <Typography variant="body2" ml={1}>
          <b>Location:</b> {trainer.location}
        </Typography>
      </Box>
{/* 
      <Box display="flex" alignItems="center" mt={1}>
        <School color="secondary" />
        <Typography variant="body2" ml={1}>
          <b>Degree:</b> {trainer.degree} ({trainer.passoutYear})
        </Typography>
      </Box> */}

      {/* <Box display="flex" alignItems="center" mt={1}>
        <Work color="success" />
        <Typography variant="body2" ml={1}>
          <b>Experience:</b> {trainer.experience} years
        </Typography>
      </Box> */}

      {/* <Box display="flex" alignItems="center" mt={1}>
        <Timeline color="warning" />
        <Typography variant="body2" ml={1}>
          <b>Trainings Conducted:</b> {trainer.trainings}
        </Typography>
      </Box> */}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
        <b>Skills:</b>
        {trainer.skills.map((skill, index) => (
          <Box
            key={index}
            sx={{
              bgcolor: "#1976D2",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {skill.name} - {skill.rating}
          </Box>
        ))}
      </Box>
    </Grid>

    {/* Action Buttons - 4 columns */}
    <Grid item xs={12} sm={3}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button variant="contained" color="secondary" size="small">
          Download Profile
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => {
            setSelectedTrainerProfile({
              name: 'John Doe',
              mobile_number: '9876543210',
              dob: '1990-05-15',
              current_location: 'Bangalore',
              native_location: 'Chennai',
              linkedin_url: 'https://linkedin.com/in/johndoe',
              profilePicture: 'https://via.placeholder.com/100',
              education: [
                { degree: 'B.Tech', year: '2012', institution: 'IIT Madras' },
              ],
              experience: [
                { role: 'Trainer', organization: 'ABC Corp', duration: '3 years' },
              ],
              training_history: [
                {
                  company: 'Infosys',
                  eventPlace: 'Hyderabad',
                  programTitle: 'React Bootcamp',
                  audience: 'Developers',
                },
              ],
              skills: [
                { name: 'React', rating: 80 },
                { name: 'JavaScript', rating: 75 },
              ],
              projects: [
                {
                  title: 'E-commerce Website',
                  description: 'Full-stack e-commerce platform',
                  repoLink: 'https://github.com/example/project',
                  deployLink: 'https://example.com',
                  thumbnail: 'https://via.placeholder.com/150',
                },
              ],
              resume: 'https://example.com/resume.pdf',
            });
            setOpenProfileModal(true);
          }}
        >
          View Profile
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => {
            setSelectedTrainer(trainer.id);
            setSearchTerm("");
            setSelectedTab("calendar");
          }}
        >
          View Calendar
        </Button>
      </Box>
    </Grid>
  </Grid>
</Paper>

                  </Grid>
                ))}
            </Grid>
      
            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </Box>
        );

        case 'accepted':
          const uniquePrograms = [...new Set(acceptedRequests.map(req => req.program_title))];
          const uniqueTrainers = [...new Set(acceptedRequests.map(req => req.requester))];
        
          const filteredRequests = acceptedRequests.filter((req) => {
            return (
              (selectedProgram ? req.program_title === selectedProgram : true) &&
              (selectedTrainer ? req.requester === selectedTrainer : true)
            );
          });
        
          return (
            <Box sx={{ width: "100%", p: 3 }}>
              <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold" color="#1565c0">
                Accepted Requests
              </Typography>
        
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Program</InputLabel>
                  <Select
                    value={selectedProgram}
                    label="Filter by Program"
                    onChange={(e) => setSelectedProgram(e.target.value)}
                  >
                    <MenuItem value="">All Programs</MenuItem>
                    {uniquePrograms.map((program, index) => (
                      <MenuItem key={index} value={program}>{program}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
        
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Trainer</InputLabel>
                  <Select
                    value={selectedTrainer}
                    label="Filter by Trainer"
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                  >
                    <MenuItem value="">All Trainers</MenuItem>
                    {uniqueTrainers.map((trainer, index) => (
                      <MenuItem key={index} value={trainer}>{trainer}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
        
              {/* Filtered Cards */}
              {filteredRequests.map((req) => (
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
                      p: 3,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box />
                    <Box sx={{ fontSize: 40 }}>✅</Box>
                  </Box>
        
                  {/* Details */}
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>🏢 Company:</Typography>
                          <Typography variant="body1">{req.company_name}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>🎯 Program:</Typography>
                          <Typography variant="body1">{req.program_title}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>📍 Location:</Typography>
                          <Typography variant="body1">{req.location}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>📅 Event Place:</Typography>
                          <Typography variant="body1">{req.event_place}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>⏳ Duration:</Typography>
                          <Typography variant="body1">{req.no_of_days} days</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: "#1565c0", mr: 1 }}>🗓 Dates:</Typography>
                          <Typography variant="body1">{req.start_date} → {req.end_date}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
        
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2 }}>{renderFile(req.toc)}</Box>
                  </CardContent>
        
                  {/* Footer */}
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f0f7ff",
                      borderTop: "2px solid #1565c0",
                    }}
                  >
                    <Box>
                      <Typography><strong>👤 Requester:</strong> {req.requester}</Typography>
                      <Typography><strong>📆 Request Date:</strong> {new Date(req.date).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          );
          case 'denied':
            const deniedRequests = requests.filter((req) => req.status === "denied");
          
            const uniqueDeniedPrograms = [...new Set(deniedRequests.map(req => req.program_title))];
            const uniqueDeniedTrainers = [...new Set(deniedRequests.map(req => req.requester))];
          
            const filteredDeniedRequests = deniedRequests.filter((req) => {
              return (
                (deniedProgram ? req.program_title === deniedProgram : true) &&
                (deniedTrainer ? req.requester === deniedTrainer : true)
              );
            });
          
            return (
              <Box sx={{ width: "100%", p: 3 }}>
                <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold" color="#d32f2f">
                  Denied Requests
                </Typography>
          
                {/* Filter Controls */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Program</InputLabel>
                    <Select
                      value={deniedProgram}
                      label="Filter by Program"
                      onChange={(e) => setDeniedProgram(e.target.value)}
                    >
                      <MenuItem value="">All Programs</MenuItem>
                      {uniqueDeniedPrograms.map((program, index) => (
                        <MenuItem key={index} value={program}>{program}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
          
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Trainer</InputLabel>
                    <Select
                      value={deniedTrainer}
                      label="Filter by Trainer"
                      onChange={(e) => setDeniedTrainer(e.target.value)}
                    >
                      <MenuItem value="">All Trainers</MenuItem>
                      {uniqueDeniedTrainers.map((trainer, index) => (
                        <MenuItem key={index} value={trainer}>{trainer}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
          
                {filteredDeniedRequests.map((req) => (
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
                      "&:hover": { transform: "scale(1.03)" }
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #b71c1c, #d32f2f)",
                        p: 3,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box />
                      <Box sx={{ fontSize: 40 }}>❌</Box>
                    </Box>
          
                    {/* Details */}
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>🏢 Company:</Typography>
                            <Typography variant="body1">{req.company_name}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>🎯 Program:</Typography>
                            <Typography variant="body1">{req.program_title}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>📍 Location:</Typography>
                            <Typography variant="body1">{req.location}</Typography>
                          </Box>
                        </Grid>
          
                        <Grid item xs={6}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>📅 Event Place:</Typography>
                            <Typography variant="body1">{req.event_place}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>⏳ Duration:</Typography>
                            <Typography variant="body1">{req.no_of_days} days</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#b71c1c", mr: 1 }}>🗓 Dates:</Typography>
                            <Typography variant="body1">{req.start_date} → {req.end_date}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
          
                      <Divider sx={{ my: 2 }} />
          
                      {/* TOC File */}
                      <Box sx={{ mt: 2 }}>
                        {req.toc ? renderFile(req.toc) : <Typography color="error">No TOC Available</Typography>}
                      </Box>
                    </CardContent>
          
                    {/* Footer */}
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#ffebee",
                        borderTop: "2px solid #b71c1c",
                      }}
                    >
                      <Box>
                        <Typography><strong>👤 Requester:</strong> {req.requester}</Typography>
                        <Typography><strong>📆 Request Date:</strong> {new Date(req.date).toLocaleDateString()}</Typography>
                      </Box>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#1565c0",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#0d47a1" }
                        }}
                        onClick={() => handleRestoreRequest(req.id)}
                      >
                        🔄 Restore
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            );          
          
            case 'pending':
              const pendingRequests = requests.filter((req) => req.status === "pending");
            
              const uniquePendingPrograms = [...new Set(pendingRequests.map(req => req.program_title))];
              const uniquePendingTrainers = [...new Set(pendingRequests.map(req => req.requester))];
            
              const filteredPendingRequests = pendingRequests.filter((req) => {
                return (
                  (pendingProgram ? req.program_title === pendingProgram : true) &&
                  (pendingTrainer ? req.requester === pendingTrainer : true)
                );
              });
            
              return (
                <Box sx={{ width: "100%", p: 3 }}>
                  <Typography variant="h4" textAlign="center" mb={4} fontWeight="bold" color="#ff9800">
                    Pending Requests
                  </Typography>
            
                  {/* Filter Controls */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Filter by Program</InputLabel>
                      <Select
                        value={pendingProgram}
                        label="Filter by Program"
                        onChange={(e) => setPendingProgram(e.target.value)}
                      >
                        <MenuItem value="">All Programs</MenuItem>
                        {uniquePendingPrograms.map((program, index) => (
                          <MenuItem key={index} value={program}>{program}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
            
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Filter by Trainer</InputLabel>
                      <Select
                        value={pendingTrainer}
                        label="Filter by Trainer"
                        onChange={(e) => setPendingTrainer(e.target.value)}
                      >
                        <MenuItem value="">All Trainers</MenuItem>
                        {uniquePendingTrainers.map((trainer, index) => (
                          <MenuItem key={index} value={trainer}>{trainer}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
            
                  {/* Pending Cards */}
                  {filteredPendingRequests.map((req) => (
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
                        "&:hover": { transform: "scale(1.03)" }
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          background: "linear-gradient(135deg, #ff9800, #ff5722)",
                          p: 3,
                          color: "white",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <Box />
                        <Box sx={{ fontSize: 40 }}>📄</Box>
                      </Box>
            
                      {/* Request Details */}
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>🏢 Company:</Typography>
                              <Typography variant="body1">{req.company_name}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>🎯 Program:</Typography>
                              <Typography variant="body1">{req.program_title}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>📍 Location:</Typography>
                              <Typography variant="body1">{req.location}</Typography>
                            </Box>
                          </Grid>
            
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>📅 Event Place:</Typography>
                              <Typography variant="body1">{req.event_place}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>⏳ Duration:</Typography>
                              <Typography variant="body1">{req.no_of_days} days</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#ff9800", mr: 1 }}>🗓 Dates:</Typography>
                              <Typography variant="body1">{req.start_date} → {req.end_date}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
            
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mt: 2 }}>{renderFile(req.toc)}</Box>
                      </CardContent>
            
                      {/* Footer Actions */}
                      <Box
                        sx={{
                          p: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "#fafafa",
                          borderTop: "2px solid #ff9800",
                        }}
                      >
                        <Box>
                          <Typography><strong>👤 Requester:</strong> {req.requester}</Typography>
                          <Typography><strong>📆 Request Date:</strong> {new Date(req.date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box>
                          <Button
                            variant="contained"
                            sx={{
                              mr: 1,
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
                  ))}
                </Box>
              );
                    case "calendar":
          const filteredEvents = calendarEvents
            .filter((event) => event.status === "Accepted")
            .filter((event) =>
              event.program_title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter((event) =>
              selectedTrainer ? event.user === selectedTrainer : true
            );
        
          return (
            <Box id="calendar-section" mt={4} p={2}>
              <Typography variant="h4" textAlign="center" mb={3} fontWeight="bold">
                Training Calendar
              </Typography>
        
              {/* Search and Trainer Filter Controls */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                gap={2}
                flexWrap="wrap"
              >
                <TextField
                  variant="outlined"
                  placeholder="Search program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: 1, minWidth: "250px", maxWidth: "40%" }}
                />
                <Select
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  displayEmpty
                  sx={{ flex: 1, minWidth: "200px", maxWidth: "30%" }}
                >
                  <MenuItem value="">All Trainers</MenuItem>
                  {trainers.map((trainer) => (
                    <MenuItem key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
        
              {/* Calendar */}
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                events={filteredEvents.map((event) => ({
                  title: `${event.program_title} (${event.status})`,
                  start: event.start_date,
                  end: event.end_date,
                  color: "#42A5F5", // Blue for accepted
                }))}
                height="600px"
              />
            </Box>
          );
        
      
    default:
      return null;
  }
};

  return (
    <div>
      <div style={{ padding: '20px', maxWidth: '1500px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          <Box sx={{ width: '250px', p: 3, bgcolor: '#1976d2', color: '#fff', borderRadius: '12px' }}>
            <Typography variant="h6">Admin Panel</Typography>
            {['dashboard','Trainer-Profiles', 'calendar', 'pending', 'accepted', 'denied',].map((tab) => (
              <Typography
                key={tab}
                onClick={() => setSelectedTab(tab)}
                sx={{ cursor: 'pointer', mb: 2, textTransform: 'capitalize', fontWeight: tab === selectedTab ? 'bold' : 'normal' }}
              >
                {tab.replace('-', ' ').toUpperCase()}
              </Typography>
            ))}
          </Box>
          <Box sx={{ flex: 1 }}>{renderContent()}</Box>
        </Box>
      </div>

    
    {/* Booking Modal */}
    <Dialog open={openBookingModal} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle>Book Training Slot</DialogTitle>
  <DialogContent>
<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Trainer</InputLabel>
  <Select
    multiple
    value={newEvent.trainer}
    onChange={(e) => {
      const selected = e.target.value;
      if (selected.includes("all")) {
        setNewEvent({
          ...newEvent,
          trainer: filteredTrainers.map((t) => t.id),
        });
      } else {
        setNewEvent({ ...newEvent, trainer: selected });
      }
    }}
    renderValue={(selected) =>
      filteredTrainers
        .filter((t) => selected.includes(t.id))
        .map((t) => t.name)
        .join(", ")
    }
  >
    <MenuItem value="all">All Trainers</MenuItem>
    {filteredTrainers.map((trainer) => (
      <MenuItem key={trainer.id} value={trainer.id}>
        {trainer.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>



    <TextField
      fullWidth label="Program Title"
      value={newEvent.program_title}
      onChange={(e) => setNewEvent({ ...newEvent, program_title: e.target.value })}
      sx={{ mb: 2 }}
    />

<TextField
  fullWidth
  label="Company Name"
  value={userName}
  onChange={(e) => setUserName(e.target.value)}
  sx={{ mb: 2 }}
/>


    <TextField
      fullWidth label="Event Place"
      value={newEvent.event_place}
      onChange={(e) => setNewEvent({ ...newEvent, event_place: e.target.value })}
      sx={{ mb: 2 }}
    />

    <TextField
      fullWidth label="Location"
      value={newEvent.location}
      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
      sx={{ mb: 2 }}
    />

    <TextField
      fullWidth type="date" label="Start Date"
      value={newEvent.startDate}
      onChange={(e) =>
        setNewEvent({
          ...newEvent,
          startDate: e.target.value,
          no_of_days: calculateDays(e.target.value, newEvent.endDate)
        })
      }
      sx={{ mb: 2 }}
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      fullWidth type="date" label="End Date"
      value={newEvent.endDate}
      onChange={(e) =>
        setNewEvent({
          ...newEvent,
          endDate: e.target.value,
          no_of_days: calculateDays(newEvent.startDate, e.target.value)
        })
      }
      sx={{ mb: 2 }}
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      fullWidth label="No. of Days"
      value={newEvent.no_of_days}
      disabled
      sx={{ mb: 2 }}
    />

  
    <input
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={(e) => {
    setNewEvent((prev) => ({
      ...prev,
      toc: e.target.files[0], // 👈 this should be a File object
    }));
  }}
/>
  </DialogContent>

  <DialogActions>
    <Button onClick={handleClose} color="secondary" disabled={loading}>
      Cancel
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={handleBookEvent}
      disabled={loading}
    >
      {loading ? "Submitting..." : "Request Booking"}
    </Button>
  </DialogActions>
</Dialog>

{/* Trainer Details Modal */}
<Dialog open={openModal} onClose={handleCloseTrainerModal} maxWidth="sm" fullWidth>
  <DialogTitle>Trainer Details</DialogTitle>
<DialogContent sx={{ p: 3 }}>
  {selectedTrainer ? (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Avatar sx={{ bgcolor: "#42A5F5", width: 70, height: 70, fontSize: 28 }}>
        {selectedTrainer.name?.charAt(0) ?? "T"}
      </Avatar>

      <Typography variant="h6" fontWeight="bold">
        {selectedTrainer.name ?? "N/A"}
      </Typography>

      <Box width="100%" p={2} borderRadius={2} boxShadow={2} bgcolor="#f5f5f5">
        <Typography variant="body1"><b>ID:</b> {selectedTrainer.id}</Typography>
        <Typography variant="body1"><b>Expertise:</b> {selectedTrainer.expertise ?? "N/A"}</Typography>
        <Typography variant="body1">
          <b>Status:</b>{" "}
          <span style={{ color: selectedTrainer.status === "Teaching" ? "green" : "red" }}>
            {selectedTrainer.status ?? "N/A"}
          </span>
        </Typography>

        {/* Booking Information */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1"><b>Program Title:</b> {newEvent.program_title || "N/A"}</Typography>
        <Typography variant="body1"><b>Company:</b> {newEvent.company_name || "N/A"}</Typography>
        <Typography variant="body1"><b>Location:</b> {newEvent.location || "N/A"}</Typography>
        <Typography variant="body1"><b>Event Place:</b> {newEvent.event_place || "N/A"}</Typography>
        <Typography variant="body1"><b>Start Date:</b> {newEvent.startDate || "N/A"}</Typography>
        <Typography variant="body1"><b>End Date:</b> {newEvent.endDate || "N/A"}</Typography>
        <Typography variant="body1"><b>No. of Days:</b> {newEvent.no_of_days || "N/A"}</Typography>

        {/* TOC File */}
        {selectedTrainer?.toc && (
          <Box mt={2}>
            <Typography variant="body1"><b>TOC File:</b></Typography>
            <a
              href={
                selectedTrainer.toc instanceof File
                  ? URL.createObjectURL(selectedTrainer.toc)
                  : typeof selectedTrainer.toc === "string"
                  ? selectedTrainer.toc
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2", textDecoration: "underline" }}
            >
              {selectedTrainer.toc instanceof File
                ? selectedTrainer.toc.name
                : typeof selectedTrainer.toc === "string"
                ? "View Uploaded TOC"
                : "N/A"}
            </a>
          </Box>
        )}
      </Box>
    </Box>
  ) : (
    <Typography textAlign="center">No trainer details available.</Typography>
  )}
</DialogContent>
</Dialog>
{/* Trainer Profile modal */}

<Dialog open={openProfileModal} onClose={() => setOpenProfileModal(false)} maxWidth="md" fullWidth>
  <DialogTitle sx={{ background: 'linear-gradient(to right, #1976d2, #42a5f5)', color: 'white' }}>
    Trainer Profile
  </DialogTitle>

  <DialogContent dividers sx={{ background: '#f0f4ff' }}>
    {selectedTrainerProfile && (
      <Box>
        {/* Profile Header */}
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          mb={3}
          p={2}
          bgcolor="#e3f2fd"
          borderRadius={2}
        >
          <Avatar
            src={selectedTrainerProfile.profilePicture}
            sx={{ width: 100, height: 100, border: '3px solid #1976d2' }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary.dark">
              {selectedTrainerProfile.name}
            </Typography>
            <Typography color="text.secondary"><Phone sx={{ fontSize: 16 }} /> {selectedTrainerProfile.mobile_number}</Typography>
            <Typography color="text.secondary"><Cake sx={{ fontSize: 16 }} /> {selectedTrainerProfile.dob}</Typography>
            <Typography color="text.secondary"><LocationOn sx={{ fontSize: 16 }} /> {selectedTrainerProfile.current_location}</Typography>
            <Typography color="text.secondary"><Home sx={{ fontSize: 16 }} /> {selectedTrainerProfile.native_location}</Typography>
            <Link href={selectedTrainerProfile.linkedin_url} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', color: '#0e76a8', fontWeight: 'bold', marginTop: '4px' }}>
              <LinkedIn sx={{ fontSize: 18, mr: 0.5 }} /> LinkedIn
            </Link>
          </Box>
        </Box>

        {/* Education */}
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <School sx={{ mr: 1, color: "#4caf50" }} /> Education
          </Typography>
          <Grid container spacing={2}>
            {selectedTrainerProfile.education.map((edu, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Box bgcolor="#e8f5e9" p={2} borderRadius={2}>
                  <Typography fontWeight="bold" color="success.dark">{edu.degree}</Typography>
                  <Typography>{edu.institution} ({edu.year})</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Experience */}
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <Work sx={{ mr: 1, color: "#ff9800" }} /> Experience
          </Typography>
          <Grid container spacing={2}>
            {selectedTrainerProfile.experience.map((exp, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Box bgcolor="#fff3e0" p={2} borderRadius={2}>
                  <Typography fontWeight="bold" color="warning.dark">{exp.role}</Typography>
                  <Typography>{exp.organization} ({exp.duration})</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Training History */}
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <MenuBook sx={{ mr: 1, color: "#9c27b0" }} /> Training History
          </Typography>
          {selectedTrainerProfile.training_history.map((th, idx) => (
            <Box key={idx} p={1} borderBottom="1px dashed #ccc">
              <Typography>
                <strong>{th.programTitle}</strong> at <strong>{th.company}</strong>, {th.eventPlace} ({th.audience})
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Skills */}
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <Star sx={{ mr: 1, color: "#fbc02d" }} /> Skills
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {selectedTrainerProfile.skills.map((skill, idx) => (
              <Chip
                key={idx}
                label={`${skill.name} (${skill.rating}%)`}
                sx={{ background: '#e0f7fa', color: '#006064', fontWeight: 'bold' }}
              />
            ))}
          </Box>
        </Box>

        {/* Projects */}
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <Folder sx={{ mr: 1, color: "#3f51b5" }} /> Projects
          </Typography>
          <Grid container spacing={2}>
            {selectedTrainerProfile.projects.map((proj, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card variant="outlined" sx={{ height: '100%', background: '#e8eaf6' }}>
                  {proj.thumbnail && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={proj.thumbnail}
                      alt={proj.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                      {proj.title}
                    </Typography>
                    <Typography variant="body2" mb={1}>{proj.description}</Typography>
                    <Box>
                      <Link href={proj.repoLink} target="_blank" style={{ color: '#1e88e5' }}>Repo</Link> |{' '}
                      <Link href={proj.deployLink} target="_blank" style={{ color: '#43a047' }}>Live</Link>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Resume */}
        <Box mt={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom color="primary">
            <Description sx={{ mr: 1, color: "#6d4c41" }} /> Resume
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            href={selectedTrainerProfile.resume}
            target="_blank"
            startIcon={<Description />}
            sx={{ mt: 1 }}
          >
            View Resume
          </Button>
        </Box>
      </Box>
    )}
  </DialogContent>

  <DialogActions sx={{ bgcolor: '#e3f2fd' }}>
    <Button onClick={() => setOpenProfileModal(false)} color="primary" startIcon={<CloseIcon />}>
      Close
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
};

export default AdminPanel;
