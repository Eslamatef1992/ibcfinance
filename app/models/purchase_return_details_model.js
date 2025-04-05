module.exports = (sequelize, DataTypes) => {
    const purchase_return_details_model = sequelize.define("purchase_return_details", {
        purchase_return_details_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        purchase_return_details_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_return_details_branch: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        purchase_return_details_supplier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_warehouse: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_purchase: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_purchase_invoice: {
            type: DataTypes.STRING
        },
        purchase_return_details_purchase_date: {
            type: DataTypes.DATEONLY
        },
        purchase_return_details_return_date: {
            type: DataTypes.DATEONLY
        },
        purchase_return_details_purchase_return: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_product: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_product_code: {
            type: DataTypes.STRING
        },
        purchase_return_details_product_name: {
            type: DataTypes.TEXT
        },
        purchase_return_details_product_unit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_purchase_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_details_purchase_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_purchase_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_details_return_price: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_details_return_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        purchase_return_details_return_amount: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0
        },
        purchase_return_details_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        purchase_return_details_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        purchase_return_details_create_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_details_update_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_details_delete_by: {
            type: DataTypes.BIGINT
        },
        purchase_return_details_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "purchase_return_details_create_at",
        updatedAt: "purchase_return_details_update_at"
    });
	return purchase_return_details_model;
};