const https = require('https');

https.get('https://api.tenor.com/v1/gifs?ids=14807869&key=LIVDSRZULELA', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
