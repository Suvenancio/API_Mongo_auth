const express = require('express');
const bodyParser = require('body-parser');
const port =1500;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false}));
 
require('./controllers/authController')(app);
require('./controllers/projectController')(app);

app.listen(port,() => console.log(`Servidor rodando na porta ${port}`));

module.exports = app => app.use