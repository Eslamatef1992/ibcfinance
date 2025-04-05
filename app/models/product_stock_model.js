module.exports = (sequelize, DataTypes) => {
    const product_stock_model = sequelize.define("product_stock", {
        product_stock_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_stock_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_product: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_purchase_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_return_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_sales_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_sales_return_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_in_stock: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_stock_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_stock_create_by: {
            type: DataTypes.BIGINT
        },
        product_stock_update_by: {
            type: DataTypes.BIGINT
        },
        product_stock_delete_by: {
            type: DataTypes.BIGINT
        },
        product_stock_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_stock_create_at",
        updatedAt: "product_stock_update_at"
    });
	return product_stock_model;
};