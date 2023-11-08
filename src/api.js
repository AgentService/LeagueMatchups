import axios from "axios";

const instance = axios.create({
	baseURL: "http://localhost:3001", // Pointing to your Express server
	timeout: 5000,
});

export default instance;
