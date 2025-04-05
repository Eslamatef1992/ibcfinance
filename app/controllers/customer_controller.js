require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const config = require("../config/config");
const otp_generator = require("otp-generator");
const nodemailer = require("nodemailer");

const customer_model = db.customer_model;
const sales_model = db.sales_model;
const warehouse_model = db.warehouse_model;
const company_model = db.company_model;
const branch_model = db.branch_model;
const customer_payment_model = db.customer_payment_model;
const Op = db.Sequelize.Op;
let user_id;

// Customer List
exports.customer_list = async (req, res) => {
    try {
        const customer = await customer_model.findAll({
            where: {
                customer_company: req.query.company,
                customer_delete_status: 0,
                ...(req.query.status == 'all' ? {} : {
                    customer_status: req.query.status
                }),
                ...(req.query.search.length > 0 ? {
                    [Op.or]: [
                        {
                            customer_code: { [Op.like]: `%${req.query.search}%` }
                        },
                        {
                            customer_name: { [Op.like]: `%${req.query.search}%` }
                        }
                    ]
                } : {})
            },
            order: [
                ['customer_id', 'DESC']
            ]
        });

        if (customer.length > 0) {
            const customer_data = await Promise.all(customer.map(async (row) => ({
                customer_id: row.customer_id,
                customer_company: row.customer_company,
                customer_name: row.customer_name,
                customer_contact_person: row.customer_contact_person,
                customer_phone_number: row.customer_phone_number,
                customer_email: row.customer_email,
                customer_address: row.customer_address,
                customer_picture: row.customer_picture === null ? '' : `${process.env.BASE_URL}/${row.customer_picture}`,
                customer_sales: row.customer_sales,
                customer_paid: row.customer_paid,
                customer_due: row.customer_due,
                customer_return: row.customer_return,
                customer_return_paid: row.customer_return_paid,
                customer_return_due: row.customer_return_due,
                customer_status: row.customer_status
            })));

            return res.send({
                status: "1",
                message: "Customer Find Successfully!",
                data: customer_data
            });
        }

        return res.send({
            status: "0",
            message: "Customer Not Found !",
            data: [],
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};

// Customer List Active
exports.customer_list_active = async (req, res) => {
    try {
        const customer = await customer_model.findAll({
            where: {
                customer_company: req.params.company,
                customer_status: 1,
                customer_delete_status: 0
            },
            order: [
                ['customer_name', 'ASC']
            ]
        });

        if (customer.length > 0) {
            const customer_data = await Promise.all(customer.map(async (row) => ({
                customer_id: row.customer_id,
                customer_company: row.customer_company,
                customer_name: row.customer_name,
                customer_contact_person: row.customer_contact_person,
                customer_phone_number: row.customer_phone_number,
                customer_email: row.customer_email,
                customer_address: row.customer_address,
                customer_picture: row.customer_picture === null ? '' : `${process.env.BASE_URL}/${row.customer_picture}`,
                customer_sales: row.customer_sales,
                customer_paid: row.customer_paid,
                customer_due: row.customer_due,
                customer_return: row.customer_return,
                customer_return_paid: row.customer_return_paid,
                customer_return_due: row.customer_return_due,
                customer_status: row.customer_status
            })));

            return res.send({
                status: "1",
                message: "Customer Find Successfully!",
                data: customer_data
            });
        }
        return res.send({
            status: "0",
            message: "Customer Not Found !",
            data: [],
        });
    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};

// Get Customer
exports.get_customer = async (req, res) => {
    try {
        const data = await customer_model.findOne({
            where: {
                customer_id: req.params.customer_id
            },
        });

        if (!data) {
            return res.send({
                status: "0",
                message: "Customer Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Customer Find Successfully!",
            data: {
                customer_id: data.customer_id,
                customer_company: data.customer_company,
                customer_name: data.customer_name,
                customer_contact_person: data.customer_contact_person,
                customer_phone_number: data.customer_phone_number,
                customer_email: data.customer_email,
                customer_address: data.customer_address,
                customer_picture: data.customer_picture === null ? '' : `${process.env.BASE_URL}/${data.customer_picture}`,
                customer_sales: data.customer_sales,
                customer_paid: data.customer_paid,
                customer_due: data.customer_due,
                customer_return: data.customer_return,
                customer_return_paid: data.customer_return_paid,
                customer_return_due: data.customer_return_due,
                customer_status: data.customer_status
            }
        });
    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: "",
            });
    }
};

// Customer Create
exports.customer_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let customer_check_data = await customer_model.findOne({
            where: {
                customer_phone_number: req.body.customer_phone_number
            }
        });

        if (customer_check_data) {
            return res.send({
                status: "0",
                message: "Customer Phone Exist!",
                data: '',
            });
        }

        customer_check_data = await customer_model.findOne({
            where: {
                customer_email: req.body.customer_email
            }
        });

        if (customer_check_data) {
            return res.send({
                status: "0",
                message: "Customer Email Exist!",
                data: '',
            });
        }

        let customer_picture;
        if (req.file == undefined) {
            customer_picture = "assets/images/customers/customer-icon.png";
        } else {
            customer_picture = "assets/images/customers/" + req.file.filename;
        }

        const customer = await customer_model.create({
            customer_company: req.body.customer_company,
            customer_name: req.body.customer_name,
            customer_contact_person: req.body.customer_contact_person,
            customer_phone_number: req.body.customer_phone_number,
            customer_email: req.body.customer_email,
            customer_address: req.body.customer_address,
            customer_picture: customer_picture,
            customer_status: req.body.customer_status,
            customer_create_by: user_id,
        });

        if (customer) {
            const data = await customer_model.findOne({
                where: {
                    customer_id: customer.customer_id
                },
            });

            return res.send({
                status: "1",
                message: "Customer Create Successfully!",
                data: {
                    customer_id: data.customer_id,
                    customer_company: data.customer_company,
                    customer_name: data.customer_name,
                    customer_contact_person: data.customer_contact_person,
                    customer_phone_number: data.customer_phone_number,
                    customer_email: data.customer_email,
                    customer_address: data.customer_address,
                    customer_picture: data.customer_picture === null ? '' : `${process.env.BASE_URL}/${data.customer_picture}`,
                    customer_sales: data.customer_sales,
                    customer_paid: data.customer_paid,
                    customer_due: data.customer_due,
                    customer_return: data.customer_return,
                    customer_return_paid: data.customer_return_paid,
                    customer_return_due: data.customer_return_due,
                    customer_status: data.customer_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Customer Create Error !",
            data: "",
        });
    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: "",
            });
    }
};

// Customer Update
exports.customer_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let customer_check_data = await customer_model.findOne({
            where: {
                customer_phone_number: req.body.customer_phone_number,
                [Op.not]: [
                    { customer_id: req.params.customer_id }
                ]
            }
        });

        if (customer_check_data) {
            return res.send({
                status: "0",
                message: "Customer Phone Exist!",
                data: '',
            });
        }

        customer_check_data = await customer_model.findOne({
            where: {
                customer_email: req.body.customer_email,
                [Op.not]: [
                    { customer_id: req.params.customer_id }
                ]
            }
        });

        if (customer_check_data) {
            return res.send({
                status: "0",
                message: "Customer Email Exist!",
                data: '',
            });
        }

        const customer_data = await customer_model.findOne({
            where: {
                customer_id: req.params.customer_id
            }
        });

        if (!customer_data) {
            return res.send({
                status: "0",
                message: "Customer ID Not Found!",
                data: "",
            });
        }

        let customer_picture;
        if (req.file == undefined) {
            customer_picture = "assets/images/customers/customer-icon.png";
        } else {
            customer_picture = "assets/images/customers/" + req.file.filename;
        }

        const customer = await customer_model.update({
            customer_company: req.body.customer_company,
            customer_name: req.body.customer_name,
            customer_contact_person: req.body.customer_contact_person,
            customer_phone_number: req.body.customer_phone_number,
            customer_email: req.body.customer_email,
            customer_address: req.body.customer_address,
            customer_picture: customer_picture,
            customer_status: req.body.customer_status,
            customer_update_by: user_id,
        },
            {
                where: {
                    customer_id: req.params.customer_id
                }
            });
        if (customer) {
            const data = await customer_model.findOne({
                where: {
                    customer_id: req.params.customer_id
                },
            });

            return res.send({
                status: "1",
                message: "Customer Update Successfully!",
                data: {
                    customer_id: data.customer_id,
                    customer_company: data.customer_company,
                    customer_name: data.customer_name,
                    customer_contact_person: data.customer_contact_person,
                    customer_phone_number: data.customer_phone_number,
                    customer_email: data.customer_email,
                    customer_address: data.customer_address,
                    customer_picture: data.customer_picture === null ? '' : `${process.env.BASE_URL}/${data.customer_picture}`,
                    customer_sales: data.customer_sales,
                    customer_paid: data.customer_paid,
                    customer_due: data.customer_due,
                    customer_return: data.customer_return,
                    customer_return_paid: data.customer_return_paid,
                    customer_return_due: data.customer_return_due,
                    customer_status: data.customer_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Customer Update Error!",
            data: ""
        });
    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: "",
            });
    }
};

// Customer Delete
exports.customer_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const customer_data = await customer_model.findOne({
            where: {
                customer_id: req.params.customer_id
            }
        });

        if (!customer_data) {
            return res.send({
                status: "0",
                message: "Customer ID Not Found!",
                data: "",
            });
        }

        const customer = await customer_model.update({
            customer_status: 0,
            customer_delete_status: 1,
            customer_delete_by: user_id,
            customer_delete_at: new Date(),
        },
            {
                where: {
                    customer_id: req.params.customer_id
                }
            });

        return res.send({
            status: "1",
            message: "Customer Delete Successfully!",
            data: ""
        });
    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: "",
            });
    }
};

// Customer Report
exports.customer_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name: company_info.company_name,
            company_owner_name: company_info.company_owner_name,
            company_phone: company_info.company_phone,
            company_email: company_info.company_email,
            company_website: company_info.company_website,
            company_address: company_info.company_address,
            company_opening_date: company_info.company_opening_date,
            company_picture: company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code: branch_info <= 0 ? '' : branch_info.branch_code,
            branch_name: branch_info <= 0 ? '' : branch_info.branch_name,
            branch_phone: branch_info <= 0 ? '' : branch_info.branch_phone,
            branch_email: branch_info <= 0 ? '' : branch_info.branch_email,
            branch_address: branch_info <= 0 ? '' : branch_info.branch_address,
            branch_opening_date: branch_info <= 0 ? '' : branch_info.branch_opening_date,
            project_owner: branch_info <= 0 ? '' : branch_info.project_owner,
            type_of_work: branch_info <= 0 ? '' : branch_info.type_of_work,
            contract_value: branch_info <= 0 ? '' : branch_info.contract_value,
            milestore: branch_info <= 0 ? '' : branch_info.milestore,
            commencement_date: branch_info <= 0 ? '' : branch_info.commencement_date,
            handing_over_date: branch_info <= 0 ? '' : branch_info.handing_over_date,
            percentage_of_claiming_invoice: branch_info <= 0 ? '' : branch_info.percentage_of_claiming_invoice,
            attachment: branch_info <= 0 ? '' : branch_info.attachment,
            attach_quotation_and_invoice: branch_info <= 0 ? '' : branch_info.attach_quotation_and_invoice,
        };
        const customer = await customer_model.findAll({
            where: {
                customer_company: req.query.company,
                ...(req.query.status == 'all' ? {} : {
                    customer_status: req.query.status
                }),
                customer_delete_status: 0,
            },
            order: [
                ['customer_name', 'ASC']
            ]
        });

        if (customer.length > 0) {
            const customer_data = await Promise.all(customer.map(async (row) => ({
                customer_id: row.customer_id,
                customer_company: row.customer_company,
                customer_name: row.customer_name,
                customer_contact_person: row.customer_contact_person,
                customer_phone_number: row.customer_phone_number,
                customer_email: row.customer_email,
                customer_address: row.customer_address,
                customer_picture: row.customer_picture === null ? '' : `${process.env.BASE_URL}/${row.customer_picture}`,
                customer_sales: row.customer_sales,
                customer_paid: row.customer_paid,
                customer_due: row.customer_due,
                customer_return: row.customer_return,
                customer_return_paid: row.customer_return_paid,
                customer_return_due: row.customer_return_due,
                customer_status: row.customer_status
            })));

            return res.send({
                status: "1",
                message: "Customer Find Successfully!",
                data: customer_data,
                company: company_data,
                branch: branch_data,
            });
        }

        return res.send({
            status: "0",
            message: "Customer Not Found !",
            data: [],
            company: '',
            branch: '',
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};

// Customer Sales Report
exports.customer_sales_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name: company_info.company_name,
            company_owner_name: company_info.company_owner_name,
            company_phone: company_info.company_phone,
            company_email: company_info.company_email,
            company_website: company_info.company_website,
            company_address: company_info.company_address,
            company_opening_date: company_info.company_opening_date,
            company_picture: company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code: branch_info <= 0 ? '' : branch_info.branch_code,
            branch_name: branch_info <= 0 ? '' : branch_info.branch_name,
            branch_phone: branch_info <= 0 ? '' : branch_info.branch_phone,
            branch_email: branch_info <= 0 ? '' : branch_info.branch_email,
            branch_address: branch_info <= 0 ? '' : branch_info.branch_address,
            branch_opening_date: branch_info <= 0 ? '' : branch_info.branch_opening_date,
            project_owner: branch_info <= 0 ? '' : branch_info.project_owner,
            type_of_work: branch_info <= 0 ? '' : branch_info.type_of_work,
            contract_value: branch_info <= 0 ? '' : branch_info.contract_value,
            milestore: branch_info <= 0 ? '' : branch_info.milestore,
            commencement_date: branch_info <= 0 ? '' : branch_info.commencement_date,
            handing_over_date: branch_info <= 0 ? '' : branch_info.handing_over_date,
            percentage_of_claiming_invoice: branch_info <= 0 ? '' : branch_info.percentage_of_claiming_invoice,
            attachment: branch_info <= 0 ? '' : branch_info.attachment,
            attach_quotation_and_invoice: branch_info <= 0 ? '' : branch_info.attach_quotation_and_invoice,
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name: customer_info <= 0 ? 'All' : customer_info.customer_name,
            customer_contact_person: customer_info <= 0 ? '' : customer_info.customer_contact_person,
            customer_phone_number: customer_info <= 0 ? '' : customer_info.customer_phone_number,
            customer_email: customer_info <= 0 ? '' : customer_info.customer_email,
            customer_address: customer_info <= 0 ? '' : customer_info.customer_address
        };

        const customer_sales = await sales_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey: 'company_id',
                        sourceKey: "sales_company",
                        required: false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey: 'branch_id',
                        sourceKey: "sales_branch",
                        required: false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey: 'warehouse_id',
                        sourceKey: "sales_warehouse",
                        required: false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey: 'customer_id',
                        sourceKey: "sales_customer",
                        required: false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                sales_branch: req.query.branch,
                sales_customer: req.query.customer,
                sales_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                sales_status: req.query.status,
                sales_delete_status: 0
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });

        if (customer_sales.length > 0) {
            const customer_sales_data = await Promise.all(customer_sales.map(async (row) => ({
                sales_id: row.sales_id,
                sales_company: row.sales_company,
                sales_company_name: row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch: row.sales_branch,
                sales_branch_code: row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name: row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse: row.sales_warehouse,
                sales_warehouse_code: row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name: row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer: row.sales_customer,
                sales_customer_name: row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date: row.sales_date,
                sales_invoice: row.sales_invoice,
                sales_product_amount: row.sales_product_amount,
                sales_discount_percent: row.sales_discount_percent,
                sales_discount_amount: row.sales_discount_amount,
                sales_tax_percent: row.sales_tax_percent,
                sales_tax_amount: row.sales_tax_amount,
                sales_vat_percent: row.sales_vat_percent,
                sales_vat_amount: row.sales_vat_amount,
                sales_tax_vat_percent: row.sales_tax_vat_percent,
                sales_tax_vat_amount: row.sales_tax_vat_amount,
                sales_total_amount: row.sales_total_amount,
                sales_adjustment_amount: row.sales_adjustment_amount,
                sales_payable_amount: row.sales_payable_amount,
                sales_paid_amount: row.sales_paid_amount,
                sales_due_amount: row.sales_due_amount,
                sales_reference_number: row.sales_reference_number,
                sales_payment_type: row.sales_payment_type,
                sales_payment_method: row.sales_payment_method,
                sales_payment_status: row.sales_payment_status,
                sales_status: row.sales_status,
            })));

            return res.send({
                status: "1",
                message: "Sales Find Successfully!",
                data: customer_sales_data,
                company: company_data,
                branch: branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status: "0",
            message: "Customer Not Found !",
            data: [],
            company: '',
            branch: '',
            customer: '',
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};

// Customer Collection Report
exports.customer_collection_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name: company_info.company_name,
            company_owner_name: company_info.company_owner_name,
            company_phone: company_info.company_phone,
            company_email: company_info.company_email,
            company_website: company_info.company_website,
            company_address: company_info.company_address,
            company_opening_date: company_info.company_opening_date,
            company_picture: company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code: branch_info <= 0 ? '' : branch_info.branch_code,
            branch_name: branch_info <= 0 ? '' : branch_info.branch_name,
            branch_phone: branch_info <= 0 ? '' : branch_info.branch_phone,
            branch_email: branch_info <= 0 ? '' : branch_info.branch_email,
            branch_address: branch_info <= 0 ? '' : branch_info.branch_address,
            branch_opening_date: branch_info <= 0 ? '' : branch_info.branch_opening_date,
            project_owner: branch_info <= 0 ? '' : branch_info.project_owner,
            type_of_work: branch_info <= 0 ? '' : branch_info.type_of_work,
            contract_value: branch_info <= 0 ? '' : branch_info.contract_value,
            milestore: branch_info <= 0 ? '' : branch_info.milestore,
            commencement_date: branch_info <= 0 ? '' : branch_info.commencement_date,
            handing_over_date: branch_info <= 0 ? '' : branch_info.handing_over_date,
            percentage_of_claiming_invoice: branch_info <= 0 ? '' : branch_info.percentage_of_claiming_invoice,
            attachment: branch_info <= 0 ? '' : branch_info.attachment,
            attach_quotation_and_invoice: branch_info <= 0 ? '' : branch_info.attach_quotation_and_invoice,
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name: customer_info <= 0 ? 'All' : customer_info.customer_name,
            customer_contact_person: customer_info <= 0 ? '' : customer_info.customer_contact_person,
            customer_phone_number: customer_info <= 0 ? '' : customer_info.customer_phone_number,
            customer_email: customer_info <= 0 ? '' : customer_info.customer_email,
            customer_address: customer_info <= 0 ? '' : customer_info.customer_address
        };

        const customer_payment = await customer_payment_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: customer_payment_model.hasOne(company_model, {
                        foreignKey: 'company_id',
                        sourceKey: "customer_payment_company",
                        required: false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: customer_payment_model.hasOne(branch_model, {
                        foreignKey: 'branch_id',
                        sourceKey: "customer_payment_branch",
                        required: false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: customer_payment_model.hasOne(customer_model, {
                        foreignKey: 'customer_id',
                        sourceKey: "customer_payment_customer",
                        required: false
                    }),
                }
            ],
            where: {
                customer_payment_company: req.query.company,
                customer_payment_branch: req.query.branch,
                customer_payment_customer: req.query.customer,
                customer_payment_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                customer_payment_status: req.query.status,
                customer_payment_delete_status: 0
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        if (customer_payment.length > 0) {
            const customer_payment_data = await Promise.all(customer_payment.map(async (row) => ({
                customer_payment_id: row.customer_payment_id,
                customer_payment_company: row.customer_payment_company,
                customer_payment_company_name: row.customer_payment_company <= 0 ? '' : row.company.company_name,
                customer_payment_branch: row.customer_payment_branch,
                customer_payment_branch_code: row.customer_payment_branch <= 0 ? '' : row.branch.branch_code,
                customer_payment_branch_name: row.customer_payment_branch <= 0 ? '' : row.branch.branch_name,
                customer_payment_customer: row.customer_payment_customer,
                customer_payment_customer_name: row.customer_payment_customer <= 0 ? '' : row.customer.customer_name,
                customer_payment_date: row.customer_payment_date,
                customer_payment_sales: row.customer_payment_sales,
                customer_payment_sales_invoice: row.customer_payment_sales_invoice,
                customer_payment_payable: row.customer_payment_payable,
                customer_payment_paid: row.customer_payment_paid,
                customer_payment_due: row.customer_payment_due,
                customer_payment_type: row.customer_payment_type,
                customer_payment_sales_reference_number: row.customer_payment_sales_reference_number,
                customer_payment_sales_payment_type: row.customer_payment_sales_payment_type,
                customer_payment_sales_payment_method: row.customer_payment_sales_payment_method,
                customer_payment_status: row.customer_payment_status,
            })));

            return res.send({
                status: "1",
                message: "Customer Collection Find Successfully!",
                data: customer_payment_data,
                company: company_data,
                branch: branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status: "0",
            message: "Customer Collection Not Found !",
            data: [],
            company: '',
            branch: '',
            customer: '',
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};

// Customer Due Report
exports.customer_due_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name: company_info.company_name,
            company_owner_name: company_info.company_owner_name,
            company_phone: company_info.company_phone,
            company_email: company_info.company_email,
            company_website: company_info.company_website,
            company_address: company_info.company_address,
            company_opening_date: company_info.company_opening_date,
            company_picture: company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code: branch_info <= 0 ? '' : branch_info.branch_code,
            branch_name: branch_info <= 0 ? '' : branch_info.branch_name,
            branch_phone: branch_info <= 0 ? '' : branch_info.branch_phone,
            branch_email: branch_info <= 0 ? '' : branch_info.branch_email,
            branch_address: branch_info <= 0 ? '' : branch_info.branch_address,
            branch_opening_date: branch_info <= 0 ? '' : branch_info.branch_opening_date,
            project_owner: branch_info <= 0 ? '' : branch_info.project_owner,
            type_of_work: branch_info <= 0 ? '' : branch_info.type_of_work,
            contract_value: branch_info <= 0 ? '' : branch_info.contract_value,
            milestore: branch_info <= 0 ? '' : branch_info.milestore,
            commencement_date: branch_info <= 0 ? '' : branch_info.commencement_date,
            handing_over_date: branch_info <= 0 ? '' : branch_info.handing_over_date,
            percentage_of_claiming_invoice: branch_info <= 0 ? '' : branch_info.percentage_of_claiming_invoice,
            attachment: branch_info <= 0 ? '' : branch_info.attachment,
            attach_quotation_and_invoice: branch_info <= 0 ? '' : branch_info.attach_quotation_and_invoice,
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name: customer_info <= 0 ? 'All' : customer_info.customer_name,
            customer_contact_person: customer_info <= 0 ? '' : customer_info.customer_contact_person,
            customer_phone_number: customer_info <= 0 ? '' : customer_info.customer_phone_number,
            customer_email: customer_info <= 0 ? '' : customer_info.customer_email,
            customer_address: customer_info <= 0 ? '' : customer_info.customer_address
        };

        const customer_due = await sales_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey: 'company_id',
                        sourceKey: "sales_company",
                        required: false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey: 'branch_id',
                        sourceKey: "sales_branch",
                        required: false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey: 'customer_id',
                        sourceKey: "sales_customer",
                        required: false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                sales_branch: req.query.branch,
                sales_customer: req.query.customer,
                sales_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                sales_payment_status: 'Due',
                sales_status: req.query.status,
                sales_delete_status: 0
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });

        if (customer_due.length > 0) {
            const customer_due_data = await Promise.all(customer_due.map(async (row) => ({
                sales_id: row.sales_id,
                sales_company: row.sales_company,
                sales_company_name: row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch: row.sales_branch,
                sales_branch_code: row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name: row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_customer: row.sales_customer,
                sales_customer_name: row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date: row.sales_date,
                sales_invoice: row.sales_invoice,
                sales_product_amount: row.sales_product_amount,
                sales_discount_percent: row.sales_discount_percent,
                sales_discount_amount: row.sales_discount_amount,
                sales_tax_percent: row.sales_tax_percent,
                sales_tax_amount: row.sales_tax_amount,
                sales_vat_percent: row.sales_vat_percent,
                sales_vat_amount: row.sales_vat_amount,
                sales_tax_vat_percent: row.sales_tax_vat_percent,
                sales_tax_vat_amount: row.sales_tax_vat_amount,
                sales_total_amount: row.sales_total_amount,
                sales_adjustment_amount: row.sales_adjustment_amount,
                sales_payable_amount: row.sales_payable_amount,
                sales_paid_amount: row.sales_paid_amount,
                sales_due_amount: row.sales_due_amount,
                sales_reference_number: row.sales_reference_number,
                sales_payment_type: row.sales_payment_type,
                sales_payment_method: row.sales_payment_method,
                sales_payment_status: row.sales_payment_status,
                sales_status: row.sales_status,
            })));

            return res.send({
                status: "1",
                message: "Customer Due Find Successfully!",
                data: customer_due_data,
                company: company_data,
                branch: branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status: "0",
            message: "Customer Due Not Found !",
            data: [],
            company: '',
            branch: '',
            customer: '',
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: [],
            });
    }
};