const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      defaultValue: "USER",
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    profilePic: { type: DataTypes.STRING, allowNull: true },
    otpCode: DataTypes.STRING,
    otpExpires: DataTypes.DATE,


    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    razorpaySubscriptionId: { type: DataTypes.STRING, allowNull: true },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subscriptionEndDate: DataTypes.DATE,
    isAutoRenewal: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    timestamps: true,
  }
);

module.exports = User;
