module.exports = (sequelize, DataTypes) => {
    const sales_details_model = sequelize.define("sales_details", {
        sales_details_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        sales_details_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_details_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_details_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_customer: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_sales_date: {
            type: DataTypes.DATEONLY
        },
        sales_details_sales: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_sales_invoice: {
            type: DataTypes.STRING
        },
        sales_details_product: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_product_code: {
            type: DataTypes.STRING
        },
        sales_details_product_name: {
            type: DataTypes.TEXT
        },
        sales_details_product_unit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_previous_sales_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_previous_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_current_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_unit_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_sales_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_return_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_product_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "Before Discount, Tax  & Vat) * Quantity"
        },
        sales_details_discount_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_discount_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_tax_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_tax_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_tax_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_tax_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_details_sales_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_details_sales_price_different: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "unit_price-sales_price"
        },
        sales_details_sales_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },

        sales_details_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        sales_details_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        sales_details_create_by: {
            type: DataTypes.BIGINT
        },
        sales_details_update_by: {
            type: DataTypes.BIGINT
        },
        sales_details_delete_by: {
            type: DataTypes.BIGINT
        },
        sales_details_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "sales_details_create_at",
        updatedAt: "sales_details_update_at"
    });
	return sales_details_model;
};