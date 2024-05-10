const express = require('express');
const authenicate = require('../routes/authenticate.route');
// routers
module.exports = (app) => {

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));


    app.get('', (req, res) => {
        res.send('Welcome To Authentication');
    });

    //app.use('/', leadpush);
    app.use('/authenicate', authenicate);

};
