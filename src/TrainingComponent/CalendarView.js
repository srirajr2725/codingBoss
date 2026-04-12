import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import styled from 'styled-components';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import apiClient from '../utils/apiClient';
import BASE_URL from '../apiConfig';
import CryptoJS from "crypto-js";
import { Box } from '@mui/material';
import { Autocomplete} from "@mui/material";


const CalendarWrapper = styled.div`
  .fc {
    max-width: 100%;
    margin: 0 auto;
    color: #333;
    background: #fff;
    border-radius: 10px;
    padding: 10px;
  }
`;


const CalendarComponent = ({
  events = [],
  isEditable = true,
  onDateBlock = () => {},
}) => {
  const [userId, setUserId] = useState(null);
  const [localEvents, setLocalEvents] = useState([]);
  const [calenderEvents, setCalenderEvents] = useState([]);
  const [loadingApi, setLoadingApi] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    company_name: '',
    program_title: '',
    event_place: '',
    location: '',
    start_date: '',
    end_date: '',
    no_of_days: '',
    toc: '',
  });
  const [completedDays, setCompletedDays] = useState([]);
  const [NotcompletedDays, setNotCompletedDays] = useState([]);
  const [tempCompletedDays, setTempCompletedDays] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [manualEntry, setManualEntry] = useState(false);


  

  useEffect(() => {
    const nonWorking = dateRange.filter(date => !completedDays.includes(date));
    setNotCompletedDays(nonWorking);
  }, [dateRange, completedDays]);

 // 🔐 Step 1: Decrypt and set userId
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

const fetchCompanies = async () => {
  try {
    const data = await apiClient("trainer/companies/", "GET");
    const companies = data || [];
    setCompanyOptions([...companies]);
  } catch (error) {
    console.error("Error fetching companies:", error);
  }
};

useEffect(() => {
  fetchCompanies();
}, []);

// const handleCompanyChange = (event, value) => {
//   if (value === "Other (Type manually)") {
//     setManualEntry(true);
//     setFormValues((prev) => ({ ...prev, company_name: "" }));
//   } else {
//     setManualEntry(false);
//     setFormValues((prev) => ({ ...prev, company_name: value }));
//   }
// };

const handleInputChange = (event) => {
  setFormValues((prev) => ({ ...prev, company_name: event.target.value }));
};

const handleAddToCompletedDays = (date) => {
  if (!completedDays.includes(date)) {
    setCompletedDays([...completedDays, date]);
  }
};

const handleRemoveFromCompletedDays = (date) => {
  setCompletedDays(completedDays.filter(d => d !== date));
};


   // ✅ Fetch saved event data by userId
   const fetchSavedData = async (userId) => {
    console.log("Calling GET API to fetch events for userId:", userId); // <== confirm this prints
    try {
      const response = await apiClient(
        `trainer/filter_program_by_user_id/?user_id=${userId}`,
        'GET',
        null
      );
      console.log('Fetched response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching saved data:', error);
    }
    
  };


// 📡 Step 2: Fetch data after userId is set
useEffect(() => {
  if (userId) {
    console.log("Fetching events for userId:", userId);

    fetchSavedData(userId).then((data) => {
      const formattedEvents = data
        .filter(item => item.status === "Accepted")
        .map((item) => ({
          id: item.id.toString(),
          title: item.program_title,
          start: item.start_date,
          end: item.end_date,
          extendedProps: {
            company_name: item.company_name,
            event_place: item.event_place,
            location: item.location,
            no_of_days: item.no_of_days,
            toc: item.toc || "",
            working_days: item.working_days,
            non_working_days: item.non_working_days
          },
        }));


        const calenderEvents = data
        .filter(item => item.status === "Accepted")
        .map((item) => ({
          id: item.id.toString(),
          title: item.program_title,
          start: item.start_date,
          end: new Date(new Date(item.end_date).setDate(new Date(item.end_date).getDate() + 1)).toISOString().split('T')[0],
          extendedProps: {
            company_name: item.company_name,
            event_place: item.event_place,
            location: item.location,
            no_of_days: item.no_of_days,
            toc: item.toc || "",
            working_days: item.working_days,
            non_working_days: item.non_working_days
          },
        }));

      // const calenderEvents = data.map((item) => ({
      //   id: item.id.toString(),
      //   title: item.program_title,
      //   start: item.start_date,
      //   end: new Date(new Date(item.end_date).setDate(new Date(item.end_date).getDate() + 1)).toISOString().split('T')[0], //item.end_date,
      //   extendedProps: {
      //     company_name: item.company_name,
      //     event_place: item.event_place,
      //     location: item.location,
      //     no_of_days: item.no_of_days,
      //     toc: item.toc || "",
      //     working_days: item.working_days,
      //     non_working_days: item.non_working_days
      //   },
      // }));

      setCalenderEvents(calenderEvents);

      setLocalEvents(formattedEvents);
    }).catch((error) => {
      console.error("Error fetching saved data:", error);
    });
  }
}, [userId]);


const parseDays = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  try {
    // Remove single quotes and extra spaces
    const clean = data.replace(/'/g, '"').replace(/\s+/g, '');
    return JSON.parse(clean);
  } catch (error) {
    console.error('Invalid format:', error);
    return [];
  }
};

  
  
  const handleEventClick = (info) => {
    console.log("Clicked event:", info.event.id);
  
    const clickedEvent = localEvents.find((event) => event.id === info.event.id);
  
    if (clickedEvent) {
      setSelectedEvent(clickedEvent);

      if (clickedEvent.extendedProps.working_days && clickedEvent.extendedProps.non_working_days) {      
        setCompletedDays(parseDays(clickedEvent.extendedProps.working_days));
        setNotCompletedDays(parseDays(clickedEvent.extendedProps.non_working_days));
      }
      
      // Generate the full range of event dates
      const start = new Date(clickedEvent.start);
      const end = new Date(clickedEvent.end);
      let allDates = [];
  
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        allDates.push(new Date(d).toISOString().split('T')[0]); // Format: YYYY-MM-DD
      }
  
      setDateRange(allDates); // Set all event days as non-working initially
      setTempCompletedDays(clickedEvent.completedDays || []); // Load saved completed days
  
      setIsCompletedModalOpen(true);
    }
  };

  const handleDownload = async (toc) => {
    try {
      const response = await fetch(`${BASE_URL.replace(/\/$/, "")}${toc}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', toc.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  
  

  // ✅ Handle date selection for a new event
  const handleDateClick = (info) => {
    if (!isEditable) {
      alert("You do not have permission to block dates.");
      return;
    }

    console.log("Selected Date:", info.dateStr);

    setFormValues({
      company_name: "",
      program_title: "",
      event_place: "",
      location: "",
      start_date: info.dateStr,
      end_date: info.dateStr,
      no_of_days: 1,
      toc: null,
    });

    setIsEventModalOpen(true);
  };

    // ✅ Add completed days to the list
  // const handleAddToCompletedDays = (date) => {
  //   setTempCompletedDays((prev) => [...prev, date]); // Add to Completed Days
  //   setDateRange((prev) => prev.filter((d) => d !== date)); // Remove from Non-Working Days
  // };

  // const handleRemoveFromCompletedDays = (date) => {
  //   setTempCompletedDays((prev) => prev.filter((d) => d !== date)); // Remove from Completed Days
  //   setDateRange((prev) => [...prev, date]); // Add back to Non-Working Days
  // };


  useEffect(() => {
    const { start_date, end_date } = formValues;

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);

      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        setFormValues((prev) => ({
          ...prev,
          no_of_days: diffDays,
        }));
      } else {
        setFormValues((prev) => ({
          ...prev,
          no_of_days: "",
        }));
      }
    }
  }, [formValues.start_date, formValues.end_date]);

  const handleSaveCompletedDays = async (id) => {

    setLoadingApi(true);


    const payload = {
      user: userId,
      working_days: completedDays,
      non_working_days: NotcompletedDays
    };
  
    try {
      const response = await apiClient(
        `trainer/program/update/${id}`,
        'PUT',
        payload
      );
  
      if (response && response.message === "update success") {
        setModel(false);
      } else {
        console.log("Update failed:", response);
      }
      setIsCompletedModalOpen(false)
    } catch (error) {
      console.error("Error updating program:", error);
    }

    fetchSavedData(userId).then((data) => {
      const formattedEvents = data.map((item) => ({
        id: item.id.toString(),
        title: item.program_title,
        start: item.start_date,
        end: item.end_date,
        extendedProps: {
          company_name: item.company_name,
          event_place: item.event_place,
          location: item.location,
          no_of_days: item.no_of_days,
          toc: item.toc || "",
          working_days: item.working_days,
          non_working_days: item.non_working_days
        },
      }));
      setLocalEvents(formattedEvents);
    }).catch((error) => {
      console.error("Error fetching saved data:", error);
    });

    setLoadingApi(false);

  };
  
  const handleEventModalSave = async () => {
    setLoadingApi(true);
  
    if (!formValues.program_title || !formValues.start_date || !formValues.end_date) {
      alert('Please fill all required fields.');
      setLoadingApi(false);
      return;
    }
  
    let companyName = formValues.company_name;
  
    // If the company was manually entered and not in the dropdown
    if (manualEntry && companyName) {
      try {
        const response = await apiClient("trainer/companies/", "POST", {
          name: companyName,
        });
    
        if (response && response.name) {
          companyName = response.name;
        }
        fetchCompanies();
      } catch (err) {
        console.error("❌ Failed to create company:", err);
        alert("Error creating company. Please try again later.");
        setLoadingApi(false);
        return;
      }
    }
    
    
    const formData = new FormData();
    formData.append('user', userId);
    formData.append('program_title', formValues.program_title);
    formData.append('start_date', formValues.start_date);
    formData.append('end_date', formValues.end_date);
    formData.append('company_name', companyName || '');
    formData.append('event_place', formValues.event_place || '');
    formData.append('location', formValues.location || '');
    formData.append('no_of_days', formValues.no_of_days || '');
    formData.append('status', 'Accepted');
  
    if (formValues.toc instanceof File) {
      formData.append('toc', formValues.toc);
    }
  
    try {
      const response = await apiClient("trainer/program/", "POST", formData);
  
      if (!response) {
        console.error("❌ API Error:", response?.status, response?.statusText);
        alert(`Failed to save event. Server returned: ${response?.status} ${response?.statusText}`);
        return;
      }
  
      if (response.message === "Program created successfully") {
        const {
          id, program_title, company_name, event_place,
          location, no_of_days, start_date, end_date, toc
        } = response.program;
  
        const newEvent = {
          title: program_title,
          start: start_date,
          end: end_date,
          extendedProps: {
            company_name,
            event_place,
            location,
            no_of_days,
            toc: toc?.name || '',
          },
        };
  
        setCompletedDays([]);
        setNotCompletedDays([]);
        setIsEventModalOpen(false);
      }
  
      fetchSavedData(userId).then((data) => {
        const formattedEvents = data.map((item) => ({
          id: item.id.toString(),
          title: item.program_title,
          start: item.start_date,
          end: item.end_date,
          extendedProps: {
            company_name: item.company_name,
            event_place: item.event_place,
            location: item.location,
            no_of_days: item.no_of_days,
            toc: item.toc || "",
          },
        }));
  
        const calenderEvents = data.map((item) => ({
          id: item.id.toString(),
          title: item.program_title,
          start: item.start_date,
          end: new Date(new Date(item.end_date).setDate(new Date(item.end_date).getDate() + 1)).toISOString().split('T')[0],
          extendedProps: {
            company_name: item.company_name,
            event_place: item.event_place,
            location: item.location,
            no_of_days: item.no_of_days,
            toc: item.toc || "",
            working_days: item.working_days,
            non_working_days: item.non_working_days
          },
        }));
  
        setCalenderEvents(calenderEvents);
        setLocalEvents(formattedEvents);
      }).catch((error) => {
        console.error("Error fetching saved data:", error);
      });
  
    } catch (error) {
      console.error("❌ Error saving event:", error);
      alert("An unexpected error occurred while saving the event.");
    }
  
    setLoadingApi(false);
  };
  

  const handleEventModalClose = () => setIsEventModalOpen(false);
  const handleCompletedModalClose = () => setIsCompletedModalOpen(false);
  
  // const handleRefresh = () => {
  //   if (userId) {
  //     fetchSavedData(userId)
  //       .then((data) => {
  //         if (data) {
  //           const formattedData = data.map((item) => ({
  //             id: item.id.toString(),
  //             title: item.program_title,
  //             start: item.start_date,
  //             end: item.end_date,
  //             extendedProps: {
  //               company_name: item.company_name,
  //               event_place: item.event_place,
  //               location: item.location,
  //               no_of_days: item.no_of_days,
  //               toc: item.toc || "",
  //             },
  //           }));
  //           setLocalEvents(formattedData);
  //         }
  //       })
  //       .catch((error) => console.error("Error on manual refresh:", error));
  //   }
  // };
  

  return (
    <>
    {/* <button onClick={handleRefresh} className="bg-blue-500 text-white px-4 py-2 rounded">
        Refresh
      </button> */}

   
<CalendarWrapper>
<Box sx={{ width: '100%', overflowX: 'auto' }}>
  <FullCalendar
    plugins={[dayGridPlugin, interactionPlugin]}
    initialView="dayGridMonth"
    headerToolbar={
      window.innerWidth <= 600
        ? {
            left: 'prev,next',
            center: 'title',
            right: '',
          }
        : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }
    }
    events={calenderEvents}
    dateClick={handleDateClick}
    eventClick={handleEventClick}
    editable={isEditable}
    selectable={true}
    select={(info) => {
      setFormValues({
        company_name: '',
        program_title: '',
        event_place: '',
        location: '',
        start_date: info.startStr,
        end_date: new Date(
          new Date(info.endStr).setDate(
            new Date(info.endStr).getDate() - 1
          )
        )
          .toISOString()
          .slice(0, 10),
        no_of_days: Math.floor(
          (new Date(info.endStr) - new Date(info.startStr)) /
            (1000 * 60 * 60 * 24)
        ),
        toc: null,
      });
      setIsEventModalOpen(true);
    }}
    windowResize={(view) => {
      // Dynamically adjust header buttons when resized
      // view.calendar.setOption(
      //   'headerToolbar',
      //   window.innerWidth <= 600
      //     ? {
      //         left: 'prev,next',
      //         center: 'title',
      //         right: '',
      //       }
      //     : {
      //         left: 'prev,next today',
      //         center: 'title',
      //         right: 'dayGridMonth',
      //       }
      // );
    }}
    aspectRatio={window.innerWidth <= 600 ? 0.75 : 1.35}
  />
  </Box>
    {/* Event Modal */}
    <Modal show={isEventModalOpen} style={{ }} onHide={handleEventModalClose} dialogClassName="custom-modal">
  <Modal.Header closeButton>
    <Modal.Title>Add Event</Modal.Title>
  </Modal.Header>
  <Modal.Body
   style={{
    overflowY: 'auto',
    maxHeight: '80vh'
  }}
  >
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Form>
      <Autocomplete
  fullWidth
  freeSolo
  options={companyOptions}
  getOptionLabel={(option) =>
    typeof option === "string" ? option : option?.name || ""
  }
  value={
    manualEntry
      ? { name: formValues.company_name || "" }
      : companyOptions.find((c) => c.name === formValues.company_name) || null
  }
  onChange={(e, newValue) => {
    let name = "";
    if (typeof newValue === "string") {
      name = newValue;
    } else if (newValue && newValue.name) {
      name = newValue.name;
    }

    const isInList = companyOptions.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    setManualEntry(!isInList); // if not in the list, enable manual entry

    setFormValues((prev) => ({
      ...prev,
      company_name: name,
    }));
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Company Name"
      required
      onChange={(e) => {
        const name = e.target.value;
        const isInList = companyOptions.some(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );

        setManualEntry(!isInList);
        setFormValues((prev) => ({
          ...prev,
          company_name: name,
        }));
      }}
    />
  )}
  isOptionEqualToValue={(option, value) =>
    typeof option === "string"
      ? option === value
      : option?.name === value?.name
  }
/>



        <TextField
          fullWidth
          label="Program Title"
          name="program_title"
          value={formValues.program_title}
          onChange={(e) =>
            setFormValues((prev) => ({
              ...prev,
              program_title: e.target.value,
            }))
          }
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Event Place"
          name="eventPlace"
          value={formValues.event_place}
          onChange={(e) =>
            setFormValues((prev) => ({
              ...prev,
              event_place: e.target.value,
            }))
          }
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Location"
          name="location"
          value={formValues.location}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, location: e.target.value }))
          }
          margin="normal"
          required
        />
   <TextField
        fullWidth
        label="Start Date"
        type="date"
        name="startDate"
        value={formValues.start_date}
        onChange={(e) =>
          setFormValues((prev) => ({
            ...prev,
            start_date: e.target.value,
          }))
        }
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        fullWidth
        label="End Date"
        type="date"
        name="endDate"
        value={formValues.end_date}
        onChange={(e) =>
          setFormValues((prev) => ({
            ...prev,
            end_date: e.target.value,
          }))
        }
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        fullWidth
        label="No.of.Days"
        type="number"
        name="no_of_days"
        value={formValues.no_of_days}
        onChange={(e) =>
          setFormValues((prev) => ({
            ...prev,
            no_of_days: e.target.value,
          }))
        }
        margin="normal"
        required
      />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            margin: '16px 0',
            width: '100%',
          }}
        >
          <label
            htmlFor="upload-toc"
            style={{
              fontSize: '1rem',
              color: 'rgba(0, 0, 0, 0.6)',
              marginBottom: '4px',
            }}
          >
            TOC
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              padding: '10px 12px',
              backgroundColor: '#fff',
              width: '100%',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <input
              id="upload-toc"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormValues((prev) => ({
                    ...prev,
                    toc: file,
                  }));
                }
              }}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
              required
            />
            <span style={{ flex: 1 }}>
              {formValues.toc ? formValues.toc.name : 'Choose a file...'}
            </span>
            <button
              type="button"
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Browse
            </button>
          </div>
          {formValues.toc && (
            <p
              style={{
                marginTop: '8px',
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              Uploaded File: {formValues.toc.name}
            </p>
          )}
        </div>
      </Form>


      <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        width: "100%",
        gap: 1,
        justifyContent: "flex-end",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Button variant="secondary" onClick={handleEventModalClose} fullWidth>
        Cancel
      </Button>
      <Button
        variant="primary"
        disabled={loadingApi}
        onClick={handleEventModalSave}
        fullWidth
      >
        Save Event
      </Button>
    </Box>


    </Box>
  </Modal.Body>
</Modal>
      {/* Completed Days Modal */}
<Modal show={isCompletedModalOpen} onHide={handleCompletedModalClose}>
  <Modal.Header closeButton>
    <Modal.Title>Event Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <h5>Event Information</h5>

    {selectedEvent && (
      <div>
       <p><strong>Company Name:</strong> {selectedEvent.extendedProps?.company_name}</p>
       <p><strong>Program Title:</strong> {selectedEvent.title}</p>
       <p><strong>Event Place:</strong> {selectedEvent.extendedProps?.event_place}</p>
       <p><strong>Location:</strong> {selectedEvent.extendedProps?.location}</p>
       <p><strong>No.of.Days:</strong> {selectedEvent.extendedProps?.no_of_days}</p>
       <div className="d-flex align-items-center mb-2">
  <strong className="me-2">Table of Content:</strong>
  {selectedEvent.extendedProps?.toc ? (
    <Button 
    variant="outline-primary" 
    onClick={() => handleDownload(selectedEvent.extendedProps.toc)}
  >
    Download {selectedEvent.extendedProps.toc.split('/').pop()}
  </Button>
  ) : (
    <span>N/A</span>
  )}
</div>
      </div>
    )}

    <Form>
    <h5>Completed Days</h5>
<ListGroup>
  {completedDays.map((date) => (
    <ListGroup.Item key={date}>
      {date}
      <Button
        size="sm"
        variant="danger"
        style={{ float: 'right' }}
        onClick={() => handleRemoveFromCompletedDays(date)}
      >
        Remove
      </Button>
    </ListGroup.Item>
  ))}
</ListGroup>

<h5 className="mt-4">Non-Working Days</h5>
<ListGroup>
  {NotcompletedDays.map((date) => (
    <ListGroup.Item key={date}>
      {date}
      <Button
        size="sm"
        variant="success"
        style={{ float: 'right' }}
        onClick={() => handleAddToCompletedDays(date)}
      >
        Add
      </Button>
    </ListGroup.Item>
  ))}
</ListGroup>

    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" disabled={loadingApi} onClick={() => handleSaveCompletedDays(selectedEvent.id)}>
      Save
    </Button>
    <Button variant="secondary" onClick={handleCompletedModalClose}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

    </CalendarWrapper>
    </>
  )
};

export default CalendarComponent;

