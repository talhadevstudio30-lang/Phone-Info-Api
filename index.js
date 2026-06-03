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

const parseNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalize = (value) => (value || "").toString().toLowerCase().trim();

const normalizeArray = (value) => {
  if (!value) return [];
  return value
    .toString()
    .split(",")
    .map((item) => item.toLowerCase().trim())
    .filter(Boolean);
};

const matchesCameraQuery = (queryValue, cameraInfo) => {
  if (!queryValue) return true;
  const query = queryValue.toString().toLowerCase().trim();
  if (query === "true" || query === "yes") return Boolean(cameraInfo);
  if (query === "false" || query === "no") return !cameraInfo;
  return JSON.stringify(cameraInfo || {}).toLowerCase().includes(query);
};

app.get("/api/users/search", (req, res) => {
  const {
    model,
    thickness,
    thickness_mm,
    height,
    height_mm,
    width,
    width_mm,
    battery_type,
    capacity_mAh,
    weight,
    weight_grams,
    weight_kg,
    status,
    display_type,
    release_year,
    colors,
    front_camera,
    rear_camera,
  } = req.query;

  const searchCriteria = {
    model: normalize(model),
    thickness: parseNumber(thickness || thickness_mm),
    height: parseNumber(height || height_mm),
    width: parseNumber(width || width_mm),
    batteryType: normalize(battery_type),
    capacity: parseNumber(capacity_mAh),
    weight: parseNumber(weight || weight_grams || weight_kg),
    status: normalize(status),
    displayType: normalize(display_type),
    releaseYear: parseNumber(release_year),
    colors: normalizeArray(colors),
    frontCamera: normalize(front_camera),
    rearCamera: normalize(rear_camera),
  };

  const filteredUsers = users.filter((user) => {
    if (searchCriteria.model && !normalize(user.model).includes(searchCriteria.model)) {
      return false;
    }

    if (searchCriteria.thickness !== null) {
      const userThickness = user.dimensions?.thickness_mm ?? user.dimensions?.thickness_cm ?? null;
      if (userThickness === null || Number(userThickness) !== searchCriteria.thickness) {
        return false;
      }
    }

    if (searchCriteria.height !== null) {
      const userHeight = user.dimensions?.height_mm ?? user.dimensions?.height_cm ?? null;
      if (userHeight === null || Number(userHeight) !== searchCriteria.height) {
        return false;
      }
    }

    if (searchCriteria.width !== null) {
      const userWidth = user.dimensions?.width_mm ?? user.dimensions?.width_cm ?? null;
      if (userWidth === null || Number(userWidth) !== searchCriteria.width) {
        return false;
      }
    }

    if (searchCriteria.batteryType && !normalize(user.battery?.type).includes(searchCriteria.batteryType)) {
      return false;
    }

    if (searchCriteria.capacity !== null) {
      if (user.battery?.capacity_mAh === undefined || Number(user.battery.capacity_mAh) !== searchCriteria.capacity) {
        return false;
      }
    }

    if (searchCriteria.weight !== null) {
      const matchedWeight =
        Number(user.weight?.grams) === searchCriteria.weight || Number(user.weight?.kg) === searchCriteria.weight;
      if (!matchedWeight) {
        return false;
      }
    }

    if (searchCriteria.status && !normalize(user.status).includes(searchCriteria.status)) {
      return false;
    }

    if (searchCriteria.displayType && !normalize(user.display?.type).includes(searchCriteria.displayType)) {
      return false;
    }

    if (searchCriteria.releaseYear !== null) {
      if (user.release_year === undefined || Number(user.release_year) !== searchCriteria.releaseYear) {
        return false;
      }
    }

    if (searchCriteria.colors.length > 0) {
      const userColors = (user.design?.colors || []).map((color) => normalize(color));
      const hasColor = searchCriteria.colors.every((color) => userColors.includes(color));
      if (!hasColor) {
        return false;
      }
    }

    if (!matchesCameraQuery(searchCriteria.frontCamera, user.camera?.front)) {
      return false;
    }

    if (!matchesCameraQuery(searchCriteria.rearCamera, user.camera?.rear)) {
      return false;
    }

    return true;
  });

  if (filteredUsers.length === 0) {
    return res.status(404).json({
      message: "No models found matching the advanced search criteria.",
      criteria: req.query,
    });
  }

  return res.json({
    totalMatches: filteredUsers.length,
    results: filteredUsers,
  });
});

app.get("/api/users/:model", (req, res) => {
    const modelParam = decodeURIComponent(req.params.model || "").toLowerCase().trim();
    const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const modelNorm = normalize(modelParam);

    const filteredUsers = users.filter((user) => {
        if (!user.model) return false;
        return normalize(user.model).includes(modelNorm);
    });

    if (filteredUsers.length === 0) { 
        return res.status(404).json({
            message: `No models found for model "${req.params.model}"`,
        });
    }

    return res.json({
        model: req.params.model,
        totalModels: filteredUsers.length,
        models: filteredUsers,
    });
});

app.listen(PORT, () => console.log(`Actually the server is runing on ${PORT}`))