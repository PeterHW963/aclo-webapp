export const API_URL = import.meta.env.VITE_BACKEND_URL as string;

export const getAuthHeader = () => ({
	Authorization: `Bearer ${localStorage.getItem("userToken")}`,
});
