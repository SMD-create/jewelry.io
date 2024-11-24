import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function JewelGrid() {
  const [jewels, setJewels] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const navigate = useNavigate();

  // Fetch jewel images list from server
  useEffect(() => {
    const fetchJewels = async () => {
      try {
        const response = await axios.get("https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/images_list");
        const jewelData = response.data.map((jewel) => ({
          ...jewel,
          name: jewel.id.replace(/_/g, " ").replace(".jpg", ""),
        }));
        setJewels(jewelData);
      } catch (error) {
        console.error("Error fetching jewels:", error);
      }
    };

    // Fetch metadata for jewels
    const fetchMetadata = async () => {
      try {
        const response = await axios.get("https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/jewelry_metadata");
        setMetadata(response.data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchJewels();
    fetchMetadata();
  }, []);

  // Function to get jewel metadata by ID and format the price
  const getJewelMetadata = (jewelId) => {
    const normalizedJewelId = jewelId.replace('.jpg', ''); // Remove ".jpg" extension
    const jewelMetadata = metadata.find(data => data.id === normalizedJewelId);

    if (!jewelMetadata) {
      console.log(`No metadata found for jewel ${normalizedJewelId}`);
      return { price: '0', isBestseller: false };
    }

    const price = parseFloat(jewelMetadata.price) || 0;
    const priceString = price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });

    return {
      price: priceString,
      isBestseller: jewelMetadata.isBestseller,
    };
  };

  // Handle click event to navigate to SimilarJewelsPage
  const handleJewelClick = (jewel) => {
    navigate(`/jewel/${jewel.id}`);
  };

  return (
    <div>
      <h2>Jewel Gallery</h2>
      <div className="jewel-grid">
        {jewels.length > 0 ? (
          jewels.map((jewel) => {
            const { price, isBestseller } = getJewelMetadata(jewel.id);
            return (
              <div
                key={jewel.id}
                className="jewel-card"
                onClick={() => handleJewelClick(jewel)}
              >
                <img
                  src={`https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app${jewel.imageUrl}`}
                  alt={jewel.name}
                  onError={(e) => {
                    console.error(`Failed to load image for: ${jewel.id}`);
                    e.target.style.display = 'none';
                  }}
                  className="jewel-image"
                />
                <p className="jewel-name">{jewel.name}</p>
                <p className="jewel-price">{price}</p>
                {isBestseller && <span className="bestseller-badge">Bestseller</span>}
              </div>
            );
          })
        ) : (
          <p>Loading jewels...</p>
        )}
      </div>
    </div>
  );
}

export default JewelGrid;
