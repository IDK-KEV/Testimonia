const winston= require("winston");
const mysqlTransport= require("winston-mysql");
const pool= require("./app");
const { info } = require("console");
const { format } = require("path");



const logingLogger= winston.createLogger({
    transports:[
        new winston.transports.File({
            filename:"Loging.log",
            level:"info",
            format: winston.format.combine(winston.format.timestamp(),winston.format.json())

        }),
        new winston.transports.File({
            filename:"error.log",
            level:"error",
            timestamp:winston.format.timestamp,
            format: winston.format.combine(winston.format.timestamp(),winston.format.json())

        })
    ]
})




module.exports =logingLogger;