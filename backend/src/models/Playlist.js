const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Playlist = sequelize.define(
  "Playlist",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    artist: DataTypes.STRING,
    description: DataTypes.TEXT,
    thumbnailUrl: DataTypes.STRING,
    playCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Metadata
    category: { type: DataTypes.STRING, defaultValue: "General" },
    isFree: { type: DataTypes.BOOLEAN, defaultValue: false },
    price: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

module.exports = Playlist;
