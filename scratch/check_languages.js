
async function check() {
  try {
    const res = await fetch('https://unlanded-isela-unmunificently.ngrok-free.dev/compiler/get-category/');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

check();
