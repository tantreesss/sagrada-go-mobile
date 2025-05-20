import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Button, Box, Typography, Container, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for datepicker
import { useNavigate } from 'react-router-dom';

export default function BookingScreen() {
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!selectedSacrament) {
      setErrorMessage('Please select a sacrament first.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Please select both date and time.');
      return;
    }

    setErrorMessage('');
    alert(`Booking confirmed for ${selectedSacrament} on ${date.toDateString()} at ${time.toLocaleTimeString()}`);
    navigate('/home'); // Navigate back to the home screen after booking
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <Typography variant="h5">Book a Sacrament</Typography>

        {/* Sacrament Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Sacrament</InputLabel>
          <Select
            value={selectedSacrament}
            onChange={(e) => setSelectedSacrament(e.target.value)}
            label="Select Sacrament"
          >
            <MenuItem value="Wedding">Wedding</MenuItem>
            <MenuItem value="Baptism">Baptism</MenuItem>
            <MenuItem value="Confession">Confession</MenuItem>
            <MenuItem value="Anointing of the Sick">Anointing of the Sick</MenuItem>
          </Select>
        </FormControl>

        {/* Error Message */}
        {errorMessage && <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>{errorMessage}</Alert>}

        {/* Date and Time Picker */}
        {selectedSacrament && (
          <>
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              Selected Sacrament: {selectedSacrament}
            </Typography>

            {/* Date Picker */}
            <ReactDatePicker
              selected={date}
              onChange={(newDate) => setDate(newDate)}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="MMMM d, yyyy"
              className="datepicker"
              placeholderText="Select Date"
            />

            {/* Time Picker */}
            <ReactDatePicker
              selected={time}
              onChange={(newTime) => setTime(newTime)}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="HH:mm"
              className="timepicker"
              placeholderText="Select Time"
            />

            {/* Confirm Booking Button */}
            <Button variant="contained" fullWidth onClick={handleBooking} sx={{ marginTop: 2 }}>
              Confirm Booking
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
