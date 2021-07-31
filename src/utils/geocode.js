const request = require("request");

const geocode = ({ latitude, longitude }, callback) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.API_KEY}&limit=1&language=en`;
  request({ url, json: true }, (err, response) => {
    callback(response.body.features[0].place_name_en);
  });
};

module.exports = geocode;
