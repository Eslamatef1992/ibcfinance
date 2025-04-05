module.exports = (sequelize, DataTypes) => {
    const sales_return_model = sequelize.define("sales_return", {
        sales_return_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        sales_return_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_return_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_return_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_customer: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_sales: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_return_sales_invoice: {
            type: DataTypes.STRING
        },
        sales_return_sales_date: {
            type: DataTypes.DATEONLY
        },
        sales_return_date: {
            type: DataTypes.DATEONLY
        },
        sales_return_total_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_adjustment_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_payable_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_paid_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_due_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_reference_number: {
            type: DataTypes.STRING
        },
        sales_return_payment_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        sales_return_payment_method: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        sales_return_payment_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sales_return_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        sales_return_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        sales_return_create_by: {
            type: DataTypes.BIGINT
        },
        sales_return_update_by: {
            type: DataTypes.BIGINT
        },
        sales_return_delete_by: {
            type: DataTypes.BIGINT
        },
        sales_return_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "sales_return_create_at",
        updatedAt: "sales_return_update_at"
    });
	return sales_return_model;
};