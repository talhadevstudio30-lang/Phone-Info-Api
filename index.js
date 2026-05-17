const express = require("express");
const cors = require("cors");
const users = require("./MOCK_DATA.json")

const app = express();
app.use(cors()); // <-- enable CORS for all routes
const PORT = 8000;

// actually here we will define our routes
app.get("/api/users", (req , res) => {
    return res.json(users);
} )

app.get("/users", (req , res) => {
  const html = `
    
     ${users.map((user) => `<h1>${user.model}</h1>` ).join("")}
    
  `;
  res.send(html);
})

app.get("/api/users/:brand", (req, res) => {
    const brandParam = decodeURIComponent(req.params.brand || "").toLowerCase().trim();
    const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const brandNorm = normalize(brandParam);

    const filteredUsers = users.filter((user) => {
        if (!user.brand) return false;
        return normalize(user.brand).includes(brandNorm);
    });

    if (filteredUsers.length === 0) {
        return res.status(404).json({
            message: `No models found for brand "${req.params.brand}"`,
        });
    }

    return res.json({
        brand: req.params.brand,
        totalModels: filteredUsers.length,
        models: filteredUsers,
    });
});

app.listen(PORT, () => console.log(`Actually the server is runing on ${PORT}`))