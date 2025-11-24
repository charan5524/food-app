import React, { useState, useEffect, useRef } from "react";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaRoute,
} from "react-icons/fa";
import { deliveryService } from "../../services/api";
import "./DeliveryTracking.css";

const DeliveryTracking = ({ orderId, orderStatus }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routeLineRef = useRef(null);
  const intervalRef = useRef(null);

  // Status labels
  const statusLabels = {
    searching: "Searching for driver",
    assigned: "Driver assigned",
    arriving_pickup: "Driver coming to restaurant",
    reached_pickup: "Driver reached restaurant",
    picked_up: "Order picked up",
    enroute: "On the way to you",
    arriving: "Arriving at your location",
    delivered: "Delivered",
  };

  // Status icons
  const statusIcons = {
    searching: <FaSpinner className="spinning" />,
    assigned: <FaMotorcycle />,
    arriving_pickup: <FaRoute />,
    reached_pickup: <FaMapMarkerAlt />,
    picked_up: <FaCheckCircle />,
    enroute: <FaRoute />,
    arriving: <FaMapMarkerAlt />,
    delivered: <FaCheckCircle />,
  };

  // Initialize delivery tracking
  useEffect(() => {
    if (orderId) {
      initializeDelivery();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  const initializeDelivery = async () => {
    try {
      setLoading(true);
      console.log("🚚 Initializing delivery tracking for order:", orderId);

      // Check if delivery already exists
      const trackingResponse = await deliveryService.getTracking(orderId);
      console.log("📦 Tracking response:", trackingResponse);

      if (trackingResponse.success && trackingResponse.delivery) {
        console.log("✅ Delivery found, starting tracking");
        setDelivery(trackingResponse.delivery);
        startTracking(trackingResponse.delivery);
      } else {
        // Auto-assign driver for ANY order with address (not just specific statuses)
        // This ensures tracking always works
        console.log("🔍 No delivery found, assigning driver...");
        try {
          const assignResponse = await deliveryService.assignDriver(orderId);
          console.log("👤 Driver assignment response:", assignResponse);
          if (assignResponse.success && assignResponse.delivery) {
            console.log("✅ Driver assigned successfully");
            setDelivery(assignResponse.delivery);
            startTracking(assignResponse.delivery);
          } else {
            console.warn("⚠️ Driver assignment returned but no delivery data");
            setLoading(false);
          }
        } catch (assignError) {
          console.error("❌ Error assigning driver:", assignError);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("❌ Error initializing delivery:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const startTracking = deliveryData => {
    // Update status every 3 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await deliveryService.updateStatus(orderId);
        if (response.success && response.delivery) {
          setDelivery(response.delivery);

          // Update map if loaded
          if (mapInstanceRef.current && response.delivery.currentLocation) {
            updateMapMarker(response.delivery);
          }

          // Stop tracking if delivered
          if (response.delivery.status === "delivered") {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }
      } catch (error) {
        console.error("Error updating delivery status:", error);
      }
    }, 3000);
  };

  // Load Google Maps
  useEffect(() => {
    if (!delivery || !delivery.currentLocation) return;

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not found. Map will not be displayed.");
      return;
    }

    // Check if script already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (routeLineRef.current) {
        routeLineRef.current.setMap(null);
      }
    };
  }, [delivery, mapLoaded]);

  // Create custom driver icon (person on bike/motorcycle)
  const createDriverIcon = () => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#667eea",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      anchor: new window.google.maps.Point(0, 0),
    };
  };

  // Create a custom SVG icon for driver (person on bike/motorcycle)
  const createPersonIcon = () => {
    // Create a custom icon using a circle with a person emoji or SVG path
    // Using a more visible icon - a circle with a person symbol
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: "#667eea",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 4,
      anchor: new window.google.maps.Point(0, 0),
    };
  };

  // Create a custom driver icon with emoji
  const createDriverIconSVG = () => {
    // Create SVG icon with person/motorcycle emoji
    const svg = `
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="22" fill="#667eea" stroke="#ffffff" stroke-width="3"/>
        <text x="25" y="35" font-size="28" text-anchor="middle">🛵</text>
      </svg>
    `;
    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(50, 50),
      anchor: new window.google.maps.Point(25, 25),
    };
  };

  // Animate marker smoothly from one point to another
  const animateMarker = (marker, startPos, endPos, duration = 2000) => {
    const startTime = Date.now();
    const startLat = startPos.lat;
    const startLng = startPos.lng;
    const latDiff = endPos.lat - startLat;
    const lngDiff = endPos.lng - startLng;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutQuad =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      const currentLat = startLat + latDiff * easeInOutQuad;
      const currentLng = startLng + lngDiff * easeInOutQuad;

      marker.setPosition({ lat: currentLat, lng: currentLng });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: currentLat, lng: currentLng });
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const initializeMap = () => {
    if (!delivery || !delivery.currentLocation || !mapRef.current) return;

    const { currentLocation, restaurantLocation, customerLocation } = delivery;

    // Create map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: currentLocation,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Add restaurant marker
    if (restaurantLocation) {
      new window.google.maps.Marker({
        position: restaurantLocation,
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        },
        label: {
          text: "🏪",
          fontSize: "20px",
        },
        title: "Restaurant",
        zIndex: 1000,
      });
    }

    // Add customer marker
    if (customerLocation) {
      new window.google.maps.Marker({
        position: customerLocation,
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new window.google.maps.Size(32, 32),
        },
        label: {
          text: "🏠",
          fontSize: "20px",
        },
        title: "Your Location",
        zIndex: 1000,
      });
    }

    // Create route polyline from restaurant to customer
    if (restaurantLocation && customerLocation) {
      routeLineRef.current = new window.google.maps.Polyline({
        path: [restaurantLocation, customerLocation],
        geodesic: true,
        strokeColor: "#667eea",
        strokeOpacity: 0.5,
        strokeWeight: 5,
        map: map,
        zIndex: 1,
        icons: [
          {
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 4,
              strokeColor: "#667eea",
              fillColor: "#667eea",
              fillOpacity: 1,
            },
            offset: "50%",
            repeat: "100px",
          },
        ],
      });
    }

    // Add driver marker with custom icon (person on motorcycle)
    if (currentLocation) {
      markerRef.current = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        icon: createDriverIconSVG(),
        title: "Driver",
        animation: window.google.maps.Animation.DROP,
        zIndex: 2000,
        optimized: false,
      });

      // Start smooth animation from restaurant to customer
      if (restaurantLocation && customerLocation) {
        // Determine current progress based on delivery status
        let startPos = restaurantLocation;
        let endPos = customerLocation;

        // If driver is already moving, calculate intermediate position
        if (delivery.status === "enroute" || delivery.status === "arriving") {
          // Use current location as starting point, move towards customer
          startPos = currentLocation;
          endPos = customerLocation;
        } else if (
          delivery.status === "arriving_pickup" ||
          delivery.status === "reached_pickup"
        ) {
          // Driver is going to restaurant
          startPos = currentLocation;
          endPos = restaurantLocation;
        } else if (delivery.status === "picked_up") {
          // Driver picked up, now going to customer
          startPos = restaurantLocation;
          endPos = customerLocation;
        }

        // Animate marker movement smoothly
        setTimeout(() => {
          if (markerRef.current && markerRef.current.setPosition) {
            animateMarker(markerRef.current, startPos, endPos, 4000);
          }
        }, 800);
      }
    }

    // Fit bounds to show all markers
    if (restaurantLocation && customerLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(restaurantLocation);
      bounds.extend(customerLocation);
      bounds.extend(currentLocation);
      map.fitBounds(bounds, { padding: 50 });
    }
  };

  const updateMapMarker = deliveryData => {
    if (!markerRef.current || !deliveryData.currentLocation) return;

    const newPosition = {
      lat: deliveryData.currentLocation.lat,
      lng: deliveryData.currentLocation.lng,
    };

    // Get current position
    const currentPosition = markerRef.current.getPosition();
    if (!currentPosition) {
      markerRef.current.setPosition(newPosition);
      return;
    }

    const currentPos = {
      lat: currentPosition.lat(),
      lng: currentPosition.lng(),
    };

    // Smoothly animate marker to new position
    animateMarker(markerRef.current, currentPos, newPosition, 2500);
  };

  const getStatusIndex = status => {
    const statuses = [
      "searching",
      "assigned",
      "arriving_pickup",
      "reached_pickup",
      "picked_up",
      "enroute",
      "arriving",
      "delivered",
    ];
    return statuses.indexOf(status);
  };

  const getEstimatedTime = () => {
    if (!delivery || !delivery.estimatedArrival) return null;
    const now = new Date();
    const arrival = new Date(delivery.estimatedArrival);
    const diff = Math.max(0, Math.floor((arrival - now) / 1000 / 60));
    return diff;
  };

  const getDeliveryProgress = () => {
    if (!delivery) return 0;
    const statuses = [
      "searching",
      "assigned",
      "arriving_pickup",
      "reached_pickup",
      "picked_up",
      "enroute",
      "arriving",
      "delivered",
    ];
    const currentIndex = statuses.indexOf(delivery.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  if (loading) {
    return (
      <div className="delivery-tracking loading">
        <div className="spinner"></div>
        <p>Initializing delivery tracking...</p>
      </div>
    );
  }

  if (!delivery && !loading) {
    return (
      <div className="delivery-tracking no-delivery">
        <div className="spinner"></div>
        <p>Initializing delivery tracking...</p>
        <button onClick={initializeDelivery} className="retry-button">
          <FaMotorcycle /> Start Tracking
        </button>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(delivery.status);
  const estimatedMinutes = getEstimatedTime();
  const progress = getDeliveryProgress();

  return (
    <div
      className={`delivery-tracking ${
        delivery.status === "delivered" ? "delivered" : ""
      }`}
    >
      <div className="delivery-header">
        <div>
          <h3>
            <FaMotorcycle /> Live Delivery Tracking
          </h3>
          {delivery.status !== "delivered" && estimatedMinutes !== null && (
            <p className="estimated-text">
              Estimated arrival in {estimatedMinutes} minutes
            </p>
          )}
          {delivery.status === "delivered" && (
            <p className="delivered-text">
              <FaCheckCircle /> Order delivered successfully!
            </p>
          )}
        </div>
        {delivery.status !== "delivered" && estimatedMinutes !== null && (
          <div className="estimated-time">
            <FaClock /> {estimatedMinutes} min
          </div>
        )}
        {delivery.status === "delivered" && (
          <div className="estimated-time delivered-badge">
            <FaCheckCircle /> Delivered
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="delivery-progress-container">
        <div className="progress-label">
          <span>Delivery Progress</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
