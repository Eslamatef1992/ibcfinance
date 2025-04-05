module.exports = (sequelize, DataTypes) => {
    const product_unit_model = sequelize.define("product_unit", {
        product_unit_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_unit_company: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_unit_code: {
            type: DataTypes.STRING
        },
        product_unit_name: {
            type: DataTypes.STRING
        },
        product_unit_picture: {
            type: DataTypes.TEXT
        },
        product_unit_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_unit_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_unit_create_by: {
            type: DataTypes.BIGINT
        },
        product_unit_update_by: {
            type: DataTypes.BIGINT
        },
        product_unit_delete_by: {
            type: DataTypes.BIGINT
        },
        product_unit_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_unit_create_at",
        updatedAt: "product_unit_update_at"
    });
	return product_unit_model;
};