async function run() {
  try {
    const url = 'https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/batch-performance-report/';
    const res = await fetch(url, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data = await res.json();
    console.log("Full response data:", JSON.stringify(data, null, 2).slice(0, 1000));
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

run();
