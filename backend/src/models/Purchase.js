const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Purchase = sequelize.define("Purchase", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

  playlistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Playlists",
      key: "id",
    },
  },

  audioId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "Audios",
      key: "id",
    },
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "SUCCESS",
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "RENTAL", // Changed from LIFETIME
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true, // Null means lifetime (if you ever need it back)
  },
});

module.exports = Purchase;
