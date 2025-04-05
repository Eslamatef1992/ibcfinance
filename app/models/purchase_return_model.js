module.exports = (sequelize, DataTypes) => {
    const purchase_return_model = sequelize.define("purchase_return", {
        purchase_return_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        purchase_return_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_return_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_return_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_supplier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_purchase: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_return_purchase_invoice: {
            type: DataTypes.STRING
        },
        purchase_return_purchase_date: {
            type: DataTypes.DATEONLY
        },
        purchase_return_date: {
            type: DataTypes.DATEONLY
        },
        purchase_return_total_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_adjustment_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_payable_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_paid_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_due_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_reference_number: {
            type: DataTypes.STRING
        },
        purchase_return_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_payment_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        purchase_return_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        purchase_return_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        purchase_return_create_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_update_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_delete_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "purchase_return_create_at",
        updatedAt: "purchase_return_update_at"
    });
	return purchase_return_model;
};