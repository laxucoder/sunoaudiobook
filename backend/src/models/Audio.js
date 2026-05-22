const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Audio = sequelize.define(
  "Audio",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: DataTypes.STRING,
    thumbnailUrl: DataTypes.STRING,

    storagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER, // Bytes
      allowNull: false,
    },
    bitrate: {
      type: DataTypes.INTEGER,
      defaultValue: 128,
    },


    duration: { type: DataTypes.FLOAT, defaultValue: 0 }, // In seconds
    category: { type: DataTypes.STRING, defaultValue: "General" }, // Genre

    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    price: {
      type: DataTypes.INTEGER, // Paise
      defaultValue: 0,
    },
    playlistId: { type: DataTypes.UUID, allowNull: true }, // Link to Parent
    episodeNumber: { type: DataTypes.INTEGER, defaultValue: 1 }, // Order
  },
  {
    timestamps: true,
  }
);

module.exports = Audio;
