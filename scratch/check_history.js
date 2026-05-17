async function run() {
  try {
    const res = await fetch('https://api.codingboss.in/compiler/mcq-marks/user/4823/', {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!res.ok) {
      console.log(`Failed with status: ${res.status}`);
      return;
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.results || []);
    console.log(`HISTORY COUNT: ${list.length}`);
    if (list.length > 0) {
      console.log("FIRST HISTORY ITEM:", JSON.stringify(list[0], null, 2));
    }
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

run();
