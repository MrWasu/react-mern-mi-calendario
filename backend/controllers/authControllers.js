const { response } = require('express')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario'); // apuntes junto a lo demas

const { generarJWT } = require('../helpers/jwt');


/* router.post('/register', (req, res) => {
    
    res.json( {
     ok: true,
     msg: 'registro'
    })
 })   */


const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {

        let usuario = await Usuario.findOne({ email })

        if (usuario) { // apuntes de que hace esto junto a la linea de arriba
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }

        usuario = new Usuario(req.body) // apuntes jutno a lo demas

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt); // apuntes que es salt?

        await usuario.save(); // se guardaa en la base de datos

        // Se crea el JWT
        const token = await generarJWT(usuario.id, usuario.name);

        res.status(201).json({
            ok: true,
            msg: 'registro',
            uid: usuario.id,
            name: usuario.name,
            token
        })

    } catch (error) {

        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'fallo'
        });
    }
}
/* if (name.length < 5)
    return res.status(400).json({ // apuntes obligatorio usar return para que no se envien los dos
        ok: false,
        msg: 'nombre incorrecto'
    }) */




const loginUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {
        // confirmar usuario 
        const usuario = await Usuario.findOne({ email })

        if (!usuario) { // apuntes de que hace esto junto a la linea de arriba
            return res.status(400).json({
                ok: false,
                msg: 'usuario/contraseña incorrectos'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, usuario.password); // apuntes de bcrypt

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'usuario/contraseña incorrectos'
            });
        }

        // Generar nuestro JWT
        const token = await generarJWT(usuario.id, usuario.name);

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            msg: 'login correcto',
            token
        })
    } catch (error) {

        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'fallo'
        });
    }
}
/*  const errors = validationResult ( req ) repetido, por eso se crea un custom middleware
 if ( !errors.isEmpty() ) {
     return res.status(400).json({
         ok: false,
         errors: errors.mapped() 
     })
 }
*/

const revalidarToken = async (req, res = response) => {
   
    const { uid, name } = req;

    // Generar JWT
    const token = await generarJWT( uid, name );

    res.json({
        ok: true,
        token
    })
}


module.exports = { // apunte exports en plural
    crearUsuario,
    loginUsuario,
    revalidarToken,
}