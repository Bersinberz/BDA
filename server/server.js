const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { spawn } = require('child_process');

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('client'))
app.use(express.static(path.join(__dirname, '../assets')));

// Initialize OpenAI client for NVIDIA
const OpenAI = require('openai');

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

console.log("✅ NVIDIA AI Client initialized successfully");

function getAQIStatus(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

// --- Locations in Chennai ---
const chennaiLocations = [
  // --- Central Chennai (existing + new) ---
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
  { name: "Chintadripet", lat: 13.082, lon: 80.2811 },
  { name: "Parrys Corner", lat: 13.0883, lon: 80.2917 },
  { name: "Mint", lat: 13.0901, lon: 80.2922 },
  { name: "Basin Bridge", lat: 13.1045, lon: 80.278 },

  // --- Inner South Chennai ---
  { name: "Guindy", lat: 13.0076, lon: 80.2139 },
  { name: "Saidapet", lat: 13.0219, lon: 80.2295 },
  { name: "Thiruvanmiyur", lat: 12.9851, lon: 80.2592 },
  { name: "Besant Nagar", lat: 13.0007, lon: 80.2678 },
  { name: "Alandur", lat: 13.0039, lon: 80.2039 },
  { name: "Adambakkam", lat: 12.9926, lon: 80.2104 },
  { name: "Nanganallur", lat: 12.9863, lon: 80.1843 },
  { name: "Meenambakkam", lat: 12.9895, lon: 80.1801 },
  { name: "Pazhavanthangal", lat: 12.991, lon: 80.1792 },
  { name: "St. Thomas Mount", lat: 12.9915, lon: 80.1832 },
  { name: "Ekkatuthangal", lat: 13.0025, lon: 80.215 },
  { name: "Ramapuram", lat: 13.036, lon: 80.174 },

  // --- North Chennai ---
  { name: "Manali", lat: 13.196, lon: 80.2964 },
  { name: "Royapuram", lat: 13.1167, lon: 80.295 },
  { name: "Perambur", lat: 13.1165, lon: 80.2374 },
  { name: "Washermenpet", lat: 13.1119, lon: 80.2858 },
  { name: "Vyasarpadi", lat: 13.1186, lon: 80.252 },
  { name: "Tondiarpet", lat: 13.1309, lon: 80.2952 },
  { name: "Ennore", lat: 13.2163, lon: 80.3243 },
  { name: "Madhavaram", lat: 13.1493, lon: 80.2355 },
  { name: "Thiruvottiyur", lat: 13.19, lon: 80.31 },
  { name: "Korukkupet", lat: 13.111, lon: 80.286 },
  { name: "Chennai Port", lat: 13.0835, lon: 80.289 },

  // --- West Chennai ---
  { name: "Anna Nagar", lat: 13.084, lon: 80.2101 },
  { name: "Koyambedu", lat: 13.0731, lon: 80.1931 },
  { name: "Vadapalani", lat: 13.05, lon: 80.212 },
  { name: "Porur", lat: 13.0345, lon: 80.1549 },
  { name: "Ambattur", lat: 13.1143, lon: 80.1547 },
  { name: "Avadi", lat: 13.1155, lon: 80.0767 },
  { name: "Mogappair", lat: 13.0838, lon: 80.18 },
  { name: "Villivakkam", lat: 13.1026, lon: 80.2079 },
  { name: "Padi", lat: 13.1051, lon: 80.1901 },
  { name: "Valasaravakkam", lat: 13.051, lon: 80.174 },
  { name: "Athipet", lat: 13.113, lon: 80.153 },
  { name: "Maduravoyal", lat: 13.065, lon: 80.181 },

  // --- East Chennai & OMR Corridor ---
  { name: "OMR Karapakkam", lat: 12.936, lon: 80.235 },
  { name: "Sholinganallur IT Corridor", lat: 12.8901, lon: 80.2285 },
  { name: "Siruseri SIPCOT", lat: 12.8422, lon: 80.2201 },
  { name: "Navalur", lat: 12.8631, lon: 80.2238 },
  { name: "Perungudi", lat: 12.9667, lon: 80.2457 },
  { name: "Taramani", lat: 12.9791, lon: 80.2435 },
  { name: "Medavakkam", lat: 12.9197, lon: 80.1979 },
  { name: "Perumbakkam", lat: 12.9123, lon: 80.212 },
  { name: "MGR Nagar", lat: 12.985, lon: 80.251 },

  // --- Southern Suburbs ---
  { name: "Velachery", lat: 12.9785, lon: 80.218 },
  { name: "Pallikaranai", lat: 12.9379, lon: 80.2155 },
  { name: "Madipakkam", lat: 12.9628, lon: 80.203 },
  { name: "Keelkattalai", lat: 12.9555, lon: 80.1856 },
  { name: "Pallavaram", lat: 12.9696, lon: 80.15 },
  { name: "Chromepet", lat: 12.9526, lon: 80.1437 },
  { name: "Tambaram Sanatorium", lat: 12.9377, lon: 80.1228 },
  { name: "Tambaram", lat: 12.9249, lon: 80.1105 },
  { name: "Vandalur", lat: 12.8944, lon: 80.0825 },
  { name: "Urapakkam", lat: 12.8711, lon: 80.0655 },
  { name: "Guduvancheri", lat: 12.853, lon: 80.0573 },
  { name: "Potheri", lat: 12.8361, lon: 80.0465 },
  { name: "Kelambakkam", lat: 12.7909, lon: 80.2246 },
  { name: "Mahindra World City", lat: 12.816, lon: 80.222 },
  { name: "Chengalpattu Highway", lat: 12.828, lon: 80.19 },

  // --- Industrial Zones ---
  { name: "Manali Industrial Area", lat: 13.196, lon: 80.293 },
  { name: "Ambattur Industrial Estate", lat: 13.1145, lon: 80.155 },
  { name: "Padi Industrial Area", lat: 13.105, lon: 80.19 },
  { name: "Guindy Industrial Estate", lat: 13.008, lon: 80.214 },
  { name: "SIPCOT Industrial Estate", lat: 12.841, lon: 80.218 },

  // --- Peripheral villages / outskirts ---
  { name: "Pallavaram Airport", lat: 12.96, lon: 80.16 },
  { name: "Medavakkam Village", lat: 12.92, lon: 80.2 },
  { name: "Kelambakkam Outskirts", lat: 12.788, lon: 80.23 },
  { name: "Chengalpattu Outskirts", lat: 12.82, lon: 80.18 }
];

function getPredictedAQI() {
    return new Promise((resolve, reject) => {
        const process = spawn('python', ['predict_aqi.py']);
        let output = '';

        process.stdout.on('data', data => {
            output += data.toString();
        });

        process.stderr.on('data', data => {
            console.error('Python error:', data.toString());
        });

        process.on('close', () => {
            const predicted = parseFloat(output.trim());
            resolve(isNaN(predicted) ? 0 : predicted);
        });

        process.on('error', err => reject(err));
    });
}

// --- Helper to fetch Air Quality Data from Google API ---
async function getAirQualityData(lat, lon) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;

    try {
        const response = await axios.post(url, {
            location: { latitude: lat, longitude: lon },
        });

        const data = response.data;
        const index = data.indexes?.[0];
        const aqi = index?.aqi || 0;
        const dominantPollutant = index?.dominantPollutant?.toUpperCase() || 'N/A';

        const pollutantMap = {};
        if (Array.isArray(data.pollutants)) {
            data.pollutants.forEach(p => {
                pollutantMap[p.code.toLowerCase()] = p.concentration?.value || null;
            });
        }

        return { aqi, dominantPollutant, pollutants: pollutantMap };
    } catch (error) {
        console.error("Error fetching from Google API:", error.response?.data?.error?.message || error.message);
        return { aqi: 0, dominantPollutant: 'N/A', pollutants: {} };
    }
}

// --- API Endpoint: Dashboard Data ---
app.get('/api/dashboard', async (req, res) => {
    try {
        const results = await Promise.all(
            chennaiLocations.map(loc => getAirQualityData(loc.lat, loc.lon))
        );

        const zones = chennaiLocations.map((loc, i) => ({
            name: loc.name,
            coords: [loc.lat, loc.lon],
            aqi: results[i].aqi,
            dominantPollutant: results[i].dominantPollutant,
            pollutants: results[i].pollutants
        }));

        const overallAQI = zones.length
            ? zones.reduce((maxAQI, zone) => (zone.aqi > maxAQI ? zone.aqi : maxAQI), 0)
            : 0;

        const predictedNextHourAQI = await getPredictedAQI();

        res.json({
            lastUpdated: new Date().toISOString(),
            overallAQI,
            predictedNextHourAQI,
            recentAlert: "PM2.5 levels are high in Manali Industrial Area. Advised to stay indoors.",
            zones
        });
    } catch (err) {
        console.error("Dashboard error:", err.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.post('/api/check-location', async (req, res) => {
    try {
        const { name, phone, latitude, longitude } = req.body;

        if (!name || !phone || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // 1️⃣ Check Twilio credentials
        const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;
        if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
            console.error('Twilio credentials missing in .env');
            return res.status(500).json({ error: 'Twilio credentials not configured.' });
        }

        // 2️⃣ Fetch AQI for location
        const aqiData = await getAirQualityData(parseFloat(latitude), parseFloat(longitude));
        const { aqi, dominantPollutant } = aqiData;

        // 3️⃣ Determine AQI status
        function getAQIStatus(aqi) {
            if (aqi <= 50) return { text: "Good" };
            if (aqi <= 100) return { text: "Moderate" };
            if (aqi <= 200) return { text: "Unhealthy" };
            if (aqi <= 300) return { text: "Very Unhealthy" };
            return { text: "Hazardous" };
        }

        const status = getAQIStatus(aqi);

        // 4️⃣ Send alert SMS if AQI above threshold (30)
        if (aqi > 30) {
            try {
                const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `⚠️ Hi ${name}, AQI Alert! Location: [${latitude}, ${longitude}], AQI: ${aqi}, Status: ${status.text}, Dominant Pollutant: ${dominantPollutant}`,
                    from: TWILIO_PHONE,
                    to: phone
                });
                console.log(`Alert SMS sent to ${phone}`);
            } catch (err) {
                console.error('Twilio send error:', err.message);
            }
        }

        // 5️⃣ Respond with data for frontend dialog
        res.json({
            location: { latitude, longitude },
            aqi,
            dominantPollutant,
            status: status.text,
            alert: aqi > 30 ? 'Air quality is poor. Take precautions!' : 'Air quality is safe.',
        });

    } catch (err) {
        console.error('Error checking location:', err.message);
        res.status(500).json({ error: 'Failed to check location AQI.' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, aqiData } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let aqiContext = "Current AQI data is unavailable.";
        if (aqiData) {
            aqiContext = `
Current Chennai AQI Overview:
- Overall AQI: ${aqiData.overallAQI}
- Predicted Next Hour AQI: ${aqiData.predictedNextHourAQI}
- Recent Alert: ${aqiData.recentAlert}
- Zones with data: ${aqiData.zones ? aqiData.zones.length : 0}
`;

            if (aqiData.zones && aqiData.zones.length > 0) {
                aqiContext += "\nKey Zone Details:\n";
                aqiData.zones.slice(0, 5).forEach(zone => {
                    aqiContext += `- ${zone.name}: AQI ${zone.aqi}, Dominant Pollutant: ${zone.dominantPollutant}\n`;
                });
            }
        }

        const systemPrompt = `You are Mr. Pollution Sentinel, an expert on Chennai's air quality and health recommendations. You have access to current air quality data and provide helpful, accurate responses focused on air quality information, health impacts, and recommendations. If the question is not related to air quality or pollution, politely redirect to your area of expertise.

Current AQI Data:
${aqiContext}

Guidelines:
- Be concise and helpful (max 3-4 sentences)
- Focus on actionable health recommendations
- Reference specific Chennai locations when relevant
- Use simple, clear language
- If AQI is high, emphasize precautions
- If data is unavailable, say so and provide general advice`;

        try {
            const completion = await nvidiaClient.chat.completions.create({
                model: "qwen/qwen3-coder-480b-a35b-instruct",
                messages: [
                    {"role": "system", "content": systemPrompt},
                    {"role": "user", "content": message}
                ],
                temperature: 0.7,
                top_p: 0.8,
                max_tokens: 500, // Reduced for faster responses
                stream: false
            });

            const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment.";
            
            res.json({ response });
        } catch (nvidiaError) {
            console.error('NVIDIA API error:', nvidiaError);
            // Fallback response
            const fallbackResponse = `No response available at the moment. Please try again later.`;
            res.json({ response: fallbackResponse });
        }
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});