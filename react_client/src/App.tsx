import { useEffect, useState } from "react";
import { getHello } from "@/api/api";


function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
      getHello()
          .then((data) => {
              setMessage(data.message);
          })
          .catch((error) => {
              console.error(error);
          });
  }, []);

  return (
    <div>
      <h1>Myst Market</h1>
      
      <p>{message}</p>
    </div>
  );
}

export default App;