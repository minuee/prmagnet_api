const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  const Model = sequelize.define(
    "tb_mgzn_user",
    {
      user_id: {
        type: DataTypes.UUID,
        unique: true,
        comment: "유저 코그니토 uuid",
        allowNull: false,
      },
      mgzn_user_id: DataTypes.STRING(20),
      mgzn_id: DataTypes.STRING(20),
      pwd: DataTypes.STRING(16),
      user_nm: DataTypes.STRING(50),
      mgzn_pos_cd: DataTypes.STRING(6),
      phone_no: DataTypes.STRING(20),
      email_adres: DataTypes.STRING(50),
      post_no: DataTypes.STRING(10),
      adres: DataTypes.STRING(200),
      posi_dept_nm: DataTypes.STRING(50),
      img_url_adres: DataTypes.STRING(500),
      reg_dt: {
        type: "TIMESTAMP",
      },
      input_id: DataTypes.STRING(150),
      input_dt: {
        type: "TIMESTAMP",
      },
      updt_id: DataTypes.STRING(150),
      updt_dt: {
        type: "TIMESTAMP",
      },
      del_yn: DataTypes.STRING(1),
    },
    {
      paranoid: true,
      deletedAt: "del_dt",
      freezeTableName: true,
      comment: "유저 테이블",
    }
  );

  return Model;
};
