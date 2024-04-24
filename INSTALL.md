# Requirements
Node v20.11.x

# Installation
For lab 5 and beyond, you will need to create a Mongo database: 
1. Go to https://www.mongodb.com/lp/cloud/atlas/try4 and create a Mongo database
2. Get your database's connection string (Overview -> Connect -> Drivers)
3. Create a `.env` file in the root of this repo and put `MONGODB=<connection string>/Lab5`, where `<connection string>` is the string from step 2 and `/Lab5` is appended to the end. Ex: `MONGODB=mongodb+srv://name:secret_string.mongodb.net/Lab5`

For lab 6 and beyond, you will need to get an API key for the BALLDONTLIE API:
1. Go to https://app.balldontlie.io/ and sign up for a free account
2. Copy your API key from the dashboard and in the `.env` file in the root of this repo, put `BALLDONTLIE_API_KEY=<api key>`, where `<api key>` is the API key you copied. Ex: `BALLDONTLIE_API_KEY=api_key`

For all labs except lab 1, you must run the following commands:
1. `npm i` in /Lab#
2. `npm start` in /Lab#

The lab will be running at http://localhost:3000
