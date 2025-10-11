// Import necessary packages
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Use middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../assets')));

// --- Locations in Chennai ---
const chennaiLocations = [
    // --- Central Chennai ---
    { name: "T. Nagar", lat: 13.0413, lon: 80.2375 },
    { name: "Nungambakkam", lat: 13.0594, lon: 80.2444 },
    { name: "Mylapore", lat: 13.0339, lon: 80.2645 },
    { name: "Adyar", lat: 13.0063, lon: 80.2575 },
    { name: "Alwarpet", lat: 13.0305, lon: 80.2523 },
    { name: "Triplicane", lat: 13.0583, lon: 80.2797 },
    { name: "Royapettah", lat: 13.0494, lon: 80.2628 },
    { name: "Egmore", lat: 13.0789, lon: 80.2612 },
    { name: "Chetpet", lat: 13.0717, lon: 80.2403 },
    { name: "Kilpauk", lat: 13.0827, lon: 80.2345 },
    { name: "Purasawalkam", lat: 13.0895, lon: 80.2493 },
    { name: "George Town", lat: 13.0945, lon: 80.2863 },
    // --- Inner South Chennai ---
    { name: "Guindy", lat: 13.0076, lon: 80.2139 },
    { name: "Saidapet", lat: 13.0219, lon: 80.2295 },
    { name: "Thiruvanmiyur", lat: 12.9851, lon: 80.2592 },
    { name: "Besant Nagar", lat: 13.0007, lon: 80.2678 },
    { name: "Alandur", lat: 13.0039, lon: 80.2039 },
    { name: "Adambakkam", lat: 12.9926, lon: 80.2104 },
    { name: "Nanganallur", lat: 12.9863, lon: 80.1843 },
    { name: "Meenambakkam", lat: 12.9895, lon: 80.1801 },
    // --- North Chennai ---
    { name: "Manali", lat: 13.1960, lon: 80.2964 },
    { name: "Royapuram", lat: 13.1167, lon: 80.2950 },
    { name: "Perambur", lat: 13.1165, lon: 80.2374 },
    { name: "Washermenpet", lat: 13.1119, lon: 80.2858 },
    { name: "Vyasarpadi", lat: 13.1186, lon: 80.2520 },
    { name: "Tondiarpet", lat: 13.1309, lon: 80.2952 },
    { name: "Ennore", lat: 13.2163, lon: 80.3243 },
    { name: "Madhavaram", lat: 13.1493, lon: 80.2355 },
    // --- West Chennai ---
    { name: "Anna Nagar", lat: 13.084, lon: 80.2101 },
    { name: "Koyambedu", lat: 13.0731, lon: 80.1931 },
    { name: "Vadapalani", lat: 13.0500, lon: 80.2120 },
    { name: "Porur", lat: 13.0345, lon: 80.1549 },
    { name: "Ambattur", lat: 13.1143, lon: 80.1547 },
    { name: "Avadi", lat: 13.1155, lon: 80.0767 },
    { name: "Mogappair", lat: 13.0838, lon: 80.1800 },
    { name: "Villivakkam", lat: 13.1026, lon: 80.2079 },
    { name: "Padi", lat: 13.1051, lon: 80.1901 },
    { name: "Ashok Nagar", lat: 13.0384, lon: 80.2103 },
    { name: "KK Nagar", lat: 13.0426, lon: 80.2036 },
    // --- Famous Landmarks ---
    { name: "Marina Beach", lat: 13.0511, lon: 80.2821 },
    { name: "Chennai Central Station", lat: 13.0827, lon: 80.2755 },
    { name: "Fort St. George", lat: 13.0767, lon: 80.2889 },
    { name: "CMBT Bus Terminus", lat: 13.0682, lon: 80.1950 },
    { name: "Valluvar Kottam", lat: 13.0537, lon: 80.2407 },
    // --- Southern Suburbs (Velachery, OMR & GST Corridors) ---
    { name: "Velachery", lat: 12.9785, lon: 80.2180 },
    { name: "Pallikaranai", lat: 12.9379, lon: 80.2155 },
    { name: "Madipakkam", lat: 12.9628, lon: 80.2030 },
    { name: "Keelkattalai", lat: 12.9555, lon: 80.1856 },
    { name: "Pallavaram", lat: 12.9696, lon: 80.1500 },
    { name: "Chromepet", lat: 12.9526, lon: 80.1437 },
    { name: "Tambaram Sanatorium", lat: 12.9377, lon: 80.1228 },
    { name: "Tambaram", lat: 12.9249, lon: 80.1105 },
    { name: "Perungalathur", lat: 12.9096, lon: 80.0975 },
    { name: "Vandalur", lat: 12.8944, lon: 80.0825 },
    { name: "Urapakkam", lat: 12.8711, lon: 80.0655 },
    { name: "Guduvancheri", lat: 12.8530, lon: 80.0573 },
    { name: "Potheri", lat: 12.8361, lon: 80.0465 },
    { name: "Kilambakkam Bus Stand", lat: 12.8767, lon: 80.0811 },
    { name: "Perungudi", lat: 12.9667, lon: 80.2457 },
    { name: "Taramani", lat: 12.9791, lon: 80.2435 },
    { name: "Medavakkam", lat: 12.9197, lon: 80.1979 },
    { name: "Perumbakkam", lat: 12.9123, lon: 80.2120 },
    { name: "Sholinganallur", lat: 12.8901, lon: 80.2285 },
    { name: "Navalur", lat: 12.8631, lon: 80.2238 },
    { name: "Siruseri", lat: 12.8422, lon: 80.2201 },
    { name: "Kelambakkam", lat: 12.7909, lon: 80.2246 }
];

// --- Google Air Quality API Helper Function ---
// --- Google Air Quality API Helper Function ---
async function getAirQualityData(lat, lon) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;

    try {
        const response = await axios.post(url, {
            location: { latitude: lat, longitude: lon }
        });

        const data = response.data;

        // Helper to find pollutant value
        const findPollutant = (code) =>
            data.pollutants?.find(p => p.code.toLowerCase() === code.toLowerCase());
        
        return {
            aqi: data.indexes?.[0]?.aqi || 0,
            pollutants: {
                pm25: findPollutant('pm25')?.concentration?.value ?? 0,
                pm10: findPollutant('pm10')?.concentration?.value ?? 0,
                co: findPollutant('co')?.concentration?.value ?? 0,
                no2: findPollutant('no2')?.concentration?.value ?? 0,
                so2: findPollutant('so2')?.concentration?.value ?? 0,
                o3: findPollutant('o3')?.concentration?.value ?? 0
            }
        };
        
    } catch (error) {
        console.error("Error fetching from Google Air Quality API:", error.response?.data?.error?.message || error.message);
        return {
            aqi: 0,
            pollutants: {
                pm25: 0,
                pm10: 0,
                co: 0,
                no2: 0,
                so2: 0,
                o3: 0
            }
        };
    }
}

// ===========================================
//               API ENDPOINTS
// ===========================================

app.get('/api/dashboard', async (req, res) => {
    try {
        const results = await Promise.all(
            chennaiLocations.map(location => getAirQualityData(location.lat, location.lon))
        );

        const zones = chennaiLocations.map((location, index) => {
            const aqData = results[index];
            return {
                name: location.name,
                coords: [location.lat, location.lon],
                aqi: aqData.aqi,
                pollutants: aqData.pollutants
            };
        });

        const totalAqi = zones.reduce((sum, zone) => sum + zone.aqi, 0);
        const overallAQI = zones.length > 0 ? Math.round(totalAqi / zones.length) : 0;

        res.json({
            lastUpdated: new Date().toISOString(),
            overallAQI,
            recentAlert: "PM2.5 levels are high in Manali Industrial Area. Advised to stay indoors.",
            zones
        });
    } catch (err) {
        console.error("Error generating dashboard data:", err.message);
        res.status(500).json({ error: "Unable to fetch dashboard data" });
    }
});

app.get('/api/alerts', (req, res) => {
    res.json({
      activeAlerts: [
        { id: "alert-001", severity: "high", message: "High CO₂ levels detected in Manali Industrial Area (680 ppm)" },
        { id: "alert-002", severity: "moderate", message: "PM2.5 levels above threshold in Central Chennai (58 µg/m³)" }
      ],
      history: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: [10, 15, 12, 18, 22, 25, 20, 15, 17, 28, 35, 30]
      }
    });
});

app.get('/api/trends', (req, res) => {
    res.json({
      hourlyAQI: {
        labels: ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"],
        data: [121, 126, 132, 138, 145, 153, 151, 145, 139, 135, 130, 124, 119, 114, 110, 105, 110, 120, 130, 138, 147, 154, 148, 139]
      },
      dailyPollutants: {
        labels: ["PM2.5", "CO₂", "NO₂", "SO₂", "O₃"],
        data: [58, 557, 36, 9, 50]
      },
      zoneComparison: {
        labels: ["PM2.5", "NO₂", "O₃", "SO₂", "CO₂"],
        datasets: [{ label: "Citywide Average", data: [58, 60, 63, 45, 69] }]
      }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});