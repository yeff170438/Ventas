var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

// Importar rutas
var loginRouter = require('./routes/login');
var productoRouter = require('./routes/producto');
var menuRouter = require('./routes/menu');
var usuariosRouter = require('./routes/usuarios');
var clientesRouter = require('./routes/clientes');
var reporteVentaRouter = require('./routes/reporte');
const perfilRouter = require('./routes/perfil');
var simpleRouter = require('./routes/simple');
const salirRouter = require('./routes/salir');
const adminRoutes = require('./routes/admin');


var app = express();

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', loginRouter);
app.use('/producto', productoRouter);
app.use('/usuarios', usuariosRouter);
app.use('/clientes', clientesRouter);
app.use('/perfil', perfilRouter);
app.use('/menu', menuRouter);
app.use('/reporte', reporteVentaRouter);
app.use('/simple', simpleRouter); // ⬅️ Habilitamos la nueva ruta /simple
app.use('/salir', salirRouter);
app.use('/img', express.static('img'));
app.use('/admin', adminRoutes);


app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
