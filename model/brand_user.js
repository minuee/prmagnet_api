const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  const Model = sequelize.define(
    "tb_brand_user",
    {
      user_id: {
        type: DataTypes.UUID,
        unique: true,
        comment: "유저 코그니토 uuid",
        allowNull: false,
      },
      brand_user_id: DataTypes.STRING(20),
      brand_id: DataTypes.STRING(20),
      pwd: DataTypes.STRING(16),
      user_nm: DataTypes.STRING(50),
      brand_pos_cd: DataTypes.STRING(6),
      phone_no: DataTypes.STRING,
      email_adres: DataTypes.STRING,
      post_no: DataTypes.STRING,
      adres: DataTypes.STRING(200),
      posi_dept_nm: DataTypes.STRING(50),
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
