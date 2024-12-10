import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, CircleMarker } from 'react-leaflet';
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';
import Legend from './Legend';
import MarkerList from './MarkerList';
import MarkerClusterGroup from 'react-leaflet-markercluster';

// Function to create a color mapping based on unique languages
const createColorMapping = (uniqueLangs) => {
  const customColors = [
    '#2f4f4f', '#34A3D2FF', '#191970', '#DDDCDCFF', '#991616FF',
    '#ffa500', '#ffff00', '#0000cd', '#00ff00', '#00bfff',
    '#00fa9a', '#D10ED1FF', '#ff1493', '#dda0dd', '#20B2AA',
    '#006400', '#A9A9A9', '#BDB76B', '#FF1493', '#C71585'
  ];

  const colors = d3.scaleOrdinal(customColors);

  return uniqueLangs.reduce((acc, language, index) => {
    acc[language] = colors(index % customColors.length); // Loop through colors
    return acc;
  }, {});
};
const MapComponent = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');  
  const [markerData, setMarkerData] = useState([]);
  const [dynamicColorMapping, setDynamicColorMapping] = useState({});
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [geoJsonDataLines, setGeoJsonDataLines] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]);
  const [sidebarContent, setSidebarContent] = useState("Click on a point to show details");
  const [selectedSidebarFilter, setSelectedSidebarFilter] = useState('');  


  // Load data from CSV and GeoJSON files
  useEffect(() => {
    fetch('http://localhost:5000/download-csv')
    .then((response) => response.text())
    // d3.csv('/data/jlp_combined_demo.csv')
      .then((data) => {
        const parsedData = d3.csvParse(data); // `d3.csvParse` converts CSV text to an array of objects
        const updatedData = parsedData.map((d) => ({

        // const updatedData = data.map((d) => ({
          ...d,
          lat: parseFloat(d.Birth_City_Lat),
          lon: parseFloat(d.Birth_City_Lon),
          language: d.lang2,
        }));
        const uniqueLangs = [...new Set(updatedData.map((marker) => marker.lang2))];
        const colorMapping = createColorMapping(uniqueLangs);
        setDynamicColorMapping(colorMapping);  // Set dynamic color mapping here
        setMarkerData(updatedData);
      })
      .catch((error) => console.error('Error loading CSV data:', error));

    d3.json('/data/cntry1880.geojson')
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));

    d3.json('/data/jlp_classroom1_lines.geojson')
      .then((data) => setGeoJsonDataLines(data))
      .catch((error) => console.error('Error loading GeoJSON lines:', error));
  }, []);

  const createClusterIcon = (languages, dynamicColorMapping) => {
    if (!dynamicColorMapping || Object.keys(dynamicColorMapping).length === 0) {
      console.warn('dynamicColorMapping is empty');
      return null;
    }
  
    // Calculate the counts of each language in the cluster
    const counts = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
  
    // Create the canvas and set its size to 30x20 (width x height)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = 30;
    const height = 20;
    const padding = 2;
    const total = languages.length;
  
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
  
    // Divide the canvas into two squares of equal width (15px each)
    const squareWidth = width / 2;
  
    // Draw the left square with the total count
    context.fillStyle = 'white'; // Background color of the left square
    context.fillRect(0, 0, squareWidth, height);
  
    context.fillStyle = 'black'; // Text color for count
    context.font = 'bold 12px Arial';
    const totalText = `${total}`;
    const textWidth = context.measureText(totalText).width;
    context.fillText(totalText, (squareWidth - textWidth) / 2, height / 2 + 5);
  
    // Draw the right square with the color mapping
    let currentY = 0;
    const entries = Object.entries(counts).map(([lang, count]) => {
      const color = dynamicColorMapping[lang] || '#808080'; // Default to gray if not found
      return {
        lang,
        count,
        color,
        height: (count / total) * height, // Calculate height of each colored part
      };
    });
  
    entries.forEach(({ color, height }, index) => {
      context.fillStyle = color;
      context.fillRect(squareWidth, currentY, squareWidth, height); // Draw the colored square
      currentY += height; // Update the currentY for the next color block
    });
  
    // Return the custom icon with the generated canvas image
    return new L.DivIcon({
      html: `<img src="${canvas.toDataURL()}" style="display:block;" />`,
      iconSize: [width, height],  // Set the size of the icon
      iconAnchor: [width / 2, height / 2],  // Set anchor point to the center of the icon
    });
  };
  
  // Only render MarkerClusterGroup when dynamicColorMapping is available
  if (!dynamicColorMapping || Object.keys(dynamicColorMapping).length === 0) {
    return <div>Loading...</div>;
  }
  

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MapContainer center={[51.505, -0.09]} zoom={3} maxZoom={14} minZoom={3} zoomControl={false} style={{ height: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Basemap">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay name="Borders 1880" checked>
            {geoJsonData && <GeoJSON data={geoJsonData} style={() => ({ fillColor: '#f0dbc5', color: '#b0906d' })} />}
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Migration Lines" checked>
            {geoJsonDataLines && <GeoJSON data={geoJsonDataLines} style={() => ({ color: '#909090', weight: 1 })} />}
          </LayersControl.Overlay>
        </LayersControl>

        <MarkerClusterGroup
          showCoverageOnHover={false}
          chunkedLoading={true}
          spiderfyOnMaxZoom={true}
          spiderfyDistanceMultiplier={2} // Increase this value to make markers spread out more

          iconCreateFunction={(cluster) => {
            const languages = cluster.getAllChildMarkers().map((marker) => marker.options.lang2);
            return createClusterIcon(languages, dynamicColorMapping);
          }}
        >
          {markerData.map((marker, index) => (
            <CircleMarker
              key={index}
              center={[marker.lat, marker.lon]}
              radius={5}
              fillColor={dynamicColorMapping[marker.lang2] || '#808080'}
              color={dynamicColorMapping[marker.lang2] || '#808080'}
              fillOpacity={0.8}
              eventHandlers={{
                click: () => {
                  console.log(`Clicked on ${marker.Name_Short}`);
                  setSidebarContent(`${marker.Name_Short}`);
                },
              }}
              lang2={marker.lang2}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <Legend
        colorMapping={dynamicColorMapping}
        selectedFilter={selectedFilter}
        handleFilterChange={(e) => setSelectedFilter(e.target.value)}
      />
      <Sidebar
        sidebarContent={sidebarContent}
        colorMapping={dynamicColorMapping}
        selectedSidebarFilter={selectedSidebarFilter}
        handleFilterChange={(e) => setSelectedSidebarFilter(e.target.value)}
      />
    </div>
  );
};

export default MapComponent;
