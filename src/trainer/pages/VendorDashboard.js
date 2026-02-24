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
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
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

const UserCard = styled(Card)(({ theme }) => ({
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

const VendorDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [requestTitle, setRequestTitle] = useState('')
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null })

  const users = [
    {
      id: 1,
      name: 'John Doe',
      photo: 'https://via.placeholder.com/100',
      bio: 'Software Engineer at College A',
    },
    {
      id: 2,
      name: 'Jane Smith',
      photo: 'https://via.placeholder.com/100',
      bio: 'Lecturer at College B',
    },
  ]

  const handleDateSelect = ({ start, end }) => {
    if (start >= end) {
      alert('Please select dates in the forward direction.')
      return
    }

    if (!selectedUser) {
      alert('Please select a user first.')
      return
    }

    setSelectedDates({ start, end })
    setOpenDialog(true)
  }

  const handleConfirmRequest = () => {
    if (!requestTitle) {
      alert('Please enter a title for the request.')
      return
    }

    const newEvent = {
      id: String(calendarEvents.length + 1),
      title: `${requestTitle} (Requested)`,
      start: selectedDates.start,
      end: selectedDates.end,
      color: '#42A5F5',
    }

    setCalendarEvents((prevEvents) => [...prevEvents, newEvent])
    alert(`Request sent for ${selectedUser.name} to lock these dates.`)
    setRequestTitle('')
    setOpenDialog(false)
  }

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          Vendor Dashboard
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: '#fff' }} />
        <List>
          <SidebarItem
            selected={selectedTab === 'users'}
            onClick={() => setSelectedTab('users')}
          >
            <ListItemText primary="Users" />
          </SidebarItem>
        </List>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <Typography variant="h4" textAlign="center" mb={4}>
          Users
        </Typography>
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <UserCard
                onClick={() => setSelectedUser(user)}
                sx={{
                  border:
                    selectedUser?.id === user.id ? '2px solid #1976d2' : 'none',
                }}
              >
                <Avatar
                  src={user.photo}
                  alt={user.name}
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.bio}
                </Typography>
              </UserCard>
            </Grid>
          ))}
        </Grid>

        {selectedUser && (
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

      {/* Dialog for Request Input */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Request Booking</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Request Title"
            type="text"
            fullWidth
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
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

export default VendorDashboard
