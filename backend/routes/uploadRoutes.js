const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage
const storage = multer.memoryStorage(); // we are telling multer to store the uploaded files directly in RAM as Buffer objs rather than saving them to a file system
const upload = multer({ storage }); // upload used as middleware to handle file uploads

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No File Uploaded" });
        }

        const BASE_FOLDER = "aclo/dev";
        const extraPath = (req.body.folder || "").trim();

        const targetFolder = extraPath
            ? `${BASE_FOLDER}/${extraPath}`
            : BASE_FOLDER;

        // helper function to handle stream upload to Cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: targetFolder },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                // use streamifier to convert file buffer to stream
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };
        // Call the streamUpload function
        const result = await streamUpload(req.file.buffer);

        // Respond with uploaded image URL
        res.json({ publicId: result.public_id, imageUrl: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ message: "publicId required" });
        }

        // safety to only allow deletes inside the specified folder
        if (!publicId.startsWith("aclo/dev/")) {
            return res.status(403).json({ message: "not allowed" });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            invalidate: true,
        });

        if (result.result !== "ok" && result.result !== "not found") {
            return res
                .status(500)
                .json({ message: "Failed to delete", cloudinary: result });
        }

        return res.json({ message: "Deleted", cloudinary: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
