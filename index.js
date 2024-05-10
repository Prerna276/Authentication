const express = require('express');

const app = express();

require('dotenv').config();

require('./startup/routes')(app);

require('./controller/scheduledjobs');
// adding mongo service
require('./service/database.service')();

// initializing th port number to a variable from environment variables
const port = process.env.APP_PORT;

// running the app on the port
app.listen(port, () => {
    console.log((`Listening on port ${port} . . .`));
});
