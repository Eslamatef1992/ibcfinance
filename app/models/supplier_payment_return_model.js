module.exports = (sequelize, DataTypes) => {
    const supplier_payment_return_model = sequelize.define("supplier_payment_return", {
        supplier_payment_return_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        supplier_payment_return_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier_payment_return_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier_payment_return_purchase: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_purchase_invoice: {
            type: DataTypes.STRING
        },
        supplier_payment_return_purchase_return: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_date: {
            type: DataTypes.DATEONLY
        },
        supplier_payment_return_supplier: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_payable: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_return_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_return_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_return_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Return',
        },
        supplier_payment_return_purchase_reference_number: {
            type: DataTypes.STRING
        },
        supplier_payment_return_purchase_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        supplier_payment_return_purchase_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        supplier_payment_return_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        supplier_payment_return_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        supplier_payment_return_create_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_update_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_delete_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_return_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "supplier_payment_return_create_at",
        updatedAt: "supplier_payment_return_update_at"
    });
	return supplier_payment_return_model;
};