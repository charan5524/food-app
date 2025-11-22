// Free address autocomplete using OpenStreetMap Nominatim API
// No API key required!

export const searchAddress = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'FoodApp/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }

    const data = await response.json();
    return data.map((item) => ({
      display: item.display_name,
      address: item.address,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
};

export const parseAddressComponents = (address) => {
  if (!address) {
    return {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };
  }

  return {
    street: [
      address.road || '',
      address.house_number || '',
    ].filter(Boolean).join(' '),
    city: address.city || address.town || address.village || address.municipality || '',
    state: address.state || address.region || '',
    zipCode: address.postcode || '',
    country: address.country || '',
  };
};

