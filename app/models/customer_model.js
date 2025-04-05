module.exports = (sequelize, DataTypes) => {
    const customer_model = sequelize.define("customer", {
        customer_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        customer_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        customer_name: {
            type: DataTypes.STRING
        },
        customer_contact_person: {
            type: DataTypes.STRING
        },
        customer_phone_number: {
            type: DataTypes.STRING
        },
        customer_email: {
            type: DataTypes.TEXT
        },
        customer_address: {
            type: DataTypes.TEXT
        },
        customer_picture: {
            type: DataTypes.TEXT
        },
        customer_sales: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_return: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_return_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_return_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        customer_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        customer_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        customer_create_by: {
            type: DataTypes.BIGINT
        },
        customer_update_by: {
            type: DataTypes.BIGINT
        },
        customer_delete_by: {
            type: DataTypes.BIGINT
        },
        customer_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "customer_create_at",
        updatedAt: "customer_update_at"
    });
	return customer_model;
};