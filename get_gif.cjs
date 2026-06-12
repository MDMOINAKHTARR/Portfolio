const https = require('https');

https.get('https://api.tenor.com/v1/gifs?ids=14807869&key=LIVDSRZULELA', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    if(json.results && json.results[0] && json.results[0].media[0].gif.url) {
      console.log(json.results[0].media[0].gif.url);
    } else {
      console.log("Not found or invalid");
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
