module.exports = (sequelize, DataTypes) => {
    const product_model = sequelize.define("product", {
        product_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        product_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        product_code: {
            type: DataTypes.STRING
        },
        product_barcode: {
            type: DataTypes.STRING
        },
        product_model: {
            type: DataTypes.STRING
        },
        product_name: {
            type: DataTypes.STRING
        },
        product_description: {
            type: DataTypes.TEXT('long')
        },
        product_product_category: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_product_brand: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_product_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_product_unit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_unit_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_purchase_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_purchase_discount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_discount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_purchase_tax: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_tax: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_purchase_vat: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_vat: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        product_purchase_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_return_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_sales_return_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_stock_quantity: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        product_picture: {
            type: DataTypes.TEXT
        },
        product_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        product_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        product_create_by: {
            type: DataTypes.BIGINT
        },
        product_update_by: {
            type: DataTypes.BIGINT
        },
        product_delete_by: {
            type: DataTypes.BIGINT
        },
        product_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "product_create_at",
        updatedAt: "product_update_at"
    });
	return product_model;
};