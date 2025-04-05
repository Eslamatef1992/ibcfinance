module.exports = (sequelize, DataTypes) => {
    const product_category_model = sequelize.define("product_category", {
        product_category_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_category_company: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_category_code: {
            type: DataTypes.STRING
        },
        product_category_name: {
            type: DataTypes.STRING
        },
        product_category_picture: {
            type: DataTypes.TEXT
        },
        product_category_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_category_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_category_create_by: {
            type: DataTypes.BIGINT
        },
        product_category_update_by: {
            type: DataTypes.BIGINT
        },
        product_category_delete_by: {
            type: DataTypes.BIGINT
        },
        product_category_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_category_create_at",
        updatedAt: "product_category_update_at"
    });
	return product_category_model;
};