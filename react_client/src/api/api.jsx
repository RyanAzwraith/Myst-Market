
const API_URL = import.meta.env.VITE_API_URL;

export async function getHello() {
    const response = await fetch(`${API_URL}/`);

    if (!response.ok) {
        throw new Error("Failed to fetch API");
    }

    return response.json();
}