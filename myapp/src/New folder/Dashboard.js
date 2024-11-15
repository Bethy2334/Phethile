import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js'; // Import necessary parts
import image1 from './images/image1.jpg';
import image2 from './images/image2.jpeg';
import image3 from './images/image3.jpeg';

// Register required scales and components
Chart.register(CategoryScale, LinearScale, BarElement);

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [image1, image2, image3];

  useEffect(() => {
    // Fetch products from the backend API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  // Prepare data for the bar chart
  const chartData = {
    labels: products.map(product => product.name),
    datasets: [{
      label: 'Product Stock Levels',
      data: products.map(product => product.stock), // Use stock from backend data
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  return (
    <div className="container">
      <h2>Welcome to Wings Cafe Dashboard</h2>
      <p>Your go-to spot for delightful drinks and delicious food!</p>

      {/* Rotating Images */}
      <div className="image-slider">
        <img 
          src={images[currentImageIndex]} 
          alt="Cafe" 
          className="slider-image" 
        />
      </div>

      {/* Stock Levels Graph */}
      <div className="chart-container">
        <h3>Current Stock Levels</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default Dashboard;
