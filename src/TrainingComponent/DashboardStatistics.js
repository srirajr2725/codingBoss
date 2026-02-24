import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Modal,
  Backdrop,
  Fade,
  Button,
  Pagination,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  IconButton,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import InfoIcon from "@mui/icons-material/Info";

const ITEMS_PER_PAGE = 5;

const trainings = [...Array(10).keys()].map((i) => ({
  title: `Training ${i + 1}`,
  place: "City " + (i + 1),
  days: Math.floor(Math.random() * 10) + 1,
}));

const bookingData = [
  { month: "Jan", bookings: 10 },
  { month: "Feb", bookings: 15 },
  { month: "Mar", bookings: 20 },
  { month: "Apr", bookings: 25 },
  { month: "May", bookings: 18 },
  { month: "Jun", bookings: 22 },
];

const DashboardStatistics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(trainings.length / ITEMS_PER_PAGE);
  const paginatedTrainings = trainings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Dashboard Statistics
      </Typography>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} centered>
        <Tab label="Ongoing" />
        <Tab label="Upcoming" />
        <Tab label="History" />
      </Tabs>

      <Grid container spacing={3} mt={3} justifyContent="center">
        {paginatedTrainings.map((training, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea onClick={() => setSelectedTraining(training)}>
                <CardContent>
                  <Typography variant="h6">{training.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {training.place}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {training.days} Days
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" />
      </Box>

      <Box mt={5} sx={{ height: 300, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Booking Trends
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bookingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#1976d2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Modal open={!!selectedTraining} onClose={() => setSelectedTraining(null)} closeAfterTransition>
        <Fade in={!!selectedTraining}>
          <Box sx={{ width: 400, bgcolor: "white", p: 4, mx: "auto", mt: 10, borderRadius: 2 }}>
            <Typography variant="h6" textAlign="center" gutterBottom>
              {selectedTraining?.title}
            </Typography>
            <Typography>Location: {selectedTraining?.place}</Typography>
            <Typography>Duration: {selectedTraining?.days} Days</Typography>
            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setSelectedTraining(null)}>
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default DashboardStatistics;