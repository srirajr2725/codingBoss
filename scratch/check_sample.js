async function check(url) {
  try {
    const res = await fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    if (!res.ok) {
      console.log(`URL: ${url} failed with status: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`URL: ${url} -> COUNT: ${data.length}`);
    if (data.length > 0) {
      console.log("FIRST QUESTION SAMPLE:", JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error(`URL: ${url} failed:`, err.message);
  }
}

async function run() {
  await check('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/sample/?language=quantitative');
  await check('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/sample/?language=quantitative');
}

run();
