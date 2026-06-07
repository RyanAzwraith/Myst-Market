import { useEffect, useState } from "react";
import { api } from "./api/api";
import { logger, AppError, AppValidationError } from "./core";

logger.info("Log working");

const error = new AppError({ details: "error working" });
logger.info(error.toString());

function App() {
	const [message, setMessage] = useState("");

	useEffect(() => {
		api
			.getHealth()
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
