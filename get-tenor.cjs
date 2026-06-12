const https = require('https');

https.get('https://tenor.com/view/batman-bruce-wayne-animated-series-lightning-intro-gif-4157976', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/https:\/\/media[^\"]+\.gif/);
    console.log("GIF URL: ", match ? match[0] : "Not found");
  });
});
