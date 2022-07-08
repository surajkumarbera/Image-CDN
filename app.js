const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
var cors = require("cors");

const fs = require("fs");
const path = require("path");

MONGO_URL =
	"mongodb+srv://skb:5009@medix.qjfww.mongodb.net/?retryWrites=true&w=majority";
const port = process.env.PORT || 80;
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
	MONGO_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	(err) => {
		console.log("connected");
	}
);

const imageSchema = new mongoose.Schema({
	img: {
		data: Buffer,
		contentType: String,
	},
});
const imageModel = new mongoose.model("Image", imageSchema);

app.get("/", (req, res) => {
	res.send(`
        <h1 align="center">Welcome To Image CDN For Medi-X</h1>
    `);
});

app.get("/api/image/*", (req, res) => {
	let image_id = req.url.substring(11);

	imageModel
		.findOne({
			_id: image_id,
		})
		.exec((err, data) => {
			if (err) {
				res.send(err);
			} else {
				res.type(data.img.contentType);
				res.send(data.img.data);
			}
		});
});

app.post("/api/image", upload.array("img"), (req, res) => {
	if (
		/*req.rawHeaders[3] == "https://localhost:44304/" &&*/
		true
	) {
		if (req.files[0].originalname) {
			const obj = {
				img: {
					data: fs.readFileSync(
						path.join(__dirname, "uploads", req.files[0].filename)
					),
					contentType: req.files[0].mimetype,
				},
			};

			const newImage = new imageModel(obj);
			newImage.save((err, room) => {
				if (err) {
					res.send(err);
				} else {
					res.status(200).send(room._id);
				}
			});

			fs.unlinkSync(path.join(__dirname, "uploads", req.files[0].filename));
		} else {
			res.status(400).send("Bad Request");
		}
	} else {
		res.status(401).send("Unauthorized");
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port http://127.0.0.1:${port}`);
});
