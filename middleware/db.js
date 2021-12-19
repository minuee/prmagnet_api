const envType = process.env.NODE_ENV ? process.env.NODE_ENV : "dev";

const isModelInit = false;
// const isModelInit = true;

//const User = require("../model/user")(sequelize);
// const BrandUser = require("../model/brand_user")(sequelize);
// const MgznUser = require("../model/mgzn_user")(sequelize);
// const StyleListUser = require("../model/style_list_user")(sequelize);
// const SysInqryMngr = require("../model/sys_inqry_mngr")(sequelize);

//----------------------------------------------
// Models Association

if (!isModelInit) {
}

//----------------------------------------------
// scope

//----------------------------------------------
// export

const db = async function (req, res, next) {
  const mybatisMapper = require("../lib/mybatis");
  const sequelize = require("../lib/sequelize");
  req.envType = envType;
  req.sequelize = sequelize;
  req.mybatisMapper = mybatisMapper;
  // req.model = {
  //   User,
  //   BrandUser,
  //   MgznUser,
  //   StyleListUser,
  //   SysInqryMngr,
  // };
  next();
};

module.exports = db;
