const express = require('express');
require('dotenv').config;
const { default: mongooose } = require('mongoose');
const app = express();
const cors = require('cors');

//Middleware
app.use(express.json());
app.use(cors()); //Allow Fronted Integration
app.use(express.urlencoded({ extended: true }));

//Serve my Static HTML Files
app.use(express.static('public'));

//Database Connectivity
mongooose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexra')