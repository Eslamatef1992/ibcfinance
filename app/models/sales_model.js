module.exports = (sequelize, DataTypes) => {
    const sales_model = sequelize.define("sales", {
        sales_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        sales_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_customer: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_date: {
            type: DataTypes.DATEONLY
        },
        sales_invoice: {
            type: DataTypes.STRING
        },

        sales_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },

        sales_product_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "Before Discount"
        },

        sales_discount_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_discount_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_tax_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_tax_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_tax_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_tax_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "sales_tax_amount + sales_vat_amount"
        },
        sales_total_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "(product_amount - discount_amount) + tax_vat_amount"
        },

        sales_payable_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "	(sales_product_sales_price - sales_total_discount_amount) + sales_total_tax_vat_amount"
        },
        sales_adjustment_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_payable_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_paid_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_due_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_total_purchase_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_total_profit_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_reference_number: {
            type: DataTypes.STRING
        },
        sales_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        sales_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        sales_payment_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sales_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        sales_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        sales_create_by: {
            type: DataTypes.BIGINT
        },
        sales_update_by: {
            type: DataTypes.BIGINT
        },
        sales_delete_by: {
            type: DataTypes.BIGINT
        },
        sales_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "sales_create_at",
        updatedAt: "sales_update_at"
    });
	return sales_model;
};