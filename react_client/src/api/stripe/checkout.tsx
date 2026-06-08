async function checkout() {
  const res = await fetch("http://localhost:8000/stripe/checkout", {
    method: "POST",
  });

  const data = await res.json();

  window.location.href = data.url;
}

export default checkout