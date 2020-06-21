const express = require('express')

const app = express();
app.use(express.urlencoded({extended: true}));
const port = process.env.PORT || 3030;

const routes = require('./api/routes');
routes(app);
app.listen(port, function() {
   console.log('Server started on port: ' + port);
});