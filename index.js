require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Lưu URL mapping tạm thời
let urls = {};
let idCounter = 1;

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const inputUrl = req.body.url || req.body.original_url;

  try {
    const parsedUrl = new URL(inputUrl);
    dns.lookup(parsedUrl.hostname, (error) => {
      if (error) return res.json({ error: "invalid url" });

      const shortUrl = idCounter++;
      urls[shortUrl] = inputUrl;

      res.json({ original_url: inputUrl, short_url: shortUrl });
    });
  } catch {
    res.json({ error: "invalid url" });
  }
});

// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urls[shortUrl];

  res.redirect(originalUrl);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
