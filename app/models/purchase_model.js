module.exports = (sequelize, DataTypes) => {
    const purchase_model = sequelize.define("purchase", {
        purchase_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        purchase_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_supplier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_date: {
            type: DataTypes.DATEONLY
        },
        purchase_invoice: {
            type: DataTypes.STRING
        },
        purchase_product_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "Before Discount"
        },
        purchase_discount_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_discount_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_tax_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_tax_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_tax_vat_percent: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_tax_vat_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
            comment: "purchase_tax_amount + purchase_vat_amount"
        },
        purchase_total_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_adjustment_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_payable_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_paid_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_due_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_reference_number: {
            type: DataTypes.STRING
        },
        purchase_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        purchase_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        purchase_payment_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        purchase_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        purchase_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        purchase_create_by: {
            type: DataTypes.BIGINT
        },
        purchase_update_by: {
            type: DataTypes.BIGINT
        },
        purchase_delete_by: {
            type: DataTypes.BIGINT
        },
        purchase_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "purchase_create_at",
        updatedAt: "purchase_update_at"
    });
	return purchase_model;
};