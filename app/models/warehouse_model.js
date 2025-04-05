module.exports = (sequelize, DataTypes) => {
    const warehouse_model = sequelize.define("warehouse", {
        warehouse_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        warehouse_code: {
            type: DataTypes.STRING
        },
        warehouse_name: {
            type: DataTypes.STRING
        },
        warehouse_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        warehouse_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        warehouse_picture: {
            type: DataTypes.TEXT
        },
        warehouse_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        warehouse_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        warehouse_create_by: {
            type: DataTypes.BIGINT
        },
        warehouse_update_by: {
            type: DataTypes.BIGINT
        },
        warehouse_delete_by: {
            type: DataTypes.BIGINT
        },
        warehouse_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "warehouse_create_at",
        updatedAt: "warehouse_update_at"
    });
	return warehouse_model;
};