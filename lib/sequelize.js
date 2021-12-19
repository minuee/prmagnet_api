let AWS = require("aws-sdk");
const Sequelize = require("sequelize");

//let sequelize = null;

const OND_DAY = 1;
const LEEWAY = OND_DAY;

//숫자가 문자열로 반환되는 경우 방지
require("pg").defaults.parseInt8 = true;

//----------------------------------------------
// sequelize
const dbUrl = process.env.DB_URL + "/" + process.env.DB_DATABSE_NAME;

let sequelize = null;

const envType = process.env.NODE_ENV;

try {
  console.error(dbUrl);
  sequelize = new Sequelize(dbUrl, {
    // define: {
    //   freezeTableName: true,
    // // },
    // logging: //console.log
    //logging: envType === "dev",
  });
} catch (error) {
  console.error(String(error));
}

module.exports = sequelize;
