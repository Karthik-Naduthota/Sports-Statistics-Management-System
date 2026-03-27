// models.js
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const dbPath = path.join(__dirname, 'instance', 'sports.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

// --- Models ---
const Parent = sequelize.define('Parent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  address: { type: DataTypes.STRING(200) },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'parent', timestamps: false });

const Coach = sequelize.define('Coach', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  specialization: { type: DataTypes.STRING(100) },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  bio: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'coach', timestamps: false });

const Sport = sequelize.define('Sport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  category: { type: DataTypes.STRING(50) },
  description: { type: DataTypes.TEXT },
  max_team_size: { type: DataTypes.INTEGER, defaultValue: 20 },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'sport', timestamps: false });

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  age_group: { type: DataTypes.STRING(50) },
  sport_id: { type: DataTypes.INTEGER, allowNull: true },
  coach_id: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'team', timestamps: false });

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  dob: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  gender: { type: DataTypes.STRING(10) },
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  team_id: { type: DataTypes.INTEGER, allowNull: true },
  enrollment_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  status: { type: DataTypes.STRING(20), defaultValue: 'active' },
}, { tableName: 'student', timestamps: false });

// --- Associations ---
Parent.hasMany(Student, { foreignKey: 'parent_id' });
Student.belongsTo(Parent, { foreignKey: 'parent_id' });

Coach.hasMany(Team, { foreignKey: 'coach_id' });
Team.belongsTo(Coach, { foreignKey: 'coach_id' });

Sport.hasMany(Team, { foreignKey: 'sport_id' });
Team.belongsTo(Sport, { foreignKey: 'sport_id' });

Team.hasMany(Student, { foreignKey: 'team_id' });
Student.belongsTo(Team, { foreignKey: 'team_id' });

// --- Export ---
module.exports = {
  sequelize,
  Parent, Coach, Sport, Team, Student
};