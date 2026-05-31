import { useEffect, useState } from "react";
import { api } from "../api/api";


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