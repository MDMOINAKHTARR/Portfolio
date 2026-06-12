async function check() {
  const urls = [
    "https://api.github.com/users/mohdmoinakhtar081",
    "https://github-contributions-api.deno.dev/mohdmoinakhtar081.json"
  ];
  for(const u of urls) {
     try {
       const res = await fetch(u);
       console.log(u, res.status);
       const text = await res.text();
       console.log(text.substring(0, 50));
     } catch(e) {
       console.log(u, e.message);
     }
  }
}
check();
