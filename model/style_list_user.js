const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  const Model = sequelize.define(
    "tb_style_list_user",
    {
      user_id: {
        type: DataTypes.UUID,
        unique: true,
        comment: "유저 코그니토 uuid",
        allowNull: false,
      },
      style_list_user_id: DataTypes.STRING(20),
      style_list_pos_cd: DataTypes.STRING(6),
      pwd: DataTypes.STRING(16),
      user_nm: DataTypes.STRING(50),
      phone_no: DataTypes.STRING(20),
      email_adres: DataTypes.STRING(50),
      post_no: DataTypes.STRING(10),
      adres: DataTypes.STRING(200),
      img_url_adres: DataTypes.STRING(500),
      posi_compy_nm: DataTypes.STRING(50),
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
