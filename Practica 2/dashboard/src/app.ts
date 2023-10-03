import express 		from 'express';
import path 		from 'path';
import cookieParser from 'cookie-parser';
import bodyParser   from 'body-parser';

const app = express();

// SETTINGS

//process.env.PORT es por si se sube a la nube, ya que acepta el puerto que le dan
app.set('port', process.env.PORT || 3000);

var engine = require('consolidate');
app.set('views', path.join(__dirname, 'public')); //LAS PAGINAS ESTAN EN VIEWS
app.set('view engine', 'ejs');                      //SON ARCHIVOS .EJS

//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));

//RUTAS
app.use('/' ,require('./routes/task.routes'));

//ARCHIVOS ESTATICOS
// El path.join(__dirname, 'public') abre el archivo index.html que se encuentra en la carpeta public
app.use(express.static(path.join(__dirname, 'public')))

//EMPEZANDO SERVIDOR
app.listen(app.get('port'), () =>{                  //ES PARA MOSTRAR UN MENSAJE CUANDO EL SERVIDOR SE CONECTA
    console.log(`Servidor en puerto ${app.get('port')}`);
}); 