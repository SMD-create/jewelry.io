const express = require('express');
const cors = require('cors'); // Import CORS
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

// Use CORS to allow requests from http://localhost:3000
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.static('public'));

// Endpoint to get the list of images
app.get('/api/images', (req, res) => {
    const imageDirectory = path.join(__dirname, 'public', 'all_images'); // Adjust path as needed
    
    fs.readdir(imageDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        // Filter for image files only (e.g., .jpg, .png)
        const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(images);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
