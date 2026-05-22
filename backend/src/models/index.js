const User = require("./User");
const Audio = require("./Audio");
const Purchase = require("./Purchase");
const Playlist = require("./Playlist"); // Import New Model
const SystemSetting = require("./SystemSetting");

// User & Purchase
User.hasMany(Purchase, { foreignKey: "userId" });
Purchase.belongsTo(User, { foreignKey: "userId" });

// Audio & Purchase
Audio.hasMany(Purchase, { foreignKey: "audioId" });
Purchase.belongsTo(Audio, { foreignKey: "audioId" });
``

// Playlist Relationships ---
Playlist.hasMany(Audio, { foreignKey: "playlistId", as: "episodes" });
Audio.belongsTo(Playlist, { foreignKey: "playlistId" });

// Enable Purchases for full Playlists too Optional
Playlist.hasMany(Purchase, { foreignKey: "playlistId" });
Purchase.belongsTo(Playlist, { foreignKey: "playlistId" });

module.exports = { User, Audio, Purchase, Playlist, SystemSetting };
