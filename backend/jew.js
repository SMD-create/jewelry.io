const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const Papa = require('papaparse');

const app = express();
app.use(cors());

// Serve images from the all_images folder
app.use('/images', express.static(path.join(__dirname, '..', 'all_images')));

// Endpoint to serve jewelry metadata as JSON
app.get('/jewelry_metadata', (req, res) => {
  const filePath = path.join(__dirname, '..', 'jewelry_metadata.csv');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading CSV file');
    }

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const adjustedData = result.data.map((item) => ({
          id: item['Product Name'].replace(/ /g, '_'), // Match frontend naming convention
          price: item['Price'].replace(/[₹,]/g, ''), // Remove ₹ and commas
          isBestseller: item['Is Bestseller'] === 'Yes',
          imagePath: `/images/${path.basename(item['Image Path'])}`,
        }));
        res.json(adjustedData);
      },
    });
  });
});

// Endpoint to list all image filenames in the all_images folder
app.get('/images_list', (req, res) => {
  const directoryPath = path.join(__dirname, '..', 'all_images');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan images folder' });
    }
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({ id: file, imageUrl: `/images/${file}` }));
    res.json(images);
  });
});

// Endpoint to fetch similar jewels based on similarity matrix
app.get('/similar_jewels/:jewelId', (req, res) => {
  const jewelId = req.params.jewelId;
  const filePath = path.join(__dirname, '..', 'image_similarity_matrix.csv');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading CSV file');
    }

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const jewelRow = result.data.find((row) => row[''] === jewelId);
        if (!jewelRow) {
          return res.status(404).send('Jewel not found in similarity matrix');
        }

        // Convert the row into an array of objects with jewel ID and similarity score
        const similarJewels = Object.entries(jewelRow)
          .filter(([key]) => key !== '') // Exclude the jewel name column
          .map(([id, similarity]) => ({
            jewel_id: id,
            similarity: parseFloat(similarity),
          }))
          .sort((a, b) => b.similarity - a.similarity) // Sort by similarity
          .slice(0, 5); // Limit to top 5 similar jewels

        res.json(similarJewels);
      },
    });
  });
});

// Export the app for Vercel
module.exports = app;
