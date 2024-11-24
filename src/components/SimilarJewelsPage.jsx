import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Slider from "react-slick";
import "../styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SimilarJewelsPage() {
  const { jewelId } = useParams();
  const [selectedJewel, setSelectedJewel] = useState(null);
  const [similarJewels, setSimilarJewels] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadataResponse = await axios.get("https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/jewelry_metadata");
        setMetadata(metadataResponse.data);
        setIsMetadataLoaded(true);  // Set metadata as loaded after fetching
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    if (!isMetadataLoaded) return; // Wait until metadata is loaded

    const fetchJewelData = async () => {
      try {
        const jewelResponse = await axios.get("https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/images_list");
        const jewelData = jewelResponse.data.find((jewel) => jewel.id === jewelId);

        if (jewelData) {
          const { price } = getJewelMetadata(jewelId);
          setSelectedJewel({
            ...jewelData,
            name: jewelData.id.replace(/_/g, " ").replace(".jpg", ""),
            price,
            imageUrl: `/images/${jewelData.id.endsWith('.jpg') ? jewelData.id : jewelData.id + '.jpg'}`
          });
        }

        const similarResponse = await axios.get(`https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/similar_jewels/${jewelId}`);
        setSimilarJewels(similarResponse.data);
      } catch (error) {
        console.error("Error fetching jewel data:", error);
      }
    };

    fetchJewelData();
  }, [jewelId, isMetadataLoaded]); // Trigger when metadata is loaded

  const getJewelMetadata = (jewelId) => {
    const jewelMetadata = metadata.find((meta) => meta.id === jewelId.replace('.jpg', ''));
    if (!jewelMetadata) return { price: '₹0', isBestseller: false };

    const price = parseFloat(jewelMetadata.price) || 0;
    const priceString = price.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });

    return { price: priceString, isBestseller: jewelMetadata.isBestseller };
  };

  const renderSimilarJewel = (jewel) => {
    const imageUrl = `https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app/images/${jewel.jewel_id.endsWith('.jpg') ? jewel.jewel_id : jewel.jewel_id + '.jpg'}`;
    const { price } = getJewelMetadata(jewel.jewel_id);
    const similarityPercentage = parseFloat(jewel.similarity).toFixed(2); 

    return (
      <div key={jewel.jewel_id} className="similar-jewel-card">
        <div className="similar-jewel-similarity">{similarityPercentage}%</div>
        <img src={imageUrl} alt={jewel.jewel_id} className="similar-jewel-image" />
        <p className="similar-jewel-name">{jewel.jewel_id.replace(/_/g, ' ').replace('.jpg', '')}</p>
        <p className="similar-jewel-price">{price}</p>
    </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div>
      {selectedJewel && (
        <div className="selected-jewel">
          <h3>{selectedJewel.name}</h3>
          <img
            className="large-image"
            src={`https://jewelry-store-asr8suah4-smd-creates-projects.vercel.app${selectedJewel.imageUrl}`}
            alt={selectedJewel.name}
          />
          <div className="price-container">
            <p className="selected-jewel-price">{selectedJewel.price}</p>
            <span className="tax-note">(MRP Inclusive of all taxes)</span>
          </div>
        </div>
      )}

      {similarJewels.length > 0 && (
        <div>
          <h3>Similar Jewels</h3>
          <Slider {...sliderSettings}>
            {similarJewels.map(renderSimilarJewel)}
          </Slider>
        </div>
      )}
    </div>
  );
}

export default SimilarJewelsPage;
