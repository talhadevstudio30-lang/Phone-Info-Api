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
    
     ${users.map((user) => `<h1>${user.first_name}</h1>` ).join("")}
    
  `;
  res.send(html);
})

app.listen(PORT, () => console.log(`Actually the server is runing on ${PORT}`))