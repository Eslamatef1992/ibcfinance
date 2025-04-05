module.exports = (sequelize, DataTypes) => {
    const supplier_payment_model = sequelize.define("supplier_payment", {
        supplier_payment_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        supplier_payment_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier_payment_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier_payment_date: {
            type: DataTypes.DATEONLY
        },
        supplier_payment_purchase: {
            type: DataTypes.BIGINT
        },
        supplier_payment_purchase_invoice: {
            type: DataTypes.STRING
        },
        supplier_payment_supplier: {
            type: DataTypes.BIGINT
        },
        supplier_payment_payable: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_payment_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Purchase',
        },
        supplier_payment_purchase_reference_number: {
            type: DataTypes.STRING
        },
        supplier_payment_purchase_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        supplier_payment_purchase_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        supplier_payment_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        supplier_payment_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        supplier_payment_create_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_update_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_delete_by: {
            type: DataTypes.BIGINT
        },
        supplier_payment_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "supplier_payment_create_at",
        updatedAt: "supplier_payment_update_at"
    });
	return supplier_payment_model;
};