module.exports = (sequelize, DataTypes) => {
    const product_brand_model = sequelize.define("product_brand", {
        product_brand_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_brand_company: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_brand_code: {
            type: DataTypes.STRING
        },
        product_brand_name: {
            type: DataTypes.STRING
        },
        product_brand_picture: {
            type: DataTypes.TEXT
        },
        product_brand_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_brand_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_brand_create_by: {
            type: DataTypes.BIGINT
        },
        product_brand_update_by: {
            type: DataTypes.BIGINT
        },
        product_brand_delete_by: {
            type: DataTypes.BIGINT
        },
        product_brand_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_brand_create_at",
        updatedAt: "product_brand_update_at"
    });
	return product_brand_model;
};