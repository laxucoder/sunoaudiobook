const User = require("./User");
const Audio = require("./Audio");
const Purchase = require("./Purchase");
const Playlist = require("./Playlist");
const SystemSetting = require("./SystemSetting");

User.hasMany(Purchase, { foreignKey: "userId" });
Purchase.belongsTo(User, { foreignKey: "userId" });

Audio.hasMany(Purchase, { foreignKey: "audioId" });
Purchase.belongsTo(Audio, { foreignKey: "audioId" });
``;

Playlist.hasMany(Audio, { foreignKey: "playlistId", as: "episodes" });
Audio.belongsTo(Playlist, { foreignKey: "playlistId" });

Playlist.hasMany(Purchase, { foreignKey: "playlistId" });
Purchase.belongsTo(Playlist, { foreignKey: "playlistId" });

module.exports = { User, Audio, Purchase, Playlist, SystemSetting };
