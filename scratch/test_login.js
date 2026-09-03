async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ email: "", password: "" })
    });
    const text = await res.text();
    console.log(`URL: ${url} -> STATUS: ${res.status}, RESPONSE:`, text);
  } catch (err) {
    console.error(`ERROR for ${url}:`, err.message);
  }
}

async function run() {
  console.log("Checking base domain login endpoint:");
  await checkUrl('https://untrumpeted-sallie-shallowly.ngrok-free.dev/quiz/users/login/');
  console.log("\nChecking incorrect compiler subpath login endpoint:");
  await checkUrl('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/quiz/users/login/');
}

run();
