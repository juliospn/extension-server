<h1 align="center">Express Extension Server - README</h1>
This project contains an Express.js server file that provides various endpoints for retrieving funding rate and volume data from different cryptocurrency exchanges. It also includes code for calculating the global funding rate and saving the funding rate data to a CSV file.

Getting Started
To get started with this project, follow the steps below:

Clone the repository or download the project files.

Install the dependencies by running the following command in the project directory:

shell
Copy code
npm install
Run the server using the following command:

shell
Copy code
node server.js
The server will start running on the default port 3000. You can access the endpoints using a tool like cURL or Postman.

API Endpoints
The server provides the following endpoints:

GET /funding-rate
Returns the funding rate for each exchange as a JSON object.

GET /global-funding-rate
Calculates and returns the global funding rate as a JSON object.

GET /volume
Returns the volume data for each exchange as a JSON object.

GET /funding-rate-data-json
Returns the funding rate data stored in the CSV file as a JSON array.

CSV Data
The server saves the funding rate data to a CSV file named funding-rate-data.csv. The data is saved with the following columns:

Timestamp: The timestamp of the funding rate data entry.
Global Funding Rate: The calculated global funding rate at the given timestamp.
The server automatically appends new funding rate data to the CSV file every 30 minutes.

Dependencies
The project uses the following dependencies:

express: A fast and minimalist web framework for Node.js.
path: A module providing utilities for working with file and directory paths.
https: A module for making HTTP requests.
csv-writer: A module for writing CSV files.
csv-parser: A module for parsing CSV files.
fs: A module for interacting with the file system.
moment: A lightweight JavaScript date library for parsing, manipulating, and formatting dates.
Notes
The server uses the Access-Control-Allow-Origin header to allow cross-origin requests from any origin (*).
The port for the server is set to either the value of the PORT environment variable or 3000 if the environment variable is not set.
Feel free to explore the code and modify it according to your needs. If you have any questions or run into any issues, please let me know.
