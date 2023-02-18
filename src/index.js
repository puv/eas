const dotenv = require("dotenv");
const express = require("express");
const useragent = require('express-useragent');
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sassMiddleware = require('node-sass-middleware');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("trust proxy", true);

// app.use(flash());

app.use('/css',
    sassMiddleware({
        src: __dirname + '/public/scss', // Source directory of SCSS files
        dest: __dirname + '/public/css', // Destination directory of compiled CSS files
        debug: true, // Output debug info
        maxAge: 0, // Time to cache compiled CSS files
        outputStyle: 'compressed', // Output style of compiled CSS files
        force: true, // Force recompile of SCSS files
        response: false,
        sourceMap: true,
    }));
app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(useragent.express());

const indexRoute = require("./routes/index");
app.use("/", indexRoute);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});