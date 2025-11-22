# Google Places API Setup Guide

This guide will help you set up Google Places API for address autocomplete functionality in the checkout form.

## Steps to Get Google Places API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Food App")
   - Click "Create"

3. **Enable Google Places API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on "Places API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key that is generated

5. **Restrict API Key (Recommended for Production)**
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" from the list
   - Under "Application restrictions", you can restrict by:
     - HTTP referrers (for web apps)
     - IP addresses (for server-side)
   - Click "Save"

## Configure in Your Application

1. **Create/Update `.env` file in the `frontend` directory:**
   ```env
   REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

2. **Restart your development server:**
   ```bash
   npm start
   ```

## How It Works

- When users start typing in the address field, Google Places Autocomplete will show suggestions
- When a user selects an address, the form will automatically populate:
  - Full address
  - City
  - State
  - Zip Code

## Pricing

Google Places API has a free tier:
- **$200 free credit per month** (covers most small to medium applications)
- After free credit: $17 per 1,000 requests for Autocomplete

For more details, visit: https://developers.google.com/maps/billing-and-pricing/pricing

## Troubleshooting

1. **Autocomplete not working:**
   - Check that the API key is correctly set in `.env`
   - Verify that Places API is enabled in Google Cloud Console
   - Check browser console for any error messages
   - Ensure the API key restrictions allow your domain/IP

2. **"This API project is not authorized to use this API":**
   - Make sure Places API is enabled in your Google Cloud project
   - Check that billing is enabled (required even for free tier)

3. **Address fields not auto-filling:**
   - Check browser console for JavaScript errors
   - Verify the Google Maps script is loading correctly
   - Make sure you're selecting an address from the dropdown suggestions

## Alternative: Using Without API Key (Limited Functionality)

If you don't want to use Google Places API, you can remove the autocomplete functionality and users will need to manually enter all address fields.

