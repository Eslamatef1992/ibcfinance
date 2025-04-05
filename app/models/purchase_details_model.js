module.exports = (sequelize, DataTypes) => {
    const purchase_details_model = sequelize.define("purchase_details", {
        purchase_details_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        purchase_details_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_details_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_details_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_supplier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_purchase_date: {
            type: DataTypes.DATEONLY
        },
        purchase_details_purchase: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_purchase_invoice: {
            type: DataTypes.STRING
        },
        purchase_details_product: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_product_code: {
            type: DataTypes.STRING
        },
        purchase_details_product_name: {
            type: DataTypes.TEXT
        },
        purchase_details_product_unit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_previous_purchase_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_previous_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_current_stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_unit_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_purchase_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_return_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_product_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "Before Discount, Tax  & Vat) * Quantity"
        },
        purchase_details_discount_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_discount_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_tax_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_tax_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_tax_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_tax_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_details_purchase_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_details_purchase_price_different: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "unit_price-purchase_price"
        },
        purchase_details_purchase_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },

        purchase_details_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        purchase_details_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        purchase_details_create_by: {
            type: DataTypes.BIGINT
        },
        purchase_details_update_by: {
            type: DataTypes.BIGINT
        },
        purchase_details_delete_by: {
            type: DataTypes.BIGINT
        },
        purchase_details_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "purchase_details_create_at",
        updatedAt: "purchase_details_update_at"
    });
	return purchase_details_model;
};