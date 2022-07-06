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
	name: String,
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
	let image_name = req.url.substring(11);

	imageModel
		.findOne({
			name: image_name,
		})
		.exec((erroe, data) => {
			res.type(data.img.contentType);
			res.send(data.img.data);
		});
});

app.post("/api/image", upload.array("img"), (req, res) => {
	if (
		/*req.rawHeaders[3] == "https://localhost:44304/" &&*/
		true
	) {
		if (req.files[0].originalname) {
			const obj = {
				name: req.body.Name,
				img: {
					data: fs.readFileSync(
						path.join(__dirname, "uploads", req.files[0].filename)
					),
					contentType: req.files[0].mimetype,
				},
			};
			console.log(obj.name);
			const newImage = new imageModel(obj);
			id = newImage.save(function (err) {
				if (err) return console.error(err);
			});

			fs.unlinkSync(path.join(__dirname, "uploads", req.files[0].filename));
			res.status(200).send("success");
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
