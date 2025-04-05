module.exports = (sequelize, DataTypes) => {
    const customer_payment_return_model = sequelize.define("customer_payment_return", {
        customer_payment_return_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        customer_payment_return_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        customer_payment_return_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        customer_payment_return_sales: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_sales_invoice: {
            type: DataTypes.STRING
        },
        customer_payment_return_sales_return: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_date: {
            type: DataTypes.DATEONLY
        },
        customer_payment_return_customer: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_payable: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_payment_return_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_payment_return_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_payment_return_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Return',
        },
        customer_payment_return_sales_reference_number: {
            type: DataTypes.STRING
        },
        customer_payment_return_sales_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        customer_payment_return_sales_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        customer_payment_return_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        customer_payment_return_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        customer_payment_return_create_by: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_update_by: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_delete_by: {
            type: DataTypes.BIGINT
        },
        customer_payment_return_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "customer_payment_return_create_at",
        updatedAt: "customer_payment_return_update_at"
    });
	return customer_payment_return_model;
};