import React, { useState } from 'react'
import { Box, Typography, Card, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import CalendarComponent from '../components/CalendarView' // Import your CalendarComponent

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
  gap: '20px',
  backgroundColor: theme.palette.grey[100],
  borderRadius: '12px',
}))

const Sidebar = styled(Box)(({ theme }) => ({
  width: '250px',
  padding: '20px',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}))

const SidebarItem = styled(Typography)(({ theme, selected }) => ({
  marginBottom: '16px',
  cursor: 'pointer',
  color: selected
    ? theme.palette.primary.contrastText
    : 'rgba(255,255,255,0.7)',
  fontWeight: selected ? 'bold' : 'normal',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.contrastText,
  },
}))

const MainContent = styled(Box)({
  flex: 1,
})

const EventCard = styled(Card)(({ theme }) => ({
  padding: '20px',
  marginBottom: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
}))

// TrainerDashboard Component
const TrainerDashboard = () => {
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

  const [requests, setRequests] = useState([
    {
      id: 'req1',
      title: 'Admin: Event at College C',
      status: 'pending',
    },
    {
      id: 'req2',
      title: 'Vendor: Seminar at College D',
      status: 'accepted',
    },
    {
      id: 'req3',
      title: 'Admin: Workshop at College E',
      status: 'denied',
    },
  ])

  // Handlers
  const handleDateBlock = (newEvent) => {
    setCalendarEvents((prevEvents) => [...prevEvents, newEvent])
  }

  const handleDateUnblock = (eventId) => {
    setCalendarEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    )
  }

  const handleAcceptRequest = (reqId) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === reqId ? { ...req, status: 'accepted' } : req
      )
    )
    const acceptedRequest = requests.find((req) => req.id === reqId)
    if (acceptedRequest) {
      setCalendarEvents((prevEvents) => [
        ...prevEvents,
        {
          id: acceptedRequest.id,
          title: acceptedRequest.title,
          start: acceptedRequest.start || new Date(),
          end: acceptedRequest.end || new Date(),
          color: '#42A5F5', // Accepted event color
        },
      ])
    }
  }

  const handleDenyRequest = (reqId) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === reqId ? { ...req, status: 'denied' } : req
      )
    )
  }

  // Render different content based on the selected tab
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
          <>
            <Typography variant="h4" textAlign="center" mb={4}>
              Pending Requests
            </Typography>
            {requests
              .filter((req) => req.status === 'pending')
              .map((req) => (
                <EventCard key={req.id}>
                  <Typography variant="h6">{req.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: Pending
                  </Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptRequest(req.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDenyRequest(req.id)}
                    >
                      Deny
                    </Button>
                  </Box>
                </EventCard>
              ))}
          </>
        )
      case 'accepted':
        return (
          <>
            <Typography variant="h4" textAlign="center" mb={4}>
              Accepted Requests
            </Typography>
            {requests
              .filter((req) => req.status === 'accepted')
              .map((req) => (
                <EventCard key={req.id}>
                  <Typography variant="h6">{req.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: Accepted
                  </Typography>
                </EventCard>
              ))}
          </>
        )
      case 'denied':
        return (
          <>
            <Typography variant="h4" textAlign="center" mb={4}>
              Denied Requests
            </Typography>
            {requests
              .filter((req) => req.status === 'denied')
              .map((req) => (
                <EventCard key={req.id}>
                  <Typography variant="h6">{req.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: Denied
                  </Typography>
                </EventCard>
              ))}
          </>
        )
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          User Dashboard
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: '#fff' }} />
        <SidebarItem
          selected={selectedTab === 'calendar'}
          onClick={() => setSelectedTab('calendar')}
        >
          My Calendar
        </SidebarItem>
        <SidebarItem
          selected={selectedTab === 'pending'}
          onClick={() => setSelectedTab('pending')}
        >
          Pending Requests
        </SidebarItem>
        <SidebarItem
          selected={selectedTab === 'accepted'}
          onClick={() => setSelectedTab('accepted')}
        >
          Accepted Requests
        </SidebarItem>
        <SidebarItem
          selected={selectedTab === 'denied'}
          onClick={() => setSelectedTab('denied')}
        >
          Denied Requests
        </SidebarItem>
      </Sidebar>

      {/* Main Content */}
      <MainContent>{renderContent()}</MainContent>
    </DashboardContainer>
  )
}

export default TrainerDashboard
