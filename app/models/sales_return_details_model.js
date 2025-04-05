module.exports = (sequelize, DataTypes) => {
    const sales_return_details_model = sequelize.define("sales_return_details", {
        sales_return_details_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        sales_return_details_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_return_details_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        sales_return_details_customer: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_sales: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_sales_invoice: {
            type: DataTypes.STRING
        },
        sales_return_details_sales_date: {
            type: DataTypes.DATEONLY
        },
        sales_return_details_return_date: {
            type: DataTypes.DATEONLY
        },
        sales_return_details_sales_return: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_product: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_product_code: {
            type: DataTypes.STRING
        },
        sales_return_details_product_name: {
            type: DataTypes.TEXT
        },
        sales_return_details_product_unit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_sales_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_details_sales_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_sales_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_details_return_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_details_return_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sales_return_details_return_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        sales_return_details_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        sales_return_details_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        sales_return_details_create_by: {
            type: DataTypes.BIGINT
        },
        sales_return_details_update_by: {
            type: DataTypes.BIGINT
        },
        sales_return_details_delete_by: {
            type: DataTypes.BIGINT
        },
        sales_return_details_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "sales_return_details_create_at",
        updatedAt: "sales_return_details_update_at"
    });
	return sales_return_details_model;
};