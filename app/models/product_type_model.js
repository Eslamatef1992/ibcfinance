module.exports = (sequelize, DataTypes) => {
    const product_type_model = sequelize.define("product_type", {
        product_type_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_type_company: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_type_code: {
            type: DataTypes.STRING
        },
        product_type_name: {
            type: DataTypes.STRING
        },
        product_type_picture: {
            type: DataTypes.TEXT
        },
        product_type_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_type_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_type_create_by: {
            type: DataTypes.BIGINT
        },
        product_type_update_by: {
            type: DataTypes.BIGINT
        },
        product_type_delete_by: {
            type: DataTypes.BIGINT
        },
        product_type_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_type_create_at",
        updatedAt: "product_type_update_at"
    });
	return product_type_model;
};