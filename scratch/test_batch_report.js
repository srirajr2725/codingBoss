async function run() {
  try {
    const url = 'https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/batch-performance-report/';
    const res = await fetch(url, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log(`URL: ${url} -> STATUS: ${res.status}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log("SUCCESS! Top performers count:", data.top_performers?.length);
    } else {
      console.log("Error response:", await res.text());
    }
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

run();
