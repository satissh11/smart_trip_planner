import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import AILoader from "./AILoader";
import "./App.css";
import "leaflet/dist/leaflet.css";

/* ===== Leaflet Icon Fix ===== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ================= AUTOCOMPLETE COMPONENT ================= */
function LocationSearchInput({ placeholder, value, onSelect, onClear, initialText = "" }) {
  const [query, setQuery] = useState(initialText);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(initialText);
  }, [initialText]);

  useEffect(() => {
    if (!query || query.length < 3 || query === "You are Live 📍") {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data || []);
          setLoading(false);
          setIsOpen(true);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const name = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setQuery(name);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(name, [lat, lon]);
  };

  return (
    <div ref={containerRef} className="autocomplete-container" style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") {
            onClear();
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        style={{ width: '100%', margin: '8px 0' }}
      />
      {loading && <div className="autocomplete-spinner">⚡ Search...</div>}
      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((item, idx) => (
            <li key={idx} onClick={() => handleSelect(item)} className="autocomplete-suggestion-item">
              <span className="location-icon">📍</span>
              <span className="location-text" title={item.display_name}>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapViewHandler({ origin, destination, routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      if (routeCoords && routeCoords.length > 0) {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      } else {
        const bounds = L.latLngBounds([origin, destination]);
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }
  }, [origin, destination, routeCoords, map]);
  return null;
}

function getDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* ================= HOME PAGE ================= */
function Home() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [originCoords, setOriginCoords] = useState(null);
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeType, setRouteType] = useState("fastest");
  const [transport, setTransport] = useState("");
  const [fuelType, setFuelType] = useState("petrol");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transport === "bike" || transport === "car" || transport === "bus") {
      setFuelType("petrol");
    }
  }, [transport]);

  const getLiveLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOriginCoords([pos.coords.latitude, pos.coords.longitude]);
          setOrigin("You are Live 📍");
          setLoading(false);
        },
        () => {
          alert("Unable to fetch location. Please type manually.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handlePlan = () => {
    if (!originCoords || !destinationCoords || !transport) {
      return alert("Bhai, Details fill karo! (Origin, Destination and Transport Mode are required)");
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/result", {
        state: {
          originName: origin,
          origin: originCoords,
          destinationName: destination,
          destination: destinationCoords,
          transport,
          routeType,
          fuelType
        }
      });
    }, 1500);
  };

  return (
    <div className="app">
      <nav className="navbar"></nav>
      <div className="container glass-card">
        <h1 className="main-heading">आपकी यात्रा मंगलमय हो</h1>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
          <LocationSearchInput
            placeholder="Search Origin Address..."
            value={originCoords}
            initialText={origin}
            onSelect={(name, coords) => {
              setOrigin(name);
              setOriginCoords(coords);
            }}
            onClear={() => {
              setOrigin("");
              setOriginCoords(null);
            }}
          />
          <button onClick={getLiveLocation} className="gradient-btn" style={{ padding: '14px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px' }} title="Use Current GPS Location" aria-label="Use Current GPS Location">📍</button>
        </div>

        <LocationSearchInput
          placeholder="Search Destination Address..."
          value={destinationCoords}
          initialText={destination}
          onSelect={(name, coords) => {
            setDestination(name);
            setDestinationCoords(coords);
          }}
          onClear={() => {
            setDestination("");
            setDestinationCoords(null);
          }}
        />

        <select value={transport} onChange={e => setTransport(e.target.value)} style={{ marginBottom: '10px' }} aria-label="Select Transport Mode">
          <option value="">Transport Mode</option>
          <option value="car">Car 🚗</option>
          <option value="bike">Bike 🏍️</option>
          <option value="bus">Bus 🚌</option>
          <option value="train">Train 🚄</option>
          <option value="plane">Airplane ✈️</option>
          <option value="walking">Walking 🚶</option>
        </select>

        {(transport === "car" || transport === "bus" || transport === "bike") && (
          <select value={fuelType} onChange={e => setFuelType(e.target.value)} style={{ marginBottom: '15px' }} aria-label="Select Fuel Type">
            <option value="petrol">Petrol ⛽</option>
            {(transport === "car" || transport === "bus") && (
              <>
                <option value="diesel">Diesel ⛽</option>
                <option value="cng">CNG ☘️</option>
              </>
            )}
          </select>
        )}

        <div className="route-cards">
          {["fastest", "cheapest", "eco"].map(t => (
            <button key={t} type="button" className={`card ${routeType === t ? "active" : ""}`} onClick={() => setRouteType(t)} aria-label={`${t} route mode`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <button className="plan-btn" onClick={handlePlan} aria-label="Generate trip route details instantly"> झट-पट </button>
      </div>
      {loading && <AILoader />}
    </div>
  );
}

/* ================= RESULT PAGE ================= */
function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [weather, setWeather] = useState({ temp: "--", text: "Fetching...", humidity: "--", wind: "--" });
  const [routeCoords, setRouteCoords] = useState([]);
  const [osrmSpec, setOsrmSpec] = useState(null);

  useEffect(() => {
    if (state?.destination) {
      // Fetch detailed weather from Open-Meteo
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${state.destination[0]}&longitude=${state.destination[1]}&current_weather=true&relative_humidity_2m=true`)
        .then(res => res.json())
        .then(data => {
          const w = data.current_weather;
          let desc = "Clear";
          if (w.weathercode === 0) desc = "Sunny";
          else if (w.weathercode > 0 && w.weathercode <= 3) desc = "Cloudy";
          else if (w.weathercode >= 51 && w.weathercode <= 67) desc = "Rainy";
          else if (w.weathercode >= 71 && w.weathercode <= 77) desc = "Snowy";
          else if (w.weathercode >= 80 && w.weathercode <= 82) desc = "Showers";
          else if (w.weathercode >= 95) desc = "Thunderstorm";

          setWeather({
            temp: Math.round(w.temperature),
            text: desc,
            humidity: data.current_weather ? (data.current_weather.weathercode + 40) + "%" : "55%", // approximation
            wind: w.windspeed + " km/h"
          });
        })
        .catch(() => {
          setWeather({ temp: "28", text: "Cloudy", humidity: "60%", wind: "12 km/h" });
        });
    }
  }, [state]);

  // Fetch real route coordinates using OSRM
  useEffect(() => {
    if (state?.origin && state?.destination && state?.transport) {
      const { origin, destination, transport } = state;
      let profile = "driving";
      if (transport === "bike") profile = "bicycle";
      else if (transport === "walking") profile = "foot";

      if (["car", "bike", "bus", "walking"].includes(transport)) {
        const url = `https://router.project-osrm.org/route/v1/${profile}/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes[0]) {
              const route = data.routes[0];
              const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
              setRouteCoords(coords);
              setOsrmSpec({
                distance: (route.distance / 1000).toFixed(1),
                duration: route.duration / 3600
              });
            }
          })
          .catch(() => {
            setRouteCoords([]);
            setOsrmSpec(null);
          });
      } else {
        setRouteCoords([]);
        setOsrmSpec(null);
      }
    }
  }, [state]);

  if (!state) return <div className="app">No journey data present!</div>;
  const { originName, origin, destinationName, destination, transport, routeType, fuelType } = state;

  const specs = {
    car: { speed: 65, mileage: fuelType === "cng" ? 26 : (fuelType === "diesel" ? 20 : 15), icon: "🚗", co2Factor: 0.18, eco: "High carbon emissions. CNG helps lower impact." },
    bike: { speed: 45, mileage: 45, icon: "🏍️", co2Factor: 0.08, eco: "Fuel efficient and fast for urban environments." },
    bus: { speed: 40, mileage: fuelType === "cng" ? 18 : (fuelType === "diesel" ? 14 : 10), icon: "🚌", co2Factor: 0.10, eco: "High occupancy keeps emissions per capita very low." },
    train: { speed: 85, ticket: 1.2, icon: "🚄", co2Factor: 0.04, eco: "Extremely eco-friendly rapid land transit. 🏆" },
    plane: { speed: 750, ticket: 9.5, icon: "✈️", co2Factor: 0.25, eco: "Extremely heavy carbon footprint. Consider offsets." },
    walking: { speed: 5, mileage: 0, icon: "🚶", co2Factor: 0, eco: "Zero Emissions. Fully green health mode! 💚" }
  };

  const rawDist = Number(getDistance(origin, destination).toFixed(1));
  const distance = osrmSpec ? parseFloat(osrmSpec.distance) : rawDist;
  const totalHours = osrmSpec ? osrmSpec.duration : distance / specs[transport].speed;
  const totalPollution = (distance * specs[transport].co2Factor).toFixed(1);

  let mainCost = 0;
  const isPublicDirect = ['train', 'plane'].includes(transport);

  if (transport === 'walking') {
    mainCost = 0;
  } else if (isPublicDirect) {
    mainCost = Math.round(distance * specs[transport].ticket);
  } else {
    const rate = fuelType === 'petrol' ? 96 : (fuelType === 'diesel' ? 89 : 82);
    mainCost = Math.round((distance / specs[transport].mileage) * rate);
  }

  const foodCost = Math.round((totalHours / 6) * 300);
  const nights = Math.floor(totalHours / 12);
  const stayCost = nights * 1500;
  const totalTripCost = mainCost + foodCost + stayCost;

  const getLocName = (fullName) => {
    if (!fullName) return "";
    return fullName.split(',')[0].trim();
  };

  const openSearch = (qType) => {
    const query = encodeURIComponent(`${qType} near ${getLocName(destinationName)}`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  // Weather icon logic
  const getWeatherIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("sunny") || lower.includes("clear")) return "☀️";
    if (lower.includes("rain") || lower.includes("showers")) return "🌧️";
    if (lower.includes("thunder")) return "⛈️";
    if (lower.includes("snow")) return "❄️";
    return "☁️";
  };

  // Vehicle Weather Suitability
  const getVehicleSuitability = () => {
    const wText = weather.text.toLowerCase();
    const isBadWeather = wText.includes("rain") || wText.includes("shower") || wText.includes("thunder") || wText.includes("snow");
    
    if (isBadWeather && (transport === "bike" || transport === "walking")) {
      return {
        icon: "⚠️",
        title: "Not Recommended for Weather",
        desc: `Taking a ${transport} is not safe during ${weather.text}. Consider using a Car, Bus, or Train instead.`,
        color: "#ff4d4d"
      };
    } else if (isBadWeather) {
      return {
        icon: "✅",
        title: "Good Choice for Weather",
        desc: `A ${transport} will keep you safe and dry during ${weather.text}.`,
        color: "#00f5a0"
      };
    } else if (transport === "walking" || transport === "bike") {
      return {
        icon: "✅",
        title: `Great Weather for a ${transport === 'walking' ? 'Walk' : 'Ride'}`,
        desc: `The weather is ${weather.text}, perfect for this mode of transport!`,
        color: "#00f5a0"
      };
    }
    return {
      icon: "✅",
      title: "Suitable for Weather",
      desc: `A ${transport} is a perfectly fine choice for ${weather.text} conditions.`,
      color: "#00f5a0"
    };
  };

  // Offset Tree Count
  const treesNeeded = Math.max(1, Math.round(parseFloat(totalPollution) / 20));

  // Budget Proportions
  const travelPct = Math.round((mainCost / Math.max(1, totalTripCost)) * 100);
  const foodPct = Math.round((foodCost / Math.max(1, totalTripCost)) * 100);
  const stayPct = Math.round((stayCost / Math.max(1, totalTripCost)) * 100);

  return (
    <div className="app">
      <nav className="navbar"></nav>
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{
            background: routeType === 'fastest' ? 'linear-gradient(90deg, #3b82f6, #00d2ff)' : (routeType === 'cheapest' ? 'linear-gradient(90deg, #00f5a0, #10b981)' : 'linear-gradient(90deg, #10b981, #06b6d4)'),
            color: '#000',
            padding: '6px 18px', borderRadius: '25px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}>
            {routeType.toUpperCase()} MODE
          </span>
        </div>

        {/* Route Header Card */}
        <div className="glass-card" style={{ marginBottom: '15px', padding: '20px 15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left', flex: '1', minWidth: '0' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={originName}>
                {getLocName(originName)}
              </div>
              <small style={{ opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Origin</small>
            </div>
            <div style={{ flex: '1.2', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 15px' }}>
              <div style={{ width: '100%', height: '3px', background: 'linear-gradient(to right, #3b82f6, #00f5a0)', position: 'absolute', borderRadius: '2px' }}></div>
              <div style={{ position: 'absolute', right: '-2px', top: '-6px', fontSize: '14px', color: '#00f5a0' }}>➔</div>
              <div style={{ zIndex: 2, background: '#111827', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '50px', fontSize: '16px', animation: 'moveIcon 3s infinite linear' }}>
                {specs[transport].icon}
              </div>
            </div>
            <div style={{ textAlign: 'right', flex: '1', minWidth: '0' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={destinationName}>
                {getLocName(destinationName)}
              </div>
              <small style={{ opacity: 0.5, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination</small>
            </div>
          </div>
        </div>

        {/* Weather overview */}
        <div className="glass-card" style={{ marginBottom: '15px', borderLeft: '5px solid #00d2ff', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ccc', display: 'block' }}>🌤️ Destination Weather</span>
              <span style={{ fontSize: '11px', color: '#aaa' }}>{getLocName(destinationName)}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '20px', color: '#00d2ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {getWeatherIcon(weather.text)} {weather.temp}°C
              </span>
              <span style={{ fontSize: '10px', opacity: 0.8, color: '#00f5a0' }}>{weather.text} (Wind: {weather.wind})</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '15px 10px' }}>
            <small style={{ opacity: 0.5, fontSize: '9px', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>🛣️ Total Distance</small>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#00f5a0' }}>{distance} km</span>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '15px 10px' }}>
            <small style={{ opacity: 0.5, fontSize: '9px', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>⏱️ Duration</small>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>
              {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m
            </span>
          </div>
        </div>

        {/* Vehicle Weather Suitability */}
        <div className="glass-card" style={{ marginBottom: '15px', padding: '15px', borderLeft: `5px solid ${getVehicleSuitability().color}` }}>
          <h4 style={{ color: '#00d2ff', fontSize: '13px', marginBottom: '6px' }}>{getVehicleSuitability().icon} Vehicle Weather Suitability</h4>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: getVehicleSuitability().color, marginBottom: '4px' }}>
            {getVehicleSuitability().title}
          </div>
          <div style={{ fontSize: '11px', color: '#e5e7eb', lineHeight: '1.4' }}>
            {getVehicleSuitability().desc}
          </div>
        </div>

        {/* Budget Details & Visualizer */}
        <div className="glass-card" style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
            <h4 style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 'bold' }}>💰 Estimated Budget Breakdown</h4>
            <span style={{ color: '#00f5a0', fontWeight: 'bold', fontSize: '15px' }}>₹{totalTripCost}</span>
          </div>

          {/* Graphical Progress Segment */}
          {totalTripCost > 0 && (
            <div style={{ height: '8px', width: '100%', background: '#334155', borderRadius: '10px', display: 'flex', overflow: 'hidden', marginBottom: '15px' }}>
              <div style={{ width: `${travelPct}%`, background: '#3b82f6' }} title={`Travel: ${travelPct}%`}></div>
              <div style={{ width: `${foodPct}%`, background: '#00f5a0' }} title={`Food: ${foodPct}%`}></div>
              <div style={{ width: `${stayPct}%`, background: '#ffcc00' }} title={`Stay: ${stayPct}%`}></div>
            </div>
          )}

          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                {transport === 'walking' ? "🚶 Walking Travel Cost:" : (isPublicDirect ? "🎫 Public Transport Ticket:" : `⛽ Fuel Cost (${fuelType.toUpperCase()}):`)}
              </span>
              <span style={{ fontWeight: '600' }}>₹{mainCost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', display: 'inline-block' }}></span>
                🍔 Food / Miscellaneous:
              </span>
              <span style={{ fontWeight: '600' }}>₹{foodCost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffcc00', display: 'inline-block' }}></span>
                🛌 Accommodation ({nights} nights):
                <span style={{ fontSize: '9px', opacity: 0.7 }}>(~₹1500/night)</span>
              </span>
              <span style={{ fontWeight: '600', color: stayCost > 0 ? '#ffcc00' : '#aaa' }}>₹{stayCost}</span>
            </div>
          </div>
        </div>

        {/* Eco Insight */}
        <div className="glass-card" style={{ borderLeft: '5px solid #10b981', marginBottom: '15px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <small style={{ color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🌱 ECO-Impact Scorecard</small>
            <span style={{ fontSize: '11px', color: transport === 'walking' ? '#00f5a0' : '#ff4d4d', fontWeight: 'bold' }}>
              {transport === 'walking' ? "✅ Zero Carbon Footprint" : `⚠️ ${totalPollution} kg CO2`}
            </span>
          </div>
          <p style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '10px' }}>
            {specs[transport].eco}
          </p>
          
          {/* Pollution Comparison */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '11px', color: '#00f5a0', marginBottom: '8px' }}>💨 Pollution by Transport (kg CO2)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {Object.keys(specs).map(t => (
                <div key={t} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', opacity: t === transport ? 1 : 0.6, fontWeight: t === transport ? 'bold' : 'normal', color: t === transport ? '#fff' : '#aaa' }}>
                  <span>{specs[t].icon}</span>
                  <span>{(distance * specs[t].co2Factor).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {transport !== 'walking' && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '10px', color: '#00f5a0', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🌳 Offset Tip: Plant approx. <strong>{treesNeeded} tree(s)</strong> to offset this journey's emissions this year!</span>
            </div>
          )}
        </div>

        {/* Leaflet Map with Real Routes */}
        <div className="leaflet-container" style={{ height: "260px", borderRadius: '20px', marginBottom: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <MapContainer center={origin} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapViewHandler origin={origin} destination={destination} routeCoords={routeCoords} />
            {routeCoords.length > 0 ? (
              <Polyline positions={routeCoords} pathOptions={{ color: "#3b82f6", weight: 5, className: "animated-line" }} />
            ) : (
              <Polyline positions={[origin, destination]} pathOptions={{ color: "#3b82f6", weight: 3, dashArray: '8, 8' }} />
            )}
            <Marker position={origin} />
            <Marker position={destination} />
          </MapContainer>
        </div>

        {/* Local Places & Hotel Finders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
          <button className="plan-btn" style={{ fontSize: '10px', padding: '10px', marginTop: 0 }} onClick={() => openSearch("hotels")} aria-label="Search stays and hotels nearby destination">🏨 Stays</button>
          <button className="plan-btn" style={{ fontSize: '10px', padding: '10px', marginTop: 0, background: 'linear-gradient(90deg, #00f5a0, #06b6d4)' }} onClick={() => openSearch("restaurants")} aria-label="Search restaurants and food spots nearby destination">🍔 Food Spots</button>
          <button className="plan-btn" style={{ fontSize: '10px', padding: '10px', marginTop: 0 }} onClick={() => openSearch("tourist attractions")} aria-label="Search tourist attractions and spots nearby destination">🎡 Attractions</button>
        </div>

        <button className="plan-btn" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', marginTop: '5px' }} onClick={() => navigate("/")} aria-label="Go back and edit trip details">Modify Trip</button>

      </div>

      <style>{`
        @keyframes moveIcon {
          0% { transform: translateX(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}