var express = require('express');
var router = express.Router();
const multer = require("multer");
var path = require('path');
const fs = require('fs')
const { allProds, findProd, agregaProd, editProd, quitaProd } = require('../db/mongo.js')

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: './public/images/'
});

// Home Page
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Vista Productos
router.get('/productos', async function (req, res, next) {
  await allProds()
    .then((data) => {
      res.render('productos', { title: 'Express', prods: data });
    })
});

// Vista Agrega Prods
router.get('/agregaProd', function (req, res, next) {
  res.render('agregaProd', { title: 'Express' });
});

// Eliminar Prods
router.get('/delProd', function (req, res, next) {
  fs.unlinkSync(`./public/images/${req.query.img}.png`)

  quitaProd(req.query.id)
    .then((resp) => {
      console.log(resp)
      res.redirect('/productos')
    })
    .catch((err) => {
      console.log(err)
    })
});

// Editar Prods
router.get('/editProd', function (req, res, next) {
  findProd(req.query.id)
    .then((resp) => {
      res.render('editProd', { title: 'Express', prod: resp, id: req.query.id })
    })
    .catch((err) => {
      console.log(err)
    })
});

// Agregar Prods
router.post('/agregaProd', upload.single("prodImg"), function (req, res, next) {
  const tempPath = req.file.path;
  const targetPath = `./public/images/${req.body.alias}.png`

  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(tempPath, targetPath, async (err) => {
      if (err) {
        console.log(err)
        return handleError(err, res);
      }

      let producto = {
        nom: req.body.nomProd,
        precio: req.body.precioProd,
        descrip: req.body.descProd,
        aliasImg: req.body.alias,
      }

      await agregaProd(producto)
        .then((resp) => {
          console.log(resp)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          res.redirect('/')
        })
    });
  } else {
    fs.unlink(tempPath, err => {
      if (err) {
        console.log(err)
        return handleError(err, res);
      }

      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");
    });
  }
});

// Edita Producto
router.post('/editProd', upload.single("prodImg"), function (req, res, next) {
  let producto = {
    prodID: req.query.id,
    nom: req.body.nomProd,
    precio: req.body.precioProd,
    descrip: req.body.descProd,
    aliasImg: req.body.alias,
  }

  if (req.body.alias) {
    fs.unlinkSync(`./public/images/${req.query.orImg}.png`)

    const tempPath = req.file.path;
    const targetPath = `./public/images/${req.body.alias}.png`

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, async (err) => {
        if (err) {
          return handleError(err, res);
        }

        await editProd(producto)
          .then((resp) => {
            console.log(resp)
          })
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            res.redirect('/')
          })
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) {
          console.log(err)
          return handleError(err, res);
        }
        res.status(403).contentType("text/plain").end("Only .png files are allowed!");
      });
    }
  } else {
    async function ed() {
      producto.aliasImg = req.query.orImg
      await editProd(producto)
        .then(() => {
          console.log('Producto editado correctamente')
          res.redirect('/')
        })
        .catch((err) => {
          console.log(err)
        })
    }
    ed()
  }
});

module.exports = router;