import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import CalendarComponent from '../components/CalendarView'

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '20px',
  maxWidth: '1400px',
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

const SidebarItem = styled(ListItem)(({ theme, selected }) => ({
  marginBottom: '8px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: selected ? theme.palette.primary.light : 'transparent',
  color: selected ? theme.palette.primary.contrastText : '#fff',
  boxShadow: selected ? '0 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
}))

const MainContent = styled(Box)({
  flex: 1,
})

const TrainerProfileCard = styled(Card)(({ theme }) => ({
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
  },
}))

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('trainers')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [collegeName, setCollegeName] = useState('')
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null })

  const trainers = [
    {
      id: 1,
      name: 'John Doe',
      photo: 'https://via.placeholder.com/100',
      bio: 'Experienced trainer in web development and data science.',
      history: ['Training at College A - 2023', 'Training at College B - 2024'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      photo: 'https://via.placeholder.com/100',
      bio: 'Expert in AI and machine learning.',
      history: ['Training at College C - 2023', 'Training at College D - 2024'],
    },
  ]

  const vendors = [
    {
      id: 1,
      name: 'Vendor A',
      photo: 'https://via.placeholder.com/100',
      bio: 'Provides tech equipment and IT services.',
      history: ['Supplied to College A - 2023', 'Supplied to College B - 2024'],
    },
    {
      id: 2,
      name: 'Vendor B',
      photo: 'https://via.placeholder.com/100',
      bio: 'Specialized in office supplies and furniture.',
      history: ['Supplied to College C - 2023', 'Supplied to College D - 2024'],
    },
  ]

  const dataToRender = selectedTab === 'trainers' ? trainers : vendors

  const handleDateSelect = ({ start, end }) => {
    if (start >= end) {
      alert('Please select dates in the forward direction.')
      return
    }

    if (!selectedTrainer) {
      alert('Please select a trainer first.')
      return
    }

    setSelectedDates({ start, end })
    setOpenDialog(true)
  }

  const handleConfirmRequest = () => {
  if (!collegeName) {
    alert('Please enter a college name.')
    return
  }

  const newRequest = {
    id: String(calendarEvents.length + 1),
    title: `${collegeName} (Requested by Admin)`,
    start: selectedDates.start,
    end: selectedDates.end,
    status: 'pending',
    trainerId: selectedTrainer.id,
  }

  // Replace this with an API call if needed
  setCalendarEvents((prevEvents) => [...prevEvents, newRequest])
  alert(`Request sent to ${selectedTrainer.name} to lock these dates.`)

  setCollegeName('')
  setOpenDialog(false)
}

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          Admin Dashboard
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: '#fff' }} />
        <List>
          <SidebarItem
            selected={selectedTab === 'trainers'}
            onClick={() => setSelectedTab('trainers')}
          >
            <ListItemText primary="Trainers" />
          </SidebarItem>
          <SidebarItem
            selected={selectedTab === 'vendors'}
            onClick={() => setSelectedTab('vendors')}
          >
            <ListItemText primary="Vendors" />
          </SidebarItem>
        </List>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <Typography variant="h4" textAlign="center" mb={4}>
          {selectedTab === 'trainers' ? 'Trainers' : 'Vendors'}
        </Typography>
        <Grid container spacing={3}>
          {dataToRender.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <TrainerProfileCard
                onClick={() => setSelectedTrainer(user)}
                sx={{
                  border:
                    selectedTrainer?.id === user.id
                      ? '2px solid #1976d2'
                      : 'none',
                }}
              >
                <Avatar
                  src={user.photo}
                  alt={user.name}
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {user.bio}
                </Typography>
                <Typography variant="body2" color="primary">
                  History:
                </Typography>
                <ul>
                  {user.history.map((event, idx) => (
                    <li key={idx}>{event}</li>
                  ))}
                </ul>
              </TrainerProfileCard>
            </Grid>
          ))}
        </Grid>

        {selectedTab === 'trainers' && selectedTrainer && (
          <Box mt={4}>
            <CalendarComponent
              events={calendarEvents}
              isEditable={true}
              onDateBlock={(newEvent) => {
                console.log('Blocked event:', newEvent)
                setCalendarEvents((prevEvents) => [...prevEvents, newEvent])
              }}
              onDateUnblock={(eventId) => {
                console.log('Unblocked event:', eventId)
                setCalendarEvents((prevEvents) =>
                  prevEvents.filter((event) => event.id !== eventId)
                )
              }}
              onSelectRange={handleDateSelect}
            />
          </Box>
        )}
      </MainContent>

      {/* Dialog for College Name Input */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Lock Dates</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="College Name"
            type="text"
            fullWidth
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRequest} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  )
}

export default AdminDashboard
