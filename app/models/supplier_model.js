module.exports = (sequelize, DataTypes) => {
    const supplier_model = sequelize.define("supplier", {
        supplier_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        supplier_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier_name: {
            type: DataTypes.STRING
        },
        supplier_contact_person: {
            type: DataTypes.STRING
        },
        supplier_phone_number: {
            type: DataTypes.STRING
        },
        supplier_email: {
            type: DataTypes.TEXT
        },
        supplier_address: {
            type: DataTypes.TEXT
        },
        supplier_picture: {
            type: DataTypes.TEXT
        },
        supplier_purchase: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_return: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_return_paid: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_return_due: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        supplier_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        supplier_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        supplier_create_by: {
            type: DataTypes.BIGINT
        },
        supplier_update_by: {
            type: DataTypes.BIGINT
        },
        supplier_delete_by: {
            type: DataTypes.BIGINT
        },
        supplier_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "supplier_create_at",
        updatedAt: "supplier_update_at"
    });
	return supplier_model;
};