const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  const Model = sequelize.define(
    "tb_user",
    {
      user_no: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        comment: "유저 번호",
      },
      user_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        primaryKey: true,
        comment: "유저 상태 ( 0 활성, 자기 user_no 비활성)",
      },
      user_id: {
        type: DataTypes.UUID,
        unique: true,
        comment: "유저 코그니토 uuid",
        allowNull: false,
      },
      createdAt: {
        field: "join_dt",
        // type: sequelize.BIGINT,
        type: "TIMESTAMP",
        comment: "가입 일자",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        field: "up_dt",
        // type: sequelize.BIGINT,
        type: "TIMESTAMP",
        comment: "변경 일자",
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    },
    {
      paranoid: true,
      deletedAt: "del_dt",
      freezeTableName: true,
      //   timestamps: false,
      indexes: [
        {
          // unique: true,
          fields: ["join_dt"],
          // using: "gin",
          // operator: "jsonb_path_ops",
          // using: "gin",
        },
        // { fields: ["friends"], using: "gin" },
        // { fields: ["hashtags"], using: "gin" },
      ],
      comment: "유저 테이블",
    }
  );
  return Model;
};
