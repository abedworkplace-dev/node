const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const app = express()
require("dotenv").config()
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY
const multer = require("multer")


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"))





const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})

const upload = multer({ storage })


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

db.getConnection()
    .then(connection => {
        console.log("Connexion à la base de données réussie !");
        connection.release();
    })
    .catch(err => {
        console.error("Erreur de connexion :", err.message);
    });


const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});




app.get("/", (req, res) => {
    /*const sql = "SELECT * FROM admin";
    db.query(sql)
        .then(([rows]) => {
            res.send(rows);
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });*/
    res.send("ecoute")
});


app.post("/newsletters", (req, res) => {
    const { email, subscribed_at } = req.body
    const sql = "SELECT * FROM newsletters where email=?"

    db.query(sql, [email])
        .then(([rows]) => {
            if (rows.length > 0) {
                res.send("existant")
            } else {
                const sql1 = "INSERT INTO newsletters (email,subscribed_at) VALUES (?,?)"
                db.query(sql1, [email, subscribed_at])
                    .then(([rows]) => {
                        res.send("Vous etes abonnés à la newsletters")
                    }).catch((err) => {
                        console.error("Erreur SQL :", err);
                        res.status(500).send("Erreur serveur");
                    })
            }
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});



app.post("/insert-articles", (req, res) => {
    const data = req.body

    console.log(data)
});

app.post("/upload-image", upload.single("image"), (req, res) => {
    console.log("REQ FILE:", req.file)

    if (!req.file) {
        return res.status(400).json({ message: "Aucune image reçue" })
    }

    res.json({ ok: true })
})