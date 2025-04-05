module.exports = (sequelize, DataTypes) => {
  const branch_owner_model = sequelize.define(
    "branch_owner",
    {
      branch_owner_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: "1 = Active, 0 = Inactive",
      },
      delete_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "1 = Delete, 0 = Active",
      },
      create_by: {
        type: DataTypes.BIGINT,
      },
      update_by: {
        type: DataTypes.BIGINT,
      },
      delete_by: {
        type: DataTypes.BIGINT,
      },
      delete_at: {
        type: DataTypes.DATE,
      },
    },
    {
      createdAt: "create_at",
      updatedAt: "update_at",
    }
  );
  return branch_owner_model;
};
