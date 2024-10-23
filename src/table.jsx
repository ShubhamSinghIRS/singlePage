import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import output from '../output.json';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const theme = createTheme({
  palette: {
    primary: { main: '#ffbe34' },
    secondary: { main: '#ffffff' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default function EnhancedModuleSelector() {
  const industries = Object.keys(output);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [selectedCards, setSelectedCards] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [availableCards, setAvailableCards] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle industry change
  const handleIndustryChange = (event) => {
    setSelectedIndustry(event.target.value);
    setSelectedCards({}); // Reset selected cards when industry changes
  };

  // Open dialog with available cards for the selected category
  const handleAddCard = (category) => {
    setCurrentCategory(category);
    const cards = output[selectedIndustry][category].map((card) => ({
      name: card[0],
      credits: parseInt(card[1]),
      mode: card[2],
      cost: parseInt(card[3]),
    }));
    setAvailableCards(cards);
    setOpenDialog(true);
  };

  // Save selected card
  const handleSaveCard = (card) => {
    const categoryCards = selectedCards[currentCategory] || [];
    if (categoryCards.length >= 3) {
      setSnackbar({ open: true, message: 'You can select up to 3 cards per category.', severity: 'error' });
      return;
    }
    if (categoryCards.find((c) => c.name === card.name)) {
      setSnackbar({ open: true, message: 'Card already selected.', severity: 'error' });
      return;
    }
    setSelectedCards({
      ...selectedCards,
      [currentCategory]: [...categoryCards, card],
    });
    setOpenDialog(false);
    setSnackbar({ open: true, message: 'Card added successfully!', severity: 'success' });
  };

  // Remove selected card
  const handleRemoveCard = (category, cardName) => {
    const updatedCategoryCards = selectedCards[category].filter((card) => card.name !== cardName);
    setSelectedCards({
      ...selectedCards,
      [category]: updatedCategoryCards,
    });
    setSnackbar({ open: true, message: 'Card removed.', severity: 'info' });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Calculate total credits and cost
  const totalCredits = Object.values(selectedCards).flat().reduce((acc, card) => acc + card.credits, 0);
  const totalCost = Object.values(selectedCards).flat().reduce((acc, card) => acc + card.cost, 0);

  // Prepare data for radar chart
  const radarData = Object.keys(output[selectedIndustry])
    .filter((category) => category !== 'Site-Visits')
    .map((category) => {
      const credits = selectedCards[category]?.reduce((acc, card) => acc + card.credits, 0) || 0;
      return { category, credits };
    });

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          backgroundColor: 'background.default',
          padding: 3,
          borderRadius: 4,
        }}
      >
        {/* Industry Selection */}
        <Box sx={{ mb: 3 }}>
          <Select
            value={selectedIndustry}
            onChange={handleIndustryChange}
            fullWidth
            displayEmpty
            inputProps={{ 'aria-label': 'Select Industry' }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          >
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>
                {industry}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Categories and Add Buttons */}
        {Object.keys(output[selectedIndustry]).map((category) => {
          if (category === 'Site-Visits') return null; // Skip Site-Visits category

          const categoryCards = selectedCards[category] || [];

          return (
            <Box key={category} sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {category}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddCard(category)}
                  variant="contained"
                  color="primary"
                  size="small"
                  aria-label={`Add card to ${category}`}
                >
                  Add Card
                </Button>
              </Box>

              {/* Selected Cards Below Category */}
              {categoryCards.length > 0 && (
                <Grid container spacing={2}>
                  {categoryCards.map((card) => (
                    <Grid item xs={12} sm={4} key={card.name}>
                      <Card sx={{ position: 'relative', padding: 1 }}>
                        <CardContent sx={{ padding: '8px !important' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {card.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Credits: {card.credits} | Cost: ${card.cost}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCard(category, card.name)}
                            sx={{ position: 'absolute', top: 0, right: 0, color: 'error.main' }}
                            aria-label={`Remove ${card.name}`}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          );
        })}

        {/* Total Credits and Cost */}
        {totalCredits > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Typography variant="subtitle1">Total Credits: {totalCredits}</Typography>
            <Typography variant="subtitle1">Total Cost: ${totalCost}</Typography>
          </Box>
        )}

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
              Credit Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, Math.max(...radarData.map((d) => d.credits)) + 10]} />
                <Radar name="Credits" dataKey="credits" stroke="#ffbe34" fill="#ffbe34" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Selected Cards Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            Select a Card
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {availableCards.map((card) => (
                <Grid item xs={12} sm={6} key={card.name}>
                  <Card
                    onClick={() => handleSaveCard(card)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedCards[currentCategory]?.find((c) => c.name === card.name)
                        ? '2px solid #ffbe34'
                        : 'none',
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {card.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Credits: {card.credits} | Cost: ${card.cost}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          aria-label={`Add ${card.name}`}
                          onClick={() => handleSaveCard(card)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}