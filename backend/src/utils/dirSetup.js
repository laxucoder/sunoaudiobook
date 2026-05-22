const fs = require("fs");

const setupDirectories = () => {
  const dirs = ["uploads", "uploads/audio", "uploads/images"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

module.exports = setupDirectories;
