const Configuration = require('openai');
const OpenAIApi = require('openai');

//load environment variable
require('dotenv').config();

// Set Openai api kEY
const configuration = new Configuration({
    apikey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// define our node scraping libraries and set it as require
const axios = require('axios');
const cheerio = require('cheerio');

//Facebook profile URL
const profileUrl = 'https://www.facebook.com/martins.tabah';

//ScraperAPI URL
const socialProxyApiUrl = `https://thesocialproxy.com/wp-json/tsp/facebook/v1/posts/node?consumer_key=ck_5d08e0a7c419af9d7a90c76d1019559b53d9815a&consumer_secret=cs_9636ac43e09a78a4e8ab06181d061836ded1af39&node_id=UzpfSTQ6MTAxMTUxODY0ODg0ODIxNDE=&url=${encodeURIComponent(profileUrl)}`

// Scrape the Facebook profile
async function scrapeFacebookProfile() {
    try {
        // Make a request to the Social Proxy Scraper API
        const { data } = await axios.get(socialProxyApiUrl);

        //Load the HTML using cheerio
        const $ = cheerio.load(data);

        //Extract the profile name 
        // const profileName = $('title').text();
        // console.log('Profile Name', profileName);

        //Extract text text 
        const texts = $('div._5pbx').map((i, element) => $(element).text()).get();
        console.log('Texts:', texts);

        //Extract images from the profile
        const images = $('img').map((i, element) => $(element).attr('src')).get();
        console.log('Images:', images);

    } catch (error){
        console.log('Error scraping profile:', error.message);
    }
}
scrapeFacebookProfile(); 

// Function to retrieve location data
async function fetchLocations(){
    try{
        const response = await axios.get(`${socialProxyApiUrl}`);
        console.log('Locations fetched:', response.data);
        return response.data; // This would return an array of locations
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
}
fetchLocations();

// Function to store location data
async function storeLocation(locationData) {
    try {
        const response = await axios.post(`${socialProxyApiUrl}`, locationData);
        console.log('Location stored:', response.data);
    } catch (error) {
        console.error('Error storing location:', error)
    }
}
storeLocation();


// Function to extract locations
async function extractLocations(text) {
  const prompt = `Identify all location names (countries, cities, landmarks) in the following text: ${text}`;
  
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",  // or 'gpt-3.5-turbo'
      messages: [
        { role: "system", content: "You are a helpful assistant that extracts location names." },
        { role: "user", content: prompt },
      ],
    });
    
    // Extract the result from the response
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error extracting locations:", error);
  }
}

// Example text caption
const text = "This in-person event will be held at NTA Road, Port Harcourt, Nigeria.";
extractLocations(text).then(locations => {
  console.log(locations);
});

// Uploading image using the Geolocate-image endpoint
async function detectLandmarks(imagePath) {
  // Performs landmark detection on the image file
  const [result] = await client.landmarkDetection(imagePath);
  const landmarks = result.landmarkAnnotations;

  if (landmarks.length === 0) {
    return "No landmarks found.";
  }

  const locations = landmarks.map(landmark => ({
    description: landmark.description,
    score: landmark.score, // Confidence score
    locations: landmark.locations.map(location => ({
      latitude: location.latLng.latitude,
      longitude: location.latLng.longitude
    }))
  }));

  return locations;
}

// Example usage
(async () => {
  const imageUpload = 'C:\ProjectsXYZ\facebook_profile_location_tracker\image\Dule-Martins.jpg'; //Upload image from local devices 
  const imagePath = `https://thesocialproxy.com/wp-json/tsp/geolocate/v1/image?consumer_key={CONSUMER_KEY}&consumer_secret={CONSUMER_SECRET}=&url=${encodeURIComponent(imageUpload)}`; // Replace with the path to your image
  const landmarks = await detectLandmarks(imagePath);
  console.log(landmarks);
})();

