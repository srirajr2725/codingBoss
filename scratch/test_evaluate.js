async function testPayload(type, subtype) {
  const payload = {
    user_id: 4823,
    type: type,
    subtype: subtype,
    language: "General",
    hints_used: 0,
    answers: {},
    timings: {}
  };
  try {
    const res = await fetch('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/evaluate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log(`TESTING type: "${type}", subtype: "${subtype}" -> STATUS: ${res.status}, RESPONSE:`, text);
  } catch (err) {
    console.error(`ERROR for type: "${type}", subtype: "${subtype}":`, err.message);
  }
}

async function run() {
  await testPayload("Aptitude", "Quantitative");
  await testPayload("Aptitude", "quantitative");
  await testPayload("Aptitude", "Logical");
  await testPayload("Aptitude", "Verbal");
}

run();
