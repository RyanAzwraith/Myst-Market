import { useEffect, useState } from "react";
import { api } from "../api/api";
import { logger } from "../core/logging";

const x = 1;
logger.info("Log working?", x)

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getHealth()
      .then((data) => setMessage(data.message))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Myst Market</h1>

      <p>{message}</p>
    </div>
  );
}

export default App;