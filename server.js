/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _Maliha Abdul Azeem_____________________ Student ID: __
147996201____________ Date: __07/11/2022_____________
*
*  Online (Cyclic) Link: https://real-jumpsuit-ray.cyclic.app/
*
********************************************************************************/
// CLOUD NAME : drxnka5sf
// API KEY: 244346439269562
// API SECRET: syD2XwsV1oKtcBK_itkKZxdhgoM 

var express = require("express")
var productService = require('./product-service')
var path = require("path")
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();
var app = express()
app.use('/public', express.static(path.join(__dirname, "public")));

cloudinary.config({
    cloud_name: 'drxnka5sf',
    api_key: '244346439269562',
    api_secret: 'syD2XwsV1oKtcBK_itkKZxdhgoM',
    secure: true
});

var HTTP_PORT = process.env.PORT || 8080

function onHttpstart() {
    console.log("Express http server listening on port: " + HTTP_PORT)
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
})

app.get("/products", (req, res) => {
    productService.getPublishedProducts()
        .then((data) => {
            res.json({ data })
        })

        .catch((err) => {
            res.json({ message: err })
        })
})

app.get("/products/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addProducts.html"));
})

app.post("/products/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processProduct(uploaded.url);
        });
    } else {
        processProduct("");
    }

    function processProduct(imageUrl) {
        req.body.featureImage = imageUrl;
        console.log(req.body)
        productService.addProduct(req.body).then(() => {
            res.redirect('/demos');
        })

    }

})

app.get('/products/:id', (req, res) => {
    productService.getproductById(req.params.id).then((data) => {
        res.json(data)
    })
    .catch((err) => {
        res.json({ message: err });
    })
})

app.get("/demos", (req, res) => {
    if (req.query.category) {
        productService.getPublishedProducts()
            .then((data) => {
                res.json({ data })
            })

            .catch((err) => {
                res.json({ message: err })
            })
    }

    else if (req.query.minDateStr) {
        productService.getProductsByMinDate(req.query.minDateStr)
            .then((data) => {
                res.json({ data })
            })

            .catch((err) => {
                res.json({ message: err })
            })
    }

    else {
        productService.getAllProducts()
            .then((data) => {
                res.json({ data })
            })

            .catch((err) => {
                res.json({ message: err })
            })
    }


})

app.get("/categories", (req, res) => {
    productService.getCategories()
        .then((data) => {
            res.json({ data })
        })
        .catch((err) => {
            res.json({ message: err })
        })
})

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/.html"))
})

console.log("web-322 app working on LocalHost: 8080")

productService.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on ${HTTP_PORT}`)
        })
    })

    .catch(() => {
        console.log("OOPS! Failed promises")
    })

