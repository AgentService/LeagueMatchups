// utils/fileOperations.js
import fs from "fs";

const readJsonFile = (filePath) => {
	console.log("filePath:", filePath);
	const rawData = fs.readFileSync(filePath);
	return JSON.parse(rawData);
};


const writeJsonFile = (filePath, data) => {
	const jsonData = JSON.stringify(data, null, 2);
	fs.writeFileSync(filePath, jsonData);
};

// ... other file operation functions ...

export { readJsonFile, writeJsonFile };
