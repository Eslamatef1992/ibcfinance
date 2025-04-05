require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const sales_model           = db.sales_model;
const sales_details_model   = db.sales_details_model;
const product_model         = db.product_model;
const product_stock_model   = db.product_stock_model;
const customer_model        = db.customer_model;
const customer_payment_model= db.customer_payment_model;
const customer_payment_return_model= db.customer_payment_return_model;
const company_model         = db.company_model;
const branch_model          = db.branch_model;
const warehouse_model       = db.warehouse_model;
const product_unit_model    = db.product_unit_model;
const sales_return_model    = db.sales_return_model;
const sales_return_details_model = db.sales_return_details_model;
const sequelize                     = db.sequelize;
const Op                            = db.Sequelize.Op;
let user_id;

// Sales List
exports.sales_list = async (req, res) => {
    try {
        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    sales_branch: req.query.branch
                }),
                sales_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                sales_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    sales_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        sales_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        sales_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_total_purchase_amount: row.sales_total_purchase_amount,
                sales_total_profit_amount: row.sales_total_profit_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status
            })));

            return res.send({
                status: "1",
                message: "Sales Find Successfully!",
                data: sales_data
            });
        }

        return res.send({
            status: "0",
            message: "Sales Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales List Active
exports.sales_list_active = async (req, res) => {
    try {
        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    sales_branch: req.query.branch
                }),
                sales_status: 1,
                sales_delete_status: 0
            },
            order: [
                ['sales_date', 'DESC']
            ]
        });

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_total_purchase_amount: row.sales_total_purchase_amount,
                sales_total_profit_amount: row.sales_total_profit_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status
            })));

            return res.send({
                status: "1",
                message: "Sales Find Successfully!",
                data: sales_data
            });
        }
        return res.send({
            status: "0",
            message: "Sales Not Found !",
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

// Sales Search
exports.sales_search = async (req, res) => {
    try {
        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    sales_branch: req.query.branch
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        sales_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        sales_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{}),
                sales_status: 1,
                sales_delete_status: 0
            },
            limit: 10,
            order: [
                ['sales_date', 'DESC']
            ],
        });

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_total_purchase_amount: row.sales_total_purchase_amount,
                sales_total_profit_amount: row.sales_total_profit_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status
            })));

            return res.send({
                status: "1",
                message: "Sales Find Successfully!",
                data: sales_data
            });
        }
        return res.send({
            status: "0",
            message: "Sales Not Found !",
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

// Get Sales
exports.get_sales = async (req, res) => {
    try {
        const data = await sales_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name', 'customer_contact_person', 'customer_phone_number'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_id: req.params.sales_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Sales Not Found !",
                data: "",
            });

        }

        const getSalesDetails = async(sales_id) => {
            const details_data = await sales_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: sales_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "sales_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: sales_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "sales_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    sales_details_sales       : sales_id,
                    sales_details_status         : 1,
                    sales_details_delete_status  : 0
                },
                order: [
                    ['sales_details_id', 'ASC']
                ]
            });
            const sales_details_data = await Promise.all(details_data.map(async (row) => ({
                sales_details_id                    : row.sales_details_id,
                sales_details_sales                 : row.sales_details_sales,
                sales_details_product               : row.sales_details_product,
                sales_details_product_code          : row.product <= 0 ? '' : row.product.product_code,
                sales_details_product_name          : row.product <= 0 ? '' : row.product.product_name,
                sales_details_product_unit          : row.sales_details_product_unit,
                sales_details_product_unit_code     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                sales_details_product_unit_name     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                sales_details_unit_price            : row.sales_details_unit_price,
                sales_details_sales_quantity        : row.sales_details_sales_quantity,
                sales_details_return_quantity       : row.sales_details_return_quantity,
                sales_details_product_amount        : row.sales_details_product_amount,
                sales_details_discount_percent      : row.sales_details_discount_percent,
                sales_details_discount_amount       : row.sales_details_discount_amount,
                sales_details_tax_percent           : row.sales_details_tax_percent,
                sales_details_tax_amount            : row.sales_details_tax_amount,
                sales_details_vat_percent           : row.sales_details_vat_percent,
                sales_details_vat_amount            : row.sales_details_vat_amount,
                sales_details_tax_vat_percent       : row.sales_details_tax_vat_percent,
                sales_details_tax_vat_amount        : row.sales_details_tax_vat_amount,
                sales_details_sales_price           : row.sales_details_sales_price,
                sales_details_sales_amount          : row.sales_details_sales_amount,
                sales_details_purchase_price        : row.sales_details_purchase_price,
                sales_details_purchase_amount       : row.sales_details_purchase_amount,
                sales_details_profit_amount         : row.sales_details_profit_amount,
                sales_details_status                : row.sales_details_status,
            })));

            return sales_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Sales Find Successfully!",
            data: {
                sales_id                 : data.sales_id,
                sales_company            : data.sales_company,
                sales_company_name       : data.sales_company <= 0 ? '' : data.company.company_name,
                sales_branch             : data.sales_branch,
                sales_branch_code        : data.sales_branch <= 0 ? '' : data.branch.branch_code,
                sales_branch_name        : data.sales_branch <= 0 ? '' : data.branch.branch_name,
                sales_warehouse          : data.sales_warehouse,
                sales_warehouse_code     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                sales_warehouse_name     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                sales_customer           : data.sales_customer,
                sales_customer_name      : data.sales_customer <= 0 ? '' : data.customer.customer_name,
                sales_customer_contact_person      : data.sales_customer <= 0 ? '' : data.customer.customer_contact_person,
                sales_customer_phone      : data.sales_customer <= 0 ? '' : data.customer.customer_phone_number,
                sales_date               : data.sales_date,
                sales_invoice            : data.sales_invoice,
                sales_product_amount     : data.sales_product_amount,
                sales_discount_percent   : data.sales_discount_percent,
                sales_discount_amount    : data.sales_discount_amount,
                sales_tax_percent        : data.sales_tax_percent,
                sales_tax_amount         : data.sales_tax_amount,
                sales_vat_percent        : data.sales_vat_percent,
                sales_vat_amount         : data.sales_vat_amount,
                sales_tax_vat_percent    : data.sales_tax_vat_percent,
                sales_tax_vat_amount     : data.sales_tax_vat_amount,
                sales_total_amount       : data.sales_total_amount,
                sales_adjustment_amount  : data.sales_adjustment_amount,
                sales_payable_amount     : data.sales_payable_amount,
                sales_paid_amount        : data.sales_paid_amount,
                sales_due_amount         : data.sales_due_amount,
                sales_total_purchase_amount: data.sales_total_purchase_amount,
                sales_total_profit_amount: data.sales_total_profit_amount,
                sales_reference_number   : data.sales_reference_number,
                sales_payment_type       : data.sales_payment_type,
                sales_payment_method     : data.sales_payment_method,
                sales_payment_status     : data.sales_payment_status,
                sales_status             : data.sales_status,
                sales_details            : await getSalesDetails(data.sales_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Get Sales Invoice
exports.get_sales_invoice = async (req, res) => {
    try {
        const data = await sales_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                sales_branch: req.query.branch,
                sales_invoice: req.query.invoice
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Sales Not Found !",
                data: "",
            });

        }

        const getSalesDetails = async(sales_id) => {
            const details_data = await sales_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: sales_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "sales_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: sales_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "sales_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    sales_details_sales       : sales_id,
                    sales_details_status         : 1,
                    sales_details_delete_status  : 0
                },
                order: [
                    ['sales_details_id', 'ASC']
                ]
            });
            const sales_details_data = await Promise.all(details_data.map(async (row) => ({
                sales_details_id                    : row.sales_details_id,
                sales_details_sales                 : row.sales_details_sales,
                sales_details_product               : row.sales_details_product,
                sales_details_product_code          : row.product <= 0 ? '' : row.product.product_code,
                sales_details_product_name          : row.product <= 0 ? '' : row.product.product_name,
                sales_details_product_unit          : row.sales_details_product_unit,
                sales_details_product_unit_code     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                sales_details_product_unit_name     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                sales_details_unit_price            : row.sales_details_unit_price,
                sales_details_sales_quantity        : row.sales_details_sales_quantity,
                sales_details_return_quantity       : row.sales_details_return_quantity,
                sales_details_product_amount        : row.sales_details_product_amount,
                sales_details_discount_percent      : row.sales_details_discount_percent,
                sales_details_discount_amount       : row.sales_details_discount_amount,
                sales_details_tax_percent           : row.sales_details_tax_percent,
                sales_details_tax_amount            : row.sales_details_tax_amount,
                sales_details_vat_percent           : row.sales_details_vat_percent,
                sales_details_vat_amount            : row.sales_details_vat_amount,
                sales_details_tax_vat_percent       : row.sales_details_tax_vat_percent,
                sales_details_tax_vat_amount        : row.sales_details_tax_vat_amount,
                sales_details_sales_price           : row.sales_details_sales_price,
                sales_details_sales_amount          : row.sales_details_sales_amount,
                sales_details_purchase_price        : row.sales_details_purchase_price,
                sales_details_purchase_amount       : row.sales_details_purchase_amount,
                sales_details_profit_amount         : row.sales_details_profit_amount,
                sales_details_status                : row.sales_details_status,
            })));

            return sales_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Sales Find Successfully!",
            data: {
                sales_id                 : data.sales_id,
                sales_company            : data.sales_company,
                sales_company_name       : data.sales_company <= 0 ? '' : data.company.company_name,
                sales_branch             : data.sales_branch,
                sales_branch_code        : data.sales_branch <= 0 ? '' : data.branch.branch_code,
                sales_branch_name        : data.sales_branch <= 0 ? '' : data.branch.branch_name,
                sales_warehouse          : data.sales_warehouse,
                sales_warehouse_code     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                sales_warehouse_name     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                sales_customer           : data.sales_customer,
                sales_customer_name      : data.sales_customer <= 0 ? '' : data.customer.customer_name,
                sales_date               : data.sales_date,
                sales_invoice            : data.sales_invoice,
                sales_product_amount     : data.sales_product_amount,
                sales_discount_percent   : data.sales_discount_percent,
                sales_discount_amount    : data.sales_discount_amount,
                sales_tax_percent        : data.sales_tax_percent,
                sales_tax_amount         : data.sales_tax_amount,
                sales_vat_percent        : data.sales_vat_percent,
                sales_vat_amount         : data.sales_vat_amount,
                sales_tax_vat_percent    : data.sales_tax_vat_percent,
                sales_tax_vat_amount     : data.sales_tax_vat_amount,
                sales_total_amount       : data.sales_total_amount,
                sales_adjustment_amount  : data.sales_adjustment_amount,
                sales_payable_amount     : data.sales_payable_amount,
                sales_paid_amount        : data.sales_paid_amount,
                sales_due_amount         : data.sales_due_amount,
                sales_total_purchase_amount: data.sales_total_purchase_amount,
                sales_total_profit_amount: data.sales_total_profit_amount,
                sales_reference_number   : data.sales_reference_number,
                sales_payment_type       : data.sales_payment_type,
                sales_payment_method     : data.sales_payment_method,
                sales_payment_status     : data.sales_payment_status,
                sales_status             : data.sales_status,
                sales_details            : await getSalesDetails(data.sales_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Sales Create
exports.sales_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const sales_data         = req.body.sales_data;
        const sales_details_data = req.body.sales_details_data;


        const sales_date = new Date(sales_data.sales_date);
        const d_date    = sales_date.getDate();
        const m_date    = sales_date.getMonth()+1;
        const year      = sales_date.getFullYear().toString().substr(-2);

        let day; if (d_date < 10) { day = '0' + d_date;} else {day = d_date}
        let month; if (m_date < 10) { month = '0' + m_date;} else {month = m_date}

        const p_date = day+month+year;

        const sales_count = await sales_model.count({where: {sales_company: sales_data.sales_company, sales_branch: sales_data.sales_branch}})+1;
        const p_code = sales_count.toString().padStart(5, '0');
        const digit_numbers = p_date+""+p_code;
        let checkNumbers = 0;
        for (let i = 0; i < digit_numbers.length; i++) {
            const digit = parseFloat(digit_numbers[i]);
            if (i % 2 === 0) {
                checkNumbers += digit * 3;
            } else {
                checkNumbers += digit;
            }
        }
        const remainderNumbers = checkNumbers % 10;
        const checkDigit = remainderNumbers === 0 ? 0 : 10 - remainderNumbers;

        const sales_invoice = digit_numbers;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_branch:branch, product_stock_product:product } });
            if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const sales = await sales_model.create({
            sales_company            : sales_data.sales_company,
            sales_branch             : sales_data.sales_branch,
            sales_customer           : sales_data.sales_customer,
            sales_date               : sales_data.sales_date,
            sales_invoice            : sales_invoice,
            sales_warehouse          : sales_data.sales_warehouse,
            sales_product_amount     : sales_data.sales_product_amount,
            sales_discount_percent   : sales_data.sales_discount_percent,
            sales_discount_amount    : sales_data.sales_discount_amount,
            sales_tax_percent        : sales_data.sales_tax_percent,
            sales_tax_amount         : sales_data.sales_tax_amount,
            sales_vat_percent        : sales_data.sales_vat_percent,
            sales_vat_amount         : sales_data.sales_vat_amount,
            sales_tax_vat_percent    : parseFloat(sales_data.sales_tax_percent)+parseFloat(sales_data.sales_vat_percent),
            sales_tax_vat_amount     : parseFloat(sales_data.sales_tax_amount)+parseFloat(sales_data.sales_vat_amount),
            sales_total_amount       : sales_data.sales_total_amount,
            sales_adjustment_amount  : sales_data.sales_adjustment_amount,
            sales_payable_amount     : sales_data.sales_payable_amount,
            sales_paid_amount        : sales_data.sales_paid_amount,
            sales_due_amount         : sales_data.sales_due_amount,
            sales_total_purchase_amount : sales_data.sales_total_purchase_amount,
            sales_total_profit_amount   : sales_data.sales_total_profit_amount,
            sales_reference_number   : sales_data.sales_reference_number,
            sales_payment_type       : sales_data.sales_payment_type,
            sales_payment_method     : sales_data.sales_payment_method,
            sales_payment_status     : sales_data.sales_payment_status,
            sales_status             : sales_data.sales_status,
            sales_create_by          : user_id,
        });

        if(sales) {
            const salesDetails = await Promise.all(sales_details_data.map(async (row) => ({
                sales_details_company               : sales_data.sales_company,
                sales_details_branch                : sales_data.sales_branch,
                sales_details_customer              : sales_data.sales_customer,
                sales_details_sales_date            : row.sales_details_sales_date,
                sales_details_sales                 : sales.sales_id,
                sales_details_sales_invoice         : sales.sales_invoice,
                sales_details_warehouse             : sales_data.sales_warehouse,
                sales_details_product               : row.sales_details_product,
                sales_details_product_code          : row.sales_details_product_code,
                sales_details_product_name          : row.sales_details_product_name,
                sales_details_product_unit          : row.sales_details_product_unit,
                sales_details_unit_price            : row.sales_details_unit_price,
                sales_details_sales_quantity        : row.sales_details_sales_quantity,
                sales_details_product_amount        : row.sales_details_product_amount,
                sales_details_discount_percent      : row.sales_details_discount_percent,
                sales_details_discount_amount       : row.sales_details_discount_amount,
                sales_details_tax_percent           : row.sales_details_tax_percent,
                sales_details_tax_amount            : row.sales_details_tax_amount,
                sales_details_vat_percent           : row.sales_details_vat_percent,
                sales_details_vat_amount            : row.sales_details_vat_amount,
                sales_details_tax_vat_percent       : parseFloat(row.sales_details_tax_percent)+parseFloat(row.sales_details_vat_percent),
                sales_details_tax_vat_amount        : parseFloat(row.sales_details_tax_amount)+parseFloat(row.sales_details_vat_amount),
                sales_details_sales_price           : row.sales_details_sales_price,
                sales_details_sales_amount          : row.sales_details_sales_amount,
                sales_details_purchase_price        : row.sales_details_purchase_price,
                sales_details_purchase_amount       : row.sales_details_purchase_amount,
                sales_details_profit_amount         : row.sales_details_profit_amount,
                sales_details_status                : row.sales_details_status,
                sales_details_create_by             : user_id,
            })));

            const sales_details = await sales_details_model.bulkCreate(salesDetails);

            const productDataUpdate = await Promise.all(sales_details_data.map(async (item) => (
                await product_model.update({
                    product_sales_quantity          : parseFloat(await getProduct('sales_quantity', item.sales_details_product))+parseFloat(item.sales_details_sales_quantity),
                    product_stock_quantity          : parseFloat(await getProduct('stock_quantity', item.sales_details_product))-parseFloat(item.sales_details_sales_quantity),
                },
                {
                    where:{
                        product_id: item.sales_details_product
                    }
                }),
                await product_stock_model.findOne({
                    where:{
                        product_stock_product       : item.sales_details_product,
                        product_stock_company       : sales_data.sales_company,
                        product_stock_branch        : sales_data.sales_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })?
                await product_stock_model.update({
                    product_stock_sales_quantity: parseFloat(await getProductStock('sales_quantity', sales_data.sales_branch, item.sales_details_product))+parseFloat(item.sales_details_sales_quantity),
                    product_stock_in_stock: parseFloat(await getProductStock('stock_quantity', sales_data.sales_branch, item.sales_details_product))-parseFloat(item.sales_details_sales_quantity)
                },
                {
                    where:{
                        product_stock_product       : item.sales_details_product,
                        product_stock_company       : sales_data.sales_company,
                        product_stock_branch        : sales_data.sales_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                }) :
                await product_stock_model.create({
                    product_stock_product           : item.sales_details_product,
                    product_stock_company           : sales_data.sales_company,
                    product_stock_branch            : sales_data.sales_branch,
                    product_stock_sales_quantity    : parseFloat(item.sales_details_sales_quantity),
                    product_stock_in_stock          : parseFloat(item.sales_details_sales_quantity),
                    product_stock_status            : 1,
                    product_stock_delete_status     : 0,
                    product_stock_create_by         : user_id
                })
            )));

            const customer_data = await customer_model.findOne({
                where:{
                    customer_id: sales_data.sales_customer
                }
            });

            const customerUpdate = await customer_model.update({
                customer_sales: parseFloat(customer_data.customer_sales)+parseFloat(sales_data.sales_payable_amount),
                customer_paid: parseFloat(customer_data.customer_paid)+parseFloat(sales_data.sales_paid_amount),
                customer_due: parseFloat(customer_data.customer_due)+parseFloat(sales_data.sales_due_amount),
            },
            {
                where: {
                    customer_id:customer_data.customer_id
                }
            });

            // Customer Payment
            if(sales_data.sales_paid_amount > 0) {
                const customer_payment = await customer_payment_model.create({
                    customer_payment_date               : sales_data.sales_date,
                    customer_payment_company            : sales_data.sales_company,
                    customer_payment_branch             : sales_data.sales_branch,
                    customer_payment_sales              : sales.sales_id,
                    customer_payment_sales_invoice      : sales.sales_invoice,
                    customer_payment_customer           : sales_data.sales_customer,
                    customer_payment_payable            : sales_data.sales_payable_amount,
                    customer_payment_paid               : sales_data.sales_paid_amount,
                    customer_payment_due                : sales_data.sales_due_amount,
                    customer_payment_sales_reference_number   : sales_data.sales_reference_number,
                    customer_payment_sales_payment_type       : sales_data.sales_payment_type,
                    customer_payment_sales_payment_method     : sales_data.sales_payment_method,
                    customer_payment_status             : 1,
                    customer_payment_create_by          : user_id
                });
            };

            const data = await sales_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: sales_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "sales_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: sales_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "sales_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: sales_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "sales_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: customer_model,
                        attributes: ['customer_name'],
                        association: sales_model.hasOne(customer_model, {
                            foreignKey : 'customer_id',
                            sourceKey : "sales_customer",
                            required:false
                        }),
                    }
                ],
                where: {
                    sales_id: sales.sales_id
                },
            });

            const getSalesDetails = async(sales_id) => {
                const details_data = await sales_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: sales_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "sales_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: sales_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "sales_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        sales_details_sales       : sales_id,
                        sales_details_status         : 1,
                        sales_details_delete_status  : 0
                    },
                    order: [
                        ['sales_details_id', 'ASC']
                    ]
                });
                const sales_details_data = await Promise.all(details_data.map(async (row) => ({
                    sales_details_id                    : row.sales_details_id,
                    sales_details_sales                 : row.sales_details_sales,
                    sales_details_product               : row.sales_details_product,
                    sales_details_product_code          : row.product <= 0 ? '' : row.product.product_code,
                    sales_details_product_name          : row.product <= 0 ? '' : row.product.product_name,
                    sales_details_product_unit          : row.sales_details_product_unit,
                    sales_details_product_unit_code     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    sales_details_product_unit_name     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    sales_details_unit_price            : row.sales_details_unit_price,
                    sales_details_sales_quantity        : row.sales_details_sales_quantity,
                    sales_details_product_amount        : row.sales_details_product_amount,
                    sales_details_discount_percent      : row.sales_details_discount_percent,
                    sales_details_discount_amount       : row.sales_details_discount_amount,
                    sales_details_tax_percent           : row.sales_details_tax_percent,
                    sales_details_tax_amount            : row.sales_details_tax_amount,
                    sales_details_vat_percent           : row.sales_details_vat_percent,
                    sales_details_vat_amount            : row.sales_details_vat_amount,
                    sales_details_tax_vat_percent       : row.sales_details_tax_vat_percent,
                    sales_details_tax_vat_amount        : row.sales_details_tax_vat_amount,
                    sales_details_sales_price           : row.sales_details_sales_price,
                    sales_details_sales_amount          : row.sales_details_sales_amount,
                    sales_details_purchase_price        : row.sales_details_purchase_price,
                    sales_details_purchase_amount       : row.sales_details_purchase_amount,
                    sales_details_profit_amount         : row.sales_details_profit_amount,
                    sales_details_status                : row.sales_details_status
                })));

                return sales_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Sales Create Successfully!",
                data: {
                    sales_id                 : data.sales_id,
                    sales_company            : data.sales_company,
                    sales_company_name       : data.sales_company <= 0 ? '' : data.company.company_name,
                    sales_branch             : data.sales_branch,
                    sales_branch_code        : data.sales_branch <= 0 ? '' : data.branch.branch_code,
                    sales_branch_name        : data.sales_branch <= 0 ? '' : data.branch.branch_name,
                    sales_warehouse          : data.sales_warehouse,
                    sales_warehouse_code     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    sales_warehouse_name     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    sales_customer           : data.sales_customer,
                    sales_customer_name      : data.sales_customer <= 0 ? '' : data.customer.customer_name,
                    sales_date               : data.sales_date,
                    sales_invoice            : data.sales_invoice,
                    sales_product_amount     : data.sales_product_amount,
                    sales_discount_percent   : data.sales_discount_percent,
                    sales_discount_amount    : data.sales_discount_amount,
                    sales_tax_percent        : data.sales_tax_percent,
                    sales_tax_amount         : data.sales_tax_amount,
                    sales_vat_percent        : data.sales_vat_percent,
                    sales_vat_amount         : data.sales_vat_amount,
                    sales_tax_vat_percent    : data.sales_tax_vat_percent,
                    sales_tax_vat_amount     : data.sales_tax_vat_amount,
                    sales_total_amount       : data.sales_total_amount,
                    sales_adjustment_amount  : data.sales_adjustment_amount,
                    sales_payable_amount     : data.sales_payable_amount,
                    sales_paid_amount        : data.sales_paid_amount,
                    sales_due_amount         : data.sales_due_amount,
                    sales_total_purchase_amount: data.sales_total_purchase_amount,
                    sales_total_profit_amount: data.sales_total_profit_amount,
                    sales_reference_number   : data.sales_reference_number,
                    sales_payment_type       : data.sales_payment_type,
                    sales_payment_method     : data.sales_payment_method,
                    sales_payment_status     : data.sales_payment_status,
                    sales_status             : data.sales_status,
                    sales_details            : await getSalesDetails(data.sales_id)
                }
            });
        }

        return res.send({
            status: "0",
            message: "Sales Create Error !",
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

// Sales Update
exports.sales_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const sales = await sales_model.findOne({
            where:{
                sales_id: req.params.sales_id
            }
        });

        if(!sales) {
            return res.send({
                status: "0",
                message: "Sales ID Not Found!",
                data: "",
            });
        }

        const sales_data         = req.body.sales_data;
        const sales_details_data = req.body.sales_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_stock_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }
        const sales_update = await sales_model.update({
            sales_company            : sales_data.sales_company,
            sales_branch             : sales_data.sales_branch,
            sales_customer           : sales_data.sales_customer,
            sales_date               : sales_data.sales_date,
            sales_warehouse          : sales_data.sales_warehouse,
            sales_product_amount     : sales_data.sales_product_amount,
            sales_discount_percent   : sales_data.sales_discount_percent,
            sales_discount_amount    : sales_data.sales_discount_amount,
            sales_tax_percent        : sales_data.sales_tax_percent,
            sales_tax_amount         : sales_data.sales_tax_amount,
            sales_vat_percent        : sales_data.sales_vat_percent,
            sales_vat_amount         : sales_data.sales_vat_amount,
            sales_tax_vat_percent    : parseFloat(sales_data.sales_tax_percent)+parseFloat(sales_data.sales_vat_percent),
            sales_tax_vat_amount     : parseFloat(sales_data.sales_tax_amount)+parseFloat(sales_data.sales_vat_amount),
            sales_total_amount       : sales_data.sales_total_amount,
            sales_adjustment_amount  : sales_data.sales_adjustment_amount,
            sales_payable_amount     : sales_data.sales_payable_amount,
            sales_paid_amount        : sales_data.sales_paid_amount,
            sales_due_amount         : sales_data.sales_due_amount,
            sales_total_purchase_amount : sales_data.sales_total_purchase_amount,
            sales_total_profit_amount   : sales_data.sales_total_profit_amount,
            sales_reference_number   : sales_data.sales_reference_number,
            sales_payment_type       : sales_data.sales_payment_type,
            sales_payment_method     : sales_data.sales_payment_method,
            sales_payment_status     : sales_data.sales_payment_status,
            sales_status             : sales_data.sales_status,
            sales_update_by          : user_id,
        },
        {
            where:{
                sales_id: req.params.sales_id
            }
        });
        if(sales_update) {
            const sales_details_delete = await sales_details_model.destroy({
                where: {
                    sales_details_sales: req.params.sales_id
                }
            });

            const salesDetails = await Promise.all(sales_details_data.map(async (row) => ({
                sales_details_company               : sales_data.sales_company,
                sales_details_branch                : sales_data.sales_branch,
                sales_details_customer              : sales_data.sales_customer,
                sales_details_sales_date            : row.sales_details_sales_date,
                sales_details_sales                 : sales.sales_id,
                sales_details_sales_invoice         : sales.sales_invoice,
                sales_details_warehouse             : sales_data.sales_warehouse,
                sales_details_product               : row.sales_details_product,
                sales_details_product_code          : row.sales_details_product_code,
                sales_details_product_name          : row.sales_details_product_name,
                sales_details_product_unit          : row.sales_details_product_unit,
                sales_details_unit_price            : row.sales_details_unit_price,
                sales_details_sales_quantity        : row.sales_details_sales_quantity,
                sales_details_product_amount        : row.sales_details_product_amount,
                sales_details_discount_percent      : row.sales_details_discount_percent,
                sales_details_discount_amount       : row.sales_details_discount_amount,
                sales_details_tax_percent           : row.sales_details_tax_percent,
                sales_details_tax_amount            : row.sales_details_tax_amount,
                sales_details_vat_percent           : row.sales_details_vat_percent,
                sales_details_vat_amount            : row.sales_details_vat_amount,
                sales_details_tax_vat_percent       : parseFloat(row.sales_details_tax_percent)+parseFloat(row.sales_details_vat_percent),
                sales_details_tax_vat_amount        : parseFloat(row.sales_details_tax_amount)+parseFloat(row.sales_details_vat_amount),
                sales_details_sales_price           : row.sales_details_sales_price,
                sales_details_sales_amount          : row.sales_details_sales_amount,
                sales_details_purchase_price        : row.sales_details_purchase_price,
                sales_details_purchase_amount       : row.sales_details_purchase_amount,
                sales_details_profit_amount         : row.sales_details_profit_amount,
                sales_details_status                : row.sales_details_status,
                sales_details_create_by             : user_id,
            })));
            const sales_details = await sales_details_model.bulkCreate(salesDetails);

            const productDataUpdate = await Promise.all(sales_details_data.map(async (item) => (
                await product_model.update({
                    product_sales_price         : item.sales_details_sales_price,
                    product_sales_quantity      : (parseFloat(await getProduct('sales_quantity', item.sales_details_product))-parseFloat(item.sales_details_previous_quantity))+parseFloat(item.sales_details_sales_quantity),
                    product_stock_quantity      : (
                        parseFloat(await getProduct('purchase_quantity', item.sales_details_product))
                        -(
                            (
                                (
                                    parseFloat(await getProduct('return_quantity', item.sales_details_product))
                                    + (parseFloat(await getProduct('sales_quantity', item.sales_details_product))-parseFloat(item.sales_details_previous_quantity))+parseFloat(item.sales_details_sales_quantity)
                                )-
                                parseFloat(await getProduct('sales_return_quantity', item.sales_details_product))
                            )
                        )
                    )
                    
                    
                    // parseFloat(await getProduct('purchase_quantity', item.sales_details_product))-((parseFloat(await getProduct('sales_quantity', item.sales_details_product))-(parseFloat(item.sales_details_previous_quantity))+parseFloat(item.sales_details_sales_quantity))+parseFloat(await getProduct('return_quantity', item.sales_details_product))+parseFloat(await getProduct('sales_return_quantity', item.sales_details_product))),
                },
                {
                    where:{
                        product_id: item.sales_details_product
                    }
                }),
                await product_stock_model.update({
                    product_stock_sales_quantity    : (parseFloat(await getProductStock('sales_quantity', sales_data.sales_company, sales_data.sales_branch, item.sales_details_product))-parseFloat(item.sales_details_previous_quantity))+parseFloat(item.sales_details_sales_quantity),
                    product_stock_in_stock          : (
                        parseFloat(await getProductStock('purchase_quantity', sales_data.sales_company, sales_data.sales_branch, item.sales_details_product))
                        -(
                            (parseFloat(await getProductStock('return_quantity', sales_data.sales_company, sales_data.sales_branch, item.sales_details_product))
                            +
                            (parseFloat(await getProductStock('sales_quantity', sales_data.sales_company, sales_data.sales_branch, item.sales_details_product))-parseFloat(item.sales_details_previous_quantity))+parseFloat(item.sales_details_sales_quantity)
                            )
                            -parseFloat(await getProductStock('sales_return_quantity', sales_data.sales_company, sales_data.sales_branch, item.sales_details_product))
                        )
                    )
                },
                {
                    where:{
                        product_stock_product       : item.sales_details_product,
                        product_stock_company       : sales_data.sales_company,
                        product_stock_branch        : sales_data.sales_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const customer_data = await customer_model.findOne({
                where:{
                    customer_id: sales_data.sales_customer
                }
            });

            const customerUpdate = await customer_model.update({
                customer_sales  : (parseFloat(customer_data.customer_sales)-parseFloat(sales_data.sales_previous_payable_amount))+parseFloat(sales_data.sales_payable_amount),
                customer_paid   : (parseFloat(customer_data.customer_paid)-parseFloat(sales_data.sales_previous_paid_amount))+parseFloat(sales_data.sales_paid_amount),
                customer_due    : (parseFloat(customer_data.customer_due)-parseFloat(sales_data.sales_previous_due_amount))+parseFloat(sales_data.sales_due_amount),
            },
            {
                where: {
                    customer_id:customer_data.customer_id
                }
            });

            const customer_payment_delete = await customer_payment_model.destroy({
                where: {
                    customer_payment_sales: req.params.sales_id
                }
            });

            // Customer Payment
            if(sales_data.sales_paid_amount > 0) {
                const customer_payment = await customer_payment_model.create({
                    customer_payment_date               : sales_data.sales_date,
                    customer_payment_company            : sales_data.sales_company,
                    customer_payment_branch             : sales_data.sales_branch,
                    customer_payment_sales              : sales.sales_id,
                    customer_payment_sales_invoice      : sales.sales_invoice,
                    customer_payment_customer           : sales_data.sales_customer,
                    customer_payment_payable            : sales_data.sales_payable_amount,
                    customer_payment_paid               : sales_data.sales_paid_amount,
                    customer_payment_due                : sales_data.sales_due_amount,
                    customer_payment_sales_reference_number   : sales_data.sales_reference_number,
                    customer_payment_sales_payment_type       : sales_data.sales_payment_type,
                    customer_payment_sales_payment_method     : sales_data.sales_payment_method,
                    customer_payment_status             : 1,
                    customer_payment_create_by          : user_id
                });
            };

            const data = await sales_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: sales_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "sales_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: sales_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "sales_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: sales_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "sales_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: customer_model,
                        attributes: ['customer_name'],
                        association: sales_model.hasOne(customer_model, {
                            foreignKey : 'customer_id',
                            sourceKey : "sales_customer",
                            required:false
                        }),
                    }
                ],
                where: {
                    sales_id: req.params.sales_id
                },
            });

            const getSalesDetails = async(sales_id) => {
                const details_data = await sales_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: sales_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "sales_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: sales_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "sales_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        sales_details_sales       : sales_id,
                        sales_details_status         : 1,
                        sales_details_delete_status  : 0
                    },
                    order: [
                        ['sales_details_id', 'ASC']
                    ]
                });
                const sales_details_data = await Promise.all(details_data.map(async (row) => ({
                    sales_details_id                    : row.sales_details_id,
                    sales_details_sales                 : row.sales_details_sales,
                    sales_details_product               : row.sales_details_product,
                    sales_details_product_code          : row.product <= 0 ? '' : row.product.product_code,
                    sales_details_product_name          : row.product <= 0 ? '' : row.product.product_name,
                    sales_details_product_unit          : row.sales_details_product_unit,
                    sales_details_product_unit_code     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    sales_details_product_unit_name     : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    sales_details_unit_price            : row.sales_details_unit_price,
                    sales_details_sales_quantity        : row.sales_details_sales_quantity,
                    sales_details_product_amount        : row.sales_details_product_amount,
                    sales_details_discount_percent      : row.sales_details_discount_percent,
                    sales_details_discount_amount       : row.sales_details_discount_amount,
                    sales_details_tax_percent           : row.sales_details_tax_percent,
                    sales_details_tax_amount            : row.sales_details_tax_amount,
                    sales_details_vat_percent           : row.sales_details_vat_percent,
                    sales_details_vat_amount            : row.sales_details_vat_amount,
                    sales_details_tax_vat_percent       : row.sales_details_tax_vat_percent,
                    sales_details_tax_vat_amount        : row.sales_details_tax_vat_amount,
                    sales_details_sales_price           : row.sales_details_sales_price,
                    sales_details_sales_amount          : row.sales_details_sales_amount,
                    sales_details_purchase_price        : row.sales_details_purchase_price,
                    sales_details_purchase_amount       : row.sales_details_purchase_amount,
                    sales_details_profit_amount         : row.sales_details_profit_amount,
                    sales_details_status                : row.sales_details_status,
                })));

                return sales_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Sales Update Successfully!",
                data: {
                    sales_id                 : data.sales_id,
                    sales_company            : data.sales_company,
                    sales_company_name       : data.sales_company <= 0 ? '' : data.company.company_name,
                    sales_branch             : data.sales_branch,
                    sales_branch_code        : data.sales_branch <= 0 ? '' : data.branch.branch_code,
                    sales_branch_name        : data.sales_branch <= 0 ? '' : data.branch.branch_name,
                    sales_warehouse          : data.sales_warehouse,
                    sales_warehouse_code     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    sales_warehouse_name     : data.sales_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    sales_customer           : data.sales_customer,
                    sales_customer_name      : data.sales_customer <= 0 ? '' : data.customer.customer_name,
                    sales_date               : data.sales_date,
                    sales_invoice            : data.sales_invoice,
                    sales_product_amount     : data.sales_product_amount,
                    sales_discount_percent   : data.sales_discount_percent,
                    sales_discount_amount    : data.sales_discount_amount,
                    sales_tax_percent        : data.sales_tax_percent,
                    sales_tax_amount         : data.sales_tax_amount,
                    sales_vat_percent        : data.sales_vat_percent,
                    sales_vat_amount         : data.sales_vat_amount,
                    sales_tax_vat_percent    : data.sales_tax_vat_percent,
                    sales_tax_vat_amount     : data.sales_tax_vat_amount,
                    sales_total_amount       : data.sales_total_amount,
                    sales_adjustment_amount  : data.sales_adjustment_amount,
                    sales_payable_amount     : data.sales_payable_amount,
                    sales_paid_amount        : data.sales_paid_amount,
                    sales_due_amount         : data.sales_due_amount,
                    sales_total_purchase_amount: data.sales_total_purchase_amount,
                    sales_total_profit_amount: data.sales_total_profit_amount,
                    sales_reference_number   : data.sales_reference_number,
                    sales_payment_type       : data.sales_payment_type,
                    sales_payment_method     : data.sales_payment_method,
                    sales_payment_status     : data.sales_payment_status,
                    sales_status             : data.sales_status,
                    sales_details            : await getSalesDetails(data.sales_id)
                }
            });
        }
        return res.send({
            status: "1",
            message: "Sales Update Error!",
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

// Sales Delete
exports.sales_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const sales_data = await sales_model.findOne({
            where:{
                sales_id: req.params.sales_id
            }
        });

        if(!sales_data) {
            return res.send({
                status: "0",
                message: "Sales ID Not Found!",
                data: "",
            });
        }

        const sales = await sales_model.update({
            sales_status        : 0,
            sales_delete_status : 1,
            sales_delete_by     : user_id,
            sales_delete_at     : new Date(),
        },
        {
            where:{
                sales_id: req.params.sales_id
            }
        });

        return res.send({
            status: "1",
            message: "Sales Delete Successfully!",
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

// Sales Return List
exports.sales_return_list = async (req, res) => {
    try {
        const sales = await sales_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_return_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    sales_return_branch: req.query.branch
                }),
                sales_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                sales_return_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    sales_return_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        sales_return_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        sales_return_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        if(sales.length > 0) {
            const sales_return_data = await Promise.all(sales.map(async (row) => ({
                sales_return_id                 : row.sales_return_id,
                sales_return_company            : row.sales_return_company,
                sales_return_company_name       : row.sales_return_company <= 0 ? '' : row.company.company_name,
                sales_return_branch             : row.sales_return_branch,
                sales_return_branch_code        : row.sales_return_branch <= 0 ? '' : row.branch.branch_code,
                sales_return_branch_name        : row.sales_return_branch <= 0 ? '' : row.branch.branch_name,
                sales_return_warehouse          : row.sales_return_warehouse,
                sales_return_warehouse_code     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_return_warehouse_name     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_return_customer           : row.sales_return_customer,
                sales_return_customer_name      : row.sales_return_customer <= 0 ? '' : row.customer.customer_name,
                sales_return_date               : row.sales_return_date,
                sales_return_sales           : row.sales_return_sales,
                sales_return_sales_invoice   : row.sales_return_sales_invoice,
                sales_return_total_amount       : row.sales_return_total_amount,
                sales_return_adjustment_amount  : row.sales_return_adjustment_amount,
                sales_return_payable_amount     : row.sales_return_payable_amount,
                sales_return_paid_amount        : row.sales_return_paid_amount,
                sales_return_due_amount         : row.sales_return_due_amount,
                sales_return_reference_number   : row.sales_return_reference_number,
                sales_return_payment_type       : row.sales_return_payment_type,
                sales_return_payment_method     : row.sales_return_payment_method,
                sales_return_payment_status     : row.sales_return_payment_status,
                sales_return_status             : row.sales_return_status,
            })));

            return res.send({
                status: "1",
                message: "Sales Return Find Successfully!",
                data: sales_return_data
            });
        }

        return res.send({
            status: "0",
            message: "Sales Return Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Sales Return
exports.get_sales_return = async (req, res) => {
    try {
        const data = await sales_return_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name', 'customer_contact_person', 'customer_phone_number'],
                    association: sales_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_return_id: req.params.sales_return_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Sales Return Not Found !",
                data: "",
            });

        }

        const getSalesReturnDetails = async(sales_return_id) => {
            const details_data = await sales_return_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: sales_return_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "sales_return_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: sales_return_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "sales_return_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    sales_return_details_sales_return: sales_return_id,
                    sales_return_details_status         : 1,
                    sales_return_details_delete_status  : 0
                },
                order: [
                    ['sales_return_details_id', 'ASC']
                ]
            });
            const sales_return_details_data = await Promise.all(details_data.map(async (row) => ({
                sales_return_details_id                     : row.sales_return_details_id,
                sales_return_details_sales_return           : row.sales_return_details_sales_return,
                sales_return_details_sales                  : row.sales_return_details_sales,
                sales_return_details_product                : row.sales_return_details_product,
                sales_return_details_product_code           : row.product <= 0 ? '' : row.product.product_code,
                sales_return_details_product_name           : row.product <= 0 ? '' : row.product.product_name,
                sales_return_details_product_unit           : row.sales_return_details_product_unit,
                sales_return_details_product_unit_code      : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                sales_return_details_product_unit_name      : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,

                sales_return_details_sales_price            : row.sales_return_details_sales_price,
                sales_return_details_sales_quantity         : row.sales_return_details_sales_quantity,
                sales_return_details_sales_amount           : row.sales_return_details_sales_amount,
                sales_return_details_return_price           : row.sales_return_details_return_price,
                sales_return_details_return_quantity        : row.sales_return_details_return_quantity,
                sales_return_details_return_amount          : row.sales_return_details_return_amount
            })));

            return sales_return_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Sales Return Find Successfully!",
            data: {
                sales_return_id                 : data.sales_return_id,
                sales_return_company            : data.sales_return_company,
                sales_return_company_name       : data.sales_return_company <= 0 ? '' : data.company.company_name,
                sales_return_branch             : data.sales_return_branch,
                sales_return_branch_code        : data.sales_return_branch <= 0 ? '' : data.branch.branch_code,
                sales_return_branch_name        : data.sales_return_branch <= 0 ? '' : data.branch.branch_name,
                sales_return_warehouse          : data.sales_return_warehouse,
                sales_return_warehouse_code     : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                sales_return_warehouse_name     : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                sales_return_customer           : data.sales_return_customer,
                sales_return_customer_name      : data.sales_return_customer <= 0 ? '' : data.customer.customer_name,
                sales_return_customer_contact_person      : data.sales_return_customer <= 0 ? '' : data.customer.customer_contact_person,
                sales_return_customer_phone      : data.sales_return_customer <= 0 ? '' : data.customer.customer_phone_number,
                sales_return_sales_date         : data.sales_return_sales_date,
                sales_return_date               : data.sales_return_date,
                sales_return_sales              : data.sales_return_sales,
                sales_return_sales_invoice      : data.sales_return_sales_invoice,
                sales_return_total_amount       : data.sales_return_total_amount,
                sales_return_adjustment_amount  : data.sales_return_adjustment_amount,
                sales_return_payable_amount     : data.sales_return_payable_amount,
                sales_return_paid_amount        : data.sales_return_paid_amount,
                sales_return_due_amount         : data.sales_return_due_amount,
                sales_return_reference_number   : data.sales_return_reference_number || '',
                sales_return_payment_type       : data.sales_return_payment_type,
                sales_return_payment_method     : data.sales_return_payment_method,
                sales_return_payment_status     : data.sales_return_payment_status,
                sales_return_status             : data.sales_return_status,
                sales_return_details            : await getSalesReturnDetails(data.sales_return_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Sales Return Create
exports.sales_return_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const sales_return_data          = req.body.sales_return_data;
        const sales_return_details_data  = req.body.sales_return_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else if(type == 'sales_return_quantity') {
                return get_product.product_stock_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const getSalesDetailsData = async(type, company, branch, sales, product) => {
            const get_product = await sales_details_model.findOne({where:{ sales_details_company : company, sales_details_branch : branch, sales_details_sales : sales, sales_details_product : product }});
            if(type == 'sales_quantity') {
                return get_product.sales_details_sales_quantity;
            } else if(type == 'sales_return_quantity') {
                return get_product.sales_details_return_quantity;
            } else  if(type == 'previous_stock') {
                return get_product.sales_details_previous_stock;
            } else  if(type == 'current_stock') {
                return get_product.sales_details_current_stock;
            }
        }

        const sales_return = await sales_return_model.create({
            sales_return_company             : sales_return_data.sales_return_company,
            sales_return_branch              : sales_return_data.sales_return_branch,
            sales_return_customer            : sales_return_data.sales_return_customer,
            sales_return_warehouse           : sales_return_data.sales_return_warehouse,
            sales_return_sales            : sales_return_data.sales_return_sales,
            sales_return_sales_invoice    : sales_return_data.sales_return_sales_invoice,
            sales_return_sales_date       : sales_return_data.sales_return_sales_date,
            sales_return_date                : sales_return_data.sales_return_date,
            sales_return_total_amount        : sales_return_data.sales_return_total_amount,
            sales_return_adjustment_amount   : sales_return_data.sales_return_adjustment_amount,
            sales_return_payable_amount      : sales_return_data.sales_return_payable_amount,
            sales_return_paid_amount         : sales_return_data.sales_return_paid_amount,
            sales_return_due_amount          : sales_return_data.sales_return_due_amount,
            sales_return_reference_number    : sales_return_data.sales_return_reference_number,
            sales_return_payment_type        : sales_return_data.sales_return_payment_type,
            sales_return_payment_method      : sales_return_data.sales_return_payment_method,
            sales_return_payment_status      : sales_return_data.sales_return_payment_status,
            sales_return_status              : sales_return_data.sales_return_status,
            sales_return_create_by           : user_id,
        });

        if(sales_return) {
            const salesReturnDetails = await Promise.all(sales_return_details_data.map(async (row) => ({
                sales_return_details_company             : sales_return_data.sales_return_company,
                sales_return_details_branch              : sales_return_data.sales_return_branch,
                sales_return_details_customer            : sales_return_data.sales_return_customer,
                sales_return_details_warehouse           : sales_return_data.sales_return_warehouse,
                sales_return_details_sales            : sales_return_data.sales_return_sales,
                sales_return_details_sales_invoice    : sales_return_data.sales_return_sales_invoice,
                sales_return_details_sales_date       : sales_return_data.sales_return_sales_date,
                sales_return_details_return_date         : sales_return_data.sales_return_date,
                sales_return_details_sales_return     : sales_return.sales_return_id,
                sales_return_details_product             : row.sales_return_details_product,
                sales_return_details_product_code        : row.sales_return_details_product_code,
                sales_return_details_product_name        : row.sales_return_details_product_name,
                sales_return_details_product_unit        : row.sales_return_details_product_unit,
                sales_return_details_sales_price      : row.sales_return_details_sales_price,
                sales_return_details_sales_quantity   : row.sales_return_details_sales_quantity,
                sales_return_details_sales_amount     : row.sales_return_details_sales_amount,
                sales_return_details_return_price        : row.sales_return_details_return_price,
                sales_return_details_return_quantity     : row.sales_return_details_return_quantity,
                sales_return_details_return_amount       : row.sales_return_details_return_amount,
                sales_return_details_status              : sales_return_data.sales_return_status,
                sales_return_details_create_by           : user_id,
            })));
            const sales_return_details = await sales_return_details_model.bulkCreate(salesReturnDetails);

            const productDataUpdate = await Promise.all(sales_return_details_data.map(async (item) => (
                await product_model.update({
                    product_sales_return_quantity       : parseFloat(await getProduct('sales_return_quantity', item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity),
                    product_stock_quantity              : parseFloat(await getProduct('stock_quantity', item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity),
                },
                {
                    where:{
                        product_id: item.sales_return_details_product
                    }
                }),
                await sales_details_model.update({
                    sales_details_return_quantity   : parseFloat(await getSalesDetailsData('sales_return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, sales_return_data.sales_return_sales, item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity),
                    sales_details_current_stock     : parseFloat(await getSalesDetailsData('current_stock', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, sales_return_data.sales_return_sales, item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity),
                },
                {
                    where:{
                        sales_details_company       : sales_return_data.sales_return_company,
                        sales_details_branch        : sales_return_data.sales_return_branch,
                        sales_details_sales         : sales_return_data.sales_return_sales,
                        sales_details_product       : item.sales_return_details_product
                    }
                }),
                await product_stock_model.update({
                    product_stock_sales_return_quantity: parseFloat(await getProductStock('sales_return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity),
                    product_stock_in_stock          : parseFloat(await getProductStock('stock_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product))+parseFloat(item.sales_return_details_return_quantity)
                },
                {
                    where:{
                        product_stock_company       : sales_return_data.sales_return_company,
                        product_stock_branch        : sales_return_data.sales_return_branch,
                        product_stock_product       : item.sales_return_details_product,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const customer_data = await customer_model.findOne({
                where:{
                    customer_id: sales_return_data.sales_return_customer
                }
            });

            // Customer Payment Return
            if(sales_return_data.sales_return_payable_amount>0){
                const customerUpdate = await customer_model.update({
                    customer_return         : parseFloat(customer_data.customer_return)+parseFloat(sales_return_data.sales_return_payable_amount),
                    customer_return_paid    : parseFloat(customer_data.customer_return_paid)+parseFloat(sales_return_data.sales_return_paid_amount),
                    customer_return_due     : parseFloat(customer_data.customer_return_due)+parseFloat(sales_return_data.sales_return_due_amount),
                },
                {
                    where: {
                        customer_id:customer_data.customer_id
                    }
                });

                const customer_payment_return = await customer_payment_return_model.create({
                    customer_payment_return_date                : sales_return_data.sales_return_date,
                    customer_payment_return_company             : sales_return_data.sales_return_company,
                    customer_payment_return_branch              : sales_return_data.sales_return_branch,
                    customer_payment_return_sales               : sales_return_data.sales_return_sales,
                    customer_payment_return_sales_invoice       : sales_return_data.sales_return_sales_invoice,
                    customer_payment_return_sales_return        : sales_return.sales_return_id,
                    customer_payment_return_customer            : sales_return_data.sales_return_customer,
                    customer_payment_return_payable             : sales_return_data.sales_return_payable_amount,
                    customer_payment_return_paid                : sales_return_data.sales_return_paid_amount,
                    customer_payment_return_due                 : sales_return_data.sales_return_due_amount,
                    customer_payment_return_type                : 'Return',

                    customer_payment_return_sales_reference_number    : sales_return_data.sales_return_reference_number,
                    customer_payment_return_sales_payment_type        : sales_return_data.sales_return_payment_type,
                    customer_payment_return_sales_payment_method      : sales_return_data.sales_return_payment_method,
                    customer_payment_return_status              : 1,
                    customer_payment_return_create_by           : user_id
                });
            };
    
            const data = await sales_return_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: sales_return_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "sales_return_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: sales_return_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "sales_return_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: sales_return_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "sales_return_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: customer_model,
                        attributes: ['customer_name'],
                        association: sales_return_model.hasOne(customer_model, {
                            foreignKey : 'customer_id',
                            sourceKey : "sales_return_customer",
                            required:false
                        }),
                    }
                ],
                where: {
                    sales_return_id: sales_return.sales_return_id
                },
            });
    
            const getSalesDetails = async(sales_return_id) => {
                const details_data = await sales_return_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: sales_return_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "sales_return_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: sales_return_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "sales_return_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        sales_return_details_sales       : sales_return_id,
                        sales_return_details_status         : 1,
                        sales_return_details_delete_status  : 0
                    },
                    order: [
                        ['sales_return_details_id', 'ASC']
                    ]
                });
                const sales_return_details_data = await Promise.all(details_data.map(async (row) => ({
                    sales_return_details_id                  : row.sales_return_details_id,
                    sales_return_details_sales            : row.sales_return_details_sales,
                    sales_return_details_sales_return     : row.sales_return_details_sales_return,
                    sales_return_details_sales_date       : row.sales_return_details_sales_date,
                    sales_return_details_return_date         : row.sales_return_details_return_date,
                    sales_return_details_product             : row.sales_return_details_product,
                    sales_return_details_product_code        : row.product <= 0 ? '' : row.product.product_code,
                    sales_return_details_product_name        : row.product <= 0 ? '' : row.product.product_name,
                    sales_return_details_product_unit        : row.sales_return_details_product_unit,
                    sales_return_details_product_unit_code   : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    sales_return_details_product_unit_name   : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    sales_return_details_sales_price      : row.sales_return_details_sales_price,
                    sales_return_details_sales_quantity   : row.sales_return_details_sales_quantity,
                    sales_return_details_sales_amount     : row.sales_return_details_sales_amount,
                    sales_return_details_return_price        : row.sales_return_details_return_price,
                    sales_return_details_return_quantity     : row.sales_return_details_return_quantity,
                    sales_return_details_return_amount       : row.sales_return_details_return_amount,
                    sales_return_details_reference_number    : row.sales_return_details_reference_number,
                    sales_return_details_payment_type        : row.sales_return_details_payment_type,
                    sales_return_details_payment_method      : row.sales_return_details_payment_method,
                })));
    
                return sales_return_details_data || [];
            }
    
            return res.send({
                status: "1",
                message: "Sales Return Successfully!",
                data: {
                    sales_return_id                  : data.sales_return_id,
                    sales_return_company             : data.sales_return_company,
                    sales_return_company_name        : data.sales_return_company <= 0 ? '' : data.company.company_name,
                    sales_return_branch              : data.sales_return_branch,
                    sales_return_branch_code         : data.sales_return_branch <= 0 ? '' : data.branch.branch_code,
                    sales_return_branch_name         : data.sales_return_branch <= 0 ? '' : data.branch.branch_name,
                    sales_return_warehouse           : data.sales_return_warehouse,
                    sales_return_warehouse_code      : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    sales_return_warehouse_name      : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    sales_return_customer            : data.sales_return_customer,
                    sales_return_customer_name       : data.sales_return_customer <= 0 ? '' : data.customer.customer_name,
                    sales_return_sales            : data.sales_return_sales,
                    sales_return_sales_invoice    : data.sales_return_sales_invoice,
                    sales_return_sales_date       : data.sales_return_sales_date,
                    sales_return_date                : data.sales_return_date,
                    sales_return_total_amount        : data.sales_return_total_amount,
                    sales_return_adjustment_amount   : data.sales_return_adjustment_amount,
                    sales_return_payable_amount      : data.sales_return_payable_amount,
                    sales_return_paid_amount         : data.sales_return_paid_amount,
                    sales_return_due_amount          : data.sales_return_due_amount,
                    sales_return_reference_number    : data.sales_return_reference_number,
                    sales_return_payment_type        : data.sales_return_payment_type,
                    sales_return_payment_method      : data.sales_return_payment_method,
                    sales_return_payment_status      : data.sales_return_payment_status,
                    sales_return_status              : data.sales_return_status,
                    sales_return_details             : await getSalesDetails(data.sales_return_id),
                }
            });
        }
        return res.send({
            status: "0",
            message: "Sales Return Error !",
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

// Sales Return Update
exports.sales_return_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const sales_return = await sales_return_model.findOne({
            where:{
                sales_return_id: req.params.sales_return_id
            }
        });

        if(!sales_return) {
            return res.send({
                status: "0",
                message: "Sales Return ID Not Found!",
                data: "",
            });
        }

        const sales_return_data         = req.body.sales_return_data;
        const sales_return_details_data = req.body.sales_return_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else if(type == 'sales_return_quantity') {
                return get_product.product_stock_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const getSalesDetailsData = async(type, company, branch, sales, product) => {
            const get_product = await sales_details_model.findOne({where:{ sales_details_company : company, sales_details_branch : branch, sales_details_sales : sales, sales_details_product : product }});
            if(type == 'sales_quantity') {
                return get_product.sales_details_sales_quantity;
            } else if(type == 'return_quantity') {
                return get_product.sales_details_return_quantity;
            } else  if(type == 'previous_stock') {
                return get_product.sales_details_previous_stock;
            } else  if(type == 'current_stock') {
                return get_product.sales_details_current_stock;
            }
        }

        const sales_return_update = await sales_return_model.update({
            sales_return_date                : sales_return_data.sales_return_date,
            sales_return_total_amount        : sales_return_data.sales_return_total_amount,
            sales_return_adjustment_amount   : sales_return_data.sales_return_adjustment_amount,
            sales_return_payable_amount      : sales_return_data.sales_return_payable_amount,
            sales_return_paid_amount         : sales_return_data.sales_return_paid_amount,
            sales_return_due_amount          : sales_return_data.sales_return_due_amount,
            sales_return_reference_number    : sales_return_data.sales_return_reference_number,
            sales_return_payment_type        : sales_return_data.sales_return_payment_type,
            sales_return_payment_method      : sales_return_data.sales_return_payment_method,
            sales_return_payment_status      : sales_return_data.sales_return_payment_status,
            sales_return_status              : sales_return_data.sales_return_status,
            sales_return_create_by           : user_id,
        },
        {
            where: {
                sales_return_id: req.params.sales_return_id
            }
        });

        if(sales_return_update) {
            const sales_return_details_delete = await sales_return_details_model.destroy({
                where: {
                    sales_return_details_sales_return: req.params.sales_return_id
                }
            });

            if(sales_return_details_delete) {
            const salesReturnDetails = await Promise.all(sales_return_details_data.map(async (row) => ({
                sales_return_details_company             : sales_return_data.sales_return_company,
                sales_return_details_branch              : sales_return_data.sales_return_branch,
                sales_return_details_customer            : sales_return_data.sales_return_customer,
                sales_return_details_warehouse           : sales_return_data.sales_return_warehouse,
                sales_return_details_sales              : sales_return_data.sales_return_sales,
                sales_return_details_sales_invoice      : sales_return_data.sales_return_sales_invoice,
                sales_return_details_sales_date         : sales_return_data.sales_return_sales_date,
                sales_return_details_return_date         : sales_return_data.sales_return_date,
                sales_return_details_sales_return       : sales_return.sales_return_id,
                sales_return_details_product             : row.sales_return_details_product,
                sales_return_details_product_code        : row.sales_return_details_product_code,
                sales_return_details_product_name        : row.sales_return_details_product_name,
                sales_return_details_product_unit        : row.sales_return_details_product_unit,
                sales_return_details_sales_price        : row.sales_return_details_sales_price,
                sales_return_details_sales_quantity     : row.sales_return_details_sales_quantity,
                sales_return_details_sales_amount       : row.sales_return_details_sales_amount,
                sales_return_details_return_price        : row.sales_return_details_return_price,
                sales_return_details_return_quantity     : row.sales_return_details_return_quantity,
                sales_return_details_return_amount       : row.sales_return_details_return_amount,
                sales_return_details_status              : sales_return_data.sales_return_status,
                sales_return_details_create_by           : user_id,
            })));

            const sales_return_details = await sales_return_details_model.bulkCreate(salesReturnDetails);
            }
            const productDataUpdate = await Promise.all(sales_return_details_data.map(async (item) => (
                await product_model.update({
                    product_sales_return_quantity       : (parseFloat(await getProduct('sales_return_quantity', item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity),
                    product_stock_quantity              : (
                        parseFloat(await getProduct('purchase_quantity', item.sales_return_details_product))
                        -(
                            (
                                parseFloat(await getProduct('return_quantity', item.sales_return_details_product))
                                +
                                parseFloat(await getProduct('sales_quantity', item.sales_return_details_product))
                            )-
                            (parseFloat(await getProduct('sales_return_quantity', item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity)
                        )
                    )   
                },
                {
                    where:{
                        product_id: item.sales_return_details_product
                    }
                }),
                await sales_details_model.update({
                    sales_details_return_quantity: (parseFloat(await getSalesDetailsData('return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, sales_return_data.sales_return_sales, item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity),
                    sales_details_current_stock: (parseFloat(await getSalesDetailsData('current_stock', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, sales_return_data.sales_return_sales, item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity),
                },
                {
                    where:{
                        sales_details_company        : sales_return_data.sales_return_company,
                        sales_details_branch         : sales_return_data.sales_return_branch,
                        sales_details_sales       : sales_return_data.sales_return_sales,
                        sales_details_product        : item.sales_return_details_product
                    }
                }),
                await product_stock_model.update({
                    product_stock_sales_return_quantity : (parseFloat(await getProductStock('sales_return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity),
                    product_stock_in_stock              : (
                        parseFloat(await getProductStock('purchase_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product))
                        -(
                            (
                                parseFloat(await getProductStock('return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product)) 
                                +
                                parseFloat(await getProductStock('sales_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product)) 
                            )-
                            (parseFloat(await getProductStock('sales_return_quantity', sales_return_data.sales_return_company, sales_return_data.sales_return_branch, item.sales_return_details_product))-parseFloat(item.sales_return_details_previous_return_quantity))+parseFloat(item.sales_return_details_return_quantity)
                        )
                    ) 
                },
                {
                    where:{
                        product_stock_company       : sales_return_data.sales_return_company,
                        product_stock_branch        : sales_return_data.sales_return_branch,
                        product_stock_product       : item.sales_return_details_product,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const customer_data = await customer_model.findOne({
                where:{
                    customer_id: sales_return_data.sales_return_customer
                }
            });

            const customerUpdate = await customer_model.update({
                customer_return     : (parseFloat(customer_data.customer_return)-parseFloat(sales_return_data.sales_return_previous_payable_amount))+parseFloat(sales_return_data.sales_return_payable_amount),
                customer_return_paid: (parseFloat(customer_data.customer_return_paid)-parseFloat(sales_return_data.sales_return_previous_paid_amount))+parseFloat(sales_return_data.sales_return_paid_amount),
                customer_return_due : (parseFloat(customer_data.customer_return_due)-parseFloat(sales_return_data.sales_return_previous_due_amount))+parseFloat(sales_return_data.sales_return_due_amount),
            },
            {
                where: {
                    customer_id:customer_data.customer_id
                }
            });

            const customer_payment_return_delete = await customer_payment_return_model.destroy({
                where: {
                    customer_payment_return_sales_return: req.params.sales_return_id
                }
            });

            // Customer Payment Return
            if(sales_return_data.sales_return_paid_amount > 0) {
                const customer_payment_return = await customer_payment_return_model.create({
                    customer_payment_return_date                : sales_return_data.sales_return_date,
                    customer_payment_return_company             : sales_return_data.sales_return_company,
                    customer_payment_return_branch              : sales_return_data.sales_return_branch,
                    customer_payment_return_sales               : sales_return_data.sales_return_sales,
                    customer_payment_return_sales_invoice       : sales_return_data.sales_return_sales_invoice,
                    customer_payment_return_sales_return        : sales_return.sales_return_id,
                    customer_payment_return_customer            : sales_return_data.sales_return_customer,
                    customer_payment_return_payable             : sales_return_data.sales_return_payable_amount,
                    customer_payment_return_paid                : sales_return_data.sales_return_paid_amount,
                    customer_payment_return_due                 : sales_return_data.sales_return_due_amount,
                    
                    customer_payment_return_sales_reference_number    : sales_return_data.sales_return_reference_number,
                    customer_payment_return_sales_payment_type        : sales_return_data.sales_return_payment_type,
                    customer_payment_return_sales_payment_method      : sales_return_data.sales_return_payment_method,
                    customer_payment_return_status              : 1,
                    customer_payment_return_create_by           : user_id
                });
            };

            const data = await sales_return_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: sales_return_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "sales_return_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: sales_return_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "sales_return_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: sales_return_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "sales_return_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: customer_model,
                        attributes: ['customer_name'],
                        association: sales_return_model.hasOne(customer_model, {
                            foreignKey : 'customer_id',
                            sourceKey : "sales_return_customer",
                            required:false
                        }),
                    }
                ],
                where: {
                    sales_return_id: sales_return.sales_return_id
                },
            });

            const getSalesDetails = async(sales_return_id) => {
                const details_data = await sales_return_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: sales_return_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "sales_return_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: sales_return_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "sales_return_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        sales_return_details_sales       : sales_return_id,
                        sales_return_details_status         : 1,
                        sales_return_details_delete_status  : 0
                    },
                    order: [
                        ['sales_return_details_id', 'ASC']
                    ]
                });
                const sales_return_details_data = await Promise.all(details_data.map(async (row) => ({
                    sales_return_details_id                      : row.sales_return_details_id,
                    sales_return_details_sales                : row.sales_return_details_sales,
                    sales_return_details_sales_return         : row.sales_return_details_sales_return,
                    sales_return_details_sales_date           : row.sales_return_details_sales_date,
                    sales_return_details_return_date             : row.sales_return_details_return_date,
                    sales_return_details_product                 : row.sales_return_details_product,
                    sales_return_details_product_code            : row.product <= 0 ? '' : row.product.product_code,
                    sales_return_details_product_name            : row.product <= 0 ? '' : row.product.product_name,
                    sales_return_details_product_unit            : row.sales_return_details_product_unit,
                    sales_return_details_product_unit_code       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    sales_return_details_product_unit_name       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    sales_return_details_sales_price          : row.sales_return_details_sales_price,
                    sales_return_details_sales_quantity       : row.sales_return_details_sales_quantity,
                    sales_return_details_sales_amount         : row.sales_return_details_sales_amount,
                    sales_return_details_return_price            : row.sales_return_details_return_price,
                    sales_return_details_return_quantity         : row.sales_return_details_return_quantity,
                    sales_return_details_return_amount           : row.sales_return_details_return_amount,
                })));

                return sales_return_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Sales Return Successfully!",
                data: {
                    sales_return_id                  : data.sales_return_id,
                    sales_return_company             : data.sales_return_company,
                    sales_return_company_name        : data.sales_return_company <= 0 ? '' : data.company.company_name,
                    sales_return_branch              : data.sales_return_branch,
                    sales_return_branch_code         : data.sales_return_branch <= 0 ? '' : data.branch.branch_code,
                    sales_return_branch_name         : data.sales_return_branch <= 0 ? '' : data.branch.branch_name,
                    sales_return_warehouse           : data.sales_return_warehouse,
                    sales_return_warehouse_code      : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    sales_return_warehouse_name      : data.sales_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    sales_return_customer            : data.sales_return_customer,
                    sales_return_customer_name       : data.sales_return_customer <= 0 ? '' : data.customer.customer_name,
                    sales_return_sales            : data.sales_return_sales,
                    sales_return_sales_invoice    : data.sales_return_sales_invoice,
                    sales_return_sales_date       : data.sales_return_sales_date,
                    sales_return_date                : data.sales_return_date,
                    sales_return_total_amount        : data.sales_return_total_amount,
                    sales_return_adjustment_amount   : data.sales_return_adjustment_amount,
                    sales_return_payable_amount      : data.sales_return_payable_amount,
                    sales_return_paid_amount         : data.sales_return_paid_amount,
                    sales_return_due_amount          : data.sales_return_due_amount,
                    sales_return_reference_number    : data.sales_return_reference_number,
                    sales_return_payment_type        : data.sales_return_payment_type,
                    sales_return_payment_method      : data.sales_return_payment_method,
                    sales_return_payment_status      : data.sales_return_payment_status,
                    sales_return_status              : data.sales_return_status,
                    sales_return_details             : await getSalesDetails(data.sales_return_id),
                }
            });
        }

        return res.send({
            status: "0",
            message: "Sales Return Error !",
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

// Sales Due List
exports.sales_due_list = async (req, res) => {
    try {
        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company        : req.query.company,
                sales_branch         : req.query.branch,
                sales_customer       : req.query.customer,
                sales_delete_status  : 0,
                sales_status         : 1,
                sales_payment_status : 'Due'
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status,
            })));

            return res.send({
                status: "1",
                message: "Sales Find Successfully!",
                data: sales_data
            });
        }

        return res.send({
            status: "0",
            message: "Sales Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Return Due List
exports.sales_return_due_list = async (req, res) => {
    try {
        const sales_return = await sales_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_return_company        : req.query.company,
                sales_return_branch         : req.query.branch,
                sales_return_customer       : req.query.customer,
                sales_return_delete_status  : 0,
                sales_return_status         : 1,
                sales_return_payment_status : 'Due'
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        if(sales_return.length > 0) {
            const sales_return_data = await Promise.all(sales_return.map(async (row) => ({
                sales_return_id                 : row.sales_return_id,
                sales_return_company            : row.sales_return_company,
                sales_return_company_name       : row.sales_return_company <= 0 ? '' : row.company.company_name,
                sales_return_branch             : row.sales_return_branch,
                sales_return_branch_code        : row.sales_return_branch <= 0 ? '' : row.branch.branch_code,
                sales_return_branch_name        : row.sales_return_branch <= 0 ? '' : row.branch.branch_name,
                sales_return_warehouse          : row.sales_return_warehouse,
                sales_return_warehouse_code     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_return_warehouse_name     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_return_customer           : row.sales_return_customer,
                sales_return_customer_name      : row.sales_return_customer <= 0 ? '' : row.customer.customer_name,
                sales_return_sales           : row.sales_return_sales,
                sales_return_sales_invoice   : row.sales_return_sales_invoice,
                sales_return_sales_date      : row.sales_return_sales_date,
                sales_return_date               : row.sales_return_date,
                sales_return_total_amount       : row.sales_return_total_amount,
                sales_return_adjustment_amount  : row.sales_return_adjustment_amount,
                sales_return_payable_amount     : row.sales_return_payable_amount,
                sales_return_paid_amount        : row.sales_return_paid_amount,
                sales_return_due_amount         : row.sales_return_due_amount,
                sales_return_reference_number   : row.sales_return_reference_number,
                sales_return_payment_type       : row.sales_return_payment_type,
                sales_return_payment_method     : row.sales_return_payment_method,
                sales_return_payment_status     : row.sales_return_payment_status,
                sales_return_status             : row.sales_return_status,
            })));

            return res.send({
                status: "1",
                message: "Sales Return Due Find Successfully!",
                data: sales_return_data
            });
        }

        return res.send({
            status: "0",
            message: "Sales Return Due Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Due Collection Create
exports.due_collection_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const payment_data              = req.body.payment_data;
        const sales_data                = req.body.sales_data;
        const customer_payment_data     = req.body.customer_payment_data;

        const sales_update = await Promise.all(sales_data.map(async(row) => {
            const dataUpdate = await sales_model.update({
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status
            },
            {
                where: {
                    sales_id: row.sales_id
                }
            });
        }));

        const paymentData = await Promise.all(customer_payment_data.map(async (row) => ({
            customer_payment_company                    : row.customer_payment_company,
            customer_payment_branch                     : row.customer_payment_branch,
            customer_payment_date                       : row.customer_payment_date,
            customer_payment_sales                      : row.customer_payment_sales,
            customer_payment_sales_invoice              : row.customer_payment_sales_invoice,
            customer_payment_customer                   : row.customer_payment_customer,
            customer_payment_payable                    : row.customer_payment_payable,
            customer_payment_paid                       : row.customer_payment_paid,
            customer_payment_due                        : row.customer_payment_due,
            customer_payment_type                       : row.customer_payment_type,
            customer_payment_sales_reference_number     : row.customer_payment_sales_reference_number,
            customer_payment_sales_payment_type         : row.customer_payment_sales_payment_type,
            customer_payment_sales_payment_method       : row.customer_payment_sales_payment_method,
            customer_payment_status                     : row.customer_payment_status,
            customer_payment_create_by                  : user_id,
        })));
        const customer_payment = await customer_payment_model.bulkCreate(paymentData);

        const customer_paid_amount  = customer_payment_data.reduce((customer_payment_paid, data) => customer_payment_paid + parseFloat(data.customer_payment_paid), 0);
        const customer_due_amount   = customer_payment_data.reduce((customer_payment_due, data) => customer_payment_due + parseFloat(data.customer_payment_due), 0);

        const customer_data = await customer_model.findOne({
            where:{
                customer_id: payment_data.customer
            }
        });
        const customer_update = await customer_model.update({
            customer_paid   : parseFloat(customer_data.customer_paid)+parseFloat(customer_paid_amount),
            customer_due    : parseFloat(customer_data.customer_sales)-(parseFloat(customer_data.customer_paid)+parseFloat(customer_paid_amount)),
        },
        {
            where: {
                customer_id:customer_data.customer_id
            }
        });

        if(sales_update && customer_payment && customer_update) {
            return res.send({
                status: "1",
                message: "Due Collection Create Successfully!",
                data: ""
            });
        } else {
            return res.send({
                status: "0",
                message: "Due Collection Create Error !",
                data: "",
            });
        }
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Return Due Payment Create
exports.return_due_payment_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const payment_data                     = req.body.payment_data;
        const sales_return_data             = req.body.sales_return_data;
        const customer_payment_return_data     = req.body.customer_payment_return_data;

        const sales_return_update = await Promise.all(sales_return_data.map(async(row) => {
            const dataUpdate = await sales_return_model.update({
                sales_return_paid_amount        : row.sales_return_paid_amount,
                sales_return_due_amount         : row.sales_return_due_amount,
                sales_return_reference_number   : row.sales_return_reference_number,
                sales_return_payment_type       : row.sales_return_payment_type,
                sales_return_payment_method     : row.sales_return_payment_method,
                sales_return_payment_status     : row.sales_return_payment_status
            },
            {
                where: {
                    sales_return_id: row.sales_return_id
                }
            });
        }));

        const paymentData = await Promise.all(customer_payment_return_data.map(async (row) => ({
            customer_payment_return_company                    : row.customer_payment_return_company,
            customer_payment_return_branch                     : row.customer_payment_return_branch,
            customer_payment_return_date                       : row.customer_payment_return_date,
            customer_payment_return_sales                   : row.customer_payment_return_sales,
            customer_payment_return_sales_invoice           : row.customer_payment_return_sales_invoice,
            customer_payment_return_sales_return            : row.customer_payment_return_sales_return,
            customer_payment_return_customer                   : row.customer_payment_return_customer,
            customer_payment_return_payable                    : row.customer_payment_return_payable,
            customer_payment_return_paid                       : row.customer_payment_return_paid,
            customer_payment_return_due                        : row.customer_payment_return_due,
            customer_payment_return_type                       : row.customer_payment_return_type,
            customer_payment_return_sales_reference_number  : row.customer_payment_return_sales_return_reference_number,
            customer_payment_return_sales_payment_type      : row.customer_payment_return_sales_return_payment_type,
            customer_payment_return_sales_payment_method    : row.customer_payment_return_sales_return_payment_method,
            customer_payment_return_status                     : row.customer_payment_return_status,
            customer_payment_return_create_by                  : user_id,
        })));
        const customer_payment_return = await customer_payment_return_model.bulkCreate(paymentData);

        const customer_paid_amount  = customer_payment_return_data.reduce((customer_payment_return_paid, data) => customer_payment_return_paid + parseFloat(data.customer_payment_return_paid), 0);
        const customer_due_amount   = customer_payment_return_data.reduce((customer_payment_return_due, data) => customer_payment_return_due + parseFloat(data.customer_payment_return_due), 0);

        const customer_data = await customer_model.findOne({
            where:{
                customer_id: payment_data.customer
            }
        });
        const customer_update = await customer_model.update({
            customer_return_paid   : parseFloat(customer_data.customer_return_paid)+parseFloat(customer_paid_amount),
            customer_return_due    : parseFloat(customer_data.customer_return)-(parseFloat(customer_data.customer_return_paid)+parseFloat(customer_paid_amount)),
        },
        {
            where: {
                customer_id:customer_data.customer_id
            }
        });

        if(sales_return_update && customer_payment_return && customer_update) {
            return res.send({
                status: "1",
                message: "Return Due Payment Successfully!",
                data: ""
            });
        } else {
            return res.send({
                status: "0",
                message: "Return Due Payment Error !",
                data: "",
            });
        }
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Get Due Collection
exports.get_due_collection = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales_payment = await customer_payment_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: customer_payment_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "customer_payment_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: customer_payment_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "customer_payment_branch",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: customer_payment_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "customer_payment_customer",
                        required:false
                    }),
                }
            ],
            where: {
                customer_payment_company        : req.query.company,
                customer_payment_branch         : req.query.branch,
                customer_payment_customer       : req.query.customer,
                customer_payment_date           : req.query.payment_date,
                customer_payment_type           : 'Due',
                customer_payment_status         : 1,
                customer_payment_delete_status  : 0
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        if(sales_payment.length > 0) {
            const sales_payment_data = await Promise.all(sales_payment.map(async (row) => ({
                customer_payment_id             : row.customer_payment_id ,
                customer_payment_company        : row.customer_payment_company,
                customer_payment_company_name   : row.customer_payment_company <= 0 ? '' : row.company.company_name,
                customer_payment_branch         : row.customer_payment_branch,
                customer_payment_branch_code    : row.customer_payment_branch <= 0 ? '' : row.branch.branch_code,
                customer_payment_branch_name    : row.customer_payment_branch <= 0 ? '' : row.branch.branch_name,
                customer_payment_customer       : row.customer_payment_customer,
                customer_payment_customer_name  : row.customer_payment_customer <= 0 ? '' : row.customer.customer_name,
                customer_payment_date           : row.customer_payment_date,
                customer_payment_sales       : row.customer_payment_sales,
                customer_payment_sales_invoice: row.customer_payment_sales_invoice,
                customer_payment_payable        : row.customer_payment_payable,
                customer_payment_paid           : row.customer_payment_paid,
                customer_payment_due            : row.customer_payment_due,
                customer_payment_type           : row.customer_payment_type,
                customer_payment_sales_reference_number  : row.customer_payment_sales_reference_number,
                customer_payment_sales_payment_type      : row.customer_payment_sales_payment_type,
                customer_payment_sales_payment_method    : row.customer_payment_sales_payment_method,
                customer_payment_status         : row.customer_payment_status,
            })));

            return res.send({
                status  : "1",
                message : "Customer Payment Find Successfully!",
                data    : sales_payment_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Customer Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Return Due Payment
exports.get_return_due_payment = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales_payment = await customer_payment_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: customer_payment_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "customer_payment_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: customer_payment_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "customer_payment_return_branch",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: customer_payment_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "customer_payment_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                customer_payment_return_company        : req.query.company,
                customer_payment_return_branch         : req.query.branch,
                customer_payment_return_customer       : req.query.customer,
                customer_payment_return_date           : req.query.payment_date,
                customer_payment_return_type           : 'Due',
                customer_payment_return_status         : 1,
                customer_payment_return_delete_status  : 0
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        if(sales_payment.length > 0) {
            const sales_payment_data = await Promise.all(sales_payment.map(async (row) => ({
                customer_payment_return_id             : row.customer_payment_return_id ,
                customer_payment_return_company        : row.customer_payment_return_company,
                customer_payment_return_company_name   : row.customer_payment_return_company <= 0 ? '' : row.company.company_name,
                customer_payment_return_branch         : row.customer_payment_return_branch,
                customer_payment_return_branch_code    : row.customer_payment_return_branch <= 0 ? '' : row.branch.branch_code,
                customer_payment_return_branch_name    : row.customer_payment_return_branch <= 0 ? '' : row.branch.branch_name,
                customer_payment_return_customer       : row.customer_payment_return_customer,
                customer_payment_return_customer_name  : row.customer_payment_return_customer <= 0 ? '' : row.customer.customer_name,
                customer_payment_return_date           : row.customer_payment_return_date,
                customer_payment_return_sales       : row.customer_payment_return_sales,
                customer_payment_return_sales_invoice: row.customer_payment_return_sales_invoice,
                customer_payment_return_payable        : row.customer_payment_return_payable,
                customer_payment_return_paid           : row.customer_payment_return_paid,
                customer_payment_return_due            : row.customer_payment_return_due,
                customer_payment_return_type           : row.customer_payment_return_type,
                customer_payment_return_sales_reference_number  : row.customer_payment_return_sales_reference_number,
                customer_payment_return_sales_payment_type      : row.customer_payment_return_sales_payment_type,
                customer_payment_return_sales_payment_method    : row.customer_payment_return_sales_payment_method,
                customer_payment_return_status         : row.customer_payment_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Customer Payment Find Successfully!",
                data    : sales_payment_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Customer Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Report
exports.sales_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                sales_branch: req.query.branch,
                ...(req.query.customer == 'all' ?{}:{
                    sales_customer: req.query.customer
                }),
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

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status,
            })));

            return res.send({
                status  : "1",
                message : "Sales Find Successfully!",
                data    : sales_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Sales Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Due Report
exports.sales_due_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales = await sales_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_company: req.query.company,
                sales_branch: req.query.branch,
                ...(req.query.customer == 'all' ?{}:{
                    sales_customer: req.query.customer
                }),
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

        if(sales.length > 0) {
            const sales_data = await Promise.all(sales.map(async (row) => ({
                sales_id                 : row.sales_id,
                sales_company            : row.sales_company,
                sales_company_name       : row.sales_company <= 0 ? '' : row.company.company_name,
                sales_branch             : row.sales_branch,
                sales_branch_code        : row.sales_branch <= 0 ? '' : row.branch.branch_code,
                sales_branch_name        : row.sales_branch <= 0 ? '' : row.branch.branch_name,
                sales_warehouse          : row.sales_warehouse,
                sales_warehouse_code     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_warehouse_name     : row.sales_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_customer           : row.sales_customer,
                sales_customer_name      : row.sales_customer <= 0 ? '' : row.customer.customer_name,
                sales_date               : row.sales_date,
                sales_invoice            : row.sales_invoice,
                sales_product_amount     : row.sales_product_amount,
                sales_discount_percent   : row.sales_discount_percent,
                sales_discount_amount    : row.sales_discount_amount,
                sales_tax_percent        : row.sales_tax_percent,
                sales_tax_amount         : row.sales_tax_amount,
                sales_vat_percent        : row.sales_vat_percent,
                sales_vat_amount         : row.sales_vat_amount,
                sales_tax_vat_percent    : row.sales_tax_vat_percent,
                sales_tax_vat_amount     : row.sales_tax_vat_amount,
                sales_total_amount       : row.sales_total_amount,
                sales_adjustment_amount  : row.sales_adjustment_amount,
                sales_payable_amount     : row.sales_payable_amount,
                sales_paid_amount        : row.sales_paid_amount,
                sales_due_amount         : row.sales_due_amount,
                sales_reference_number   : row.sales_reference_number,
                sales_payment_type       : row.sales_payment_type,
                sales_payment_method     : row.sales_payment_method,
                sales_payment_status     : row.sales_payment_status,
                sales_status             : row.sales_status,
            })));

            return res.send({
                status  : "1",
                message : "Sales Find Successfully!",
                data    : sales_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Sales Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Collection Report
exports.sales_collection_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales_payment = await customer_payment_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: customer_payment_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "customer_payment_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: customer_payment_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "customer_payment_branch",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: customer_payment_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "customer_payment_customer",
                        required:false
                    }),
                }
            ],
            where: {
                customer_payment_company: req.query.company,
                customer_payment_branch: req.query.branch,
                ...(req.query.customer == 'all' ?{}:{
                    customer_payment_customer: req.query.customer
                }),
                ...(req.query.payment_type == 'all' ?{}:{
                    customer_payment_type: req.query.payment_type
                }),
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

        if(sales_payment.length > 0) {
            const sales_payment_data = await Promise.all(sales_payment.map(async (row) => ({
                customer_payment_id             : row.customer_payment_id ,
                customer_payment_company        : row.customer_payment_company,
                customer_payment_company_name   : row.customer_payment_company <= 0 ? '' : row.company.company_name,
                customer_payment_branch         : row.customer_payment_branch,
                customer_payment_branch_code    : row.customer_payment_branch <= 0 ? '' : row.branch.branch_code,
                customer_payment_branch_name    : row.customer_payment_branch <= 0 ? '' : row.branch.branch_name,
                customer_payment_customer       : row.customer_payment_customer,
                customer_payment_customer_name  : row.customer_payment_customer <= 0 ? '' : row.customer.customer_name,
                customer_payment_date           : row.customer_payment_date,
                customer_payment_sales       : row.customer_payment_sales,
                customer_payment_sales_invoice: row.customer_payment_sales_invoice,
                customer_payment_payable        : row.customer_payment_payable,
                customer_payment_paid           : row.customer_payment_paid,
                customer_payment_due            : row.customer_payment_due,
                customer_payment_type           : row.customer_payment_type,
                customer_payment_sales_reference_number  : row.customer_payment_sales_reference_number,
                customer_payment_sales_payment_type      : row.customer_payment_sales_payment_type,
                customer_payment_sales_payment_method    : row.customer_payment_sales_payment_method,
                customer_payment_status         : row.customer_payment_status,
            })));

            return res.send({
                status  : "1",
                message : "Sales Collection Find Successfully!",
                data    : sales_payment_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Sales Collection Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Return Report
exports.sales_return_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales_return = await sales_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: sales_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "sales_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: sales_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "sales_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: sales_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "sales_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: sales_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "sales_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                sales_return_company: req.query.company,
                sales_return_branch: req.query.branch,
                ...(req.query.customer == 'all' ?{}:{
                    sales_return_customer: req.query.customer
                }),
                sales_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                sales_return_status: req.query.status,
                sales_return_delete_status: 0
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        if(sales_return.length > 0) {
            const sales_return_data = await Promise.all(sales_return.map(async (row) => ({
                sales_return_id                 : row.sales_return_id,
                sales_return_company            : row.sales_return_company,
                sales_return_company_name       : row.sales_return_company <= 0 ? '' : row.company.company_name,
                sales_return_branch             : row.sales_return_branch,
                sales_return_branch_code        : row.sales_return_branch <= 0 ? '' : row.branch.branch_code,
                sales_return_branch_name        : row.sales_return_branch <= 0 ? '' : row.branch.branch_name,
                sales_return_warehouse          : row.sales_return_warehouse,
                sales_return_warehouse_code     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                sales_return_warehouse_name     : row.sales_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                sales_return_customer           : row.sales_return_customer,
                sales_return_customer_name      : row.sales_return_customer <= 0 ? '' : row.customer.customer_name,
                sales_return_date               : row.sales_return_date,
                sales_return_sales           : row.sales_return_sales,
                sales_return_sales_invoice   : row.sales_return_sales_invoice,
                sales_return_total_amount       : row.sales_return_total_amount,
                sales_return_adjustment_amount  : row.sales_return_adjustment_amount,
                sales_return_payable_amount     : row.sales_return_payable_amount,
                sales_return_paid_amount        : row.sales_return_paid_amount,
                sales_return_due_amount         : row.sales_return_due_amount,
                sales_return_reference_number   : row.sales_return_reference_number,
                sales_return_payment_type       : row.sales_return_payment_type,
                sales_return_payment_method     : row.sales_return_payment_method,
                sales_return_payment_status     : row.sales_return_payment_status,
                sales_return_status             : row.sales_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Sales Return Find Successfully!",
                data    : sales_return_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Sales Return Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Return Payment Report
exports.return_payment_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const customer_info = await customer_model.findOne({
            where: {
                customer_id: req.query.customer || 'all'
            }
        });
        const customer_data = {
            customer_name           : customer_info<= 0 ? 'All':customer_info.customer_name,
            customer_contact_person : customer_info<= 0 ? '':customer_info.customer_contact_person,
            customer_phone_number   : customer_info<= 0 ? '':customer_info.customer_phone_number,
            customer_email          : customer_info<= 0 ? '':customer_info.customer_email,
            customer_address        : customer_info<= 0 ? '':customer_info.customer_address
        };

        const sales_payment = await customer_payment_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: customer_payment_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "customer_payment_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: customer_payment_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "customer_payment_return_branch",
                        required:false
                    }),
                },
                {
                    model: customer_model,
                    attributes: ['customer_name'],
                    association: customer_payment_return_model.hasOne(customer_model, {
                        foreignKey : 'customer_id',
                        sourceKey : "customer_payment_return_customer",
                        required:false
                    }),
                }
            ],
            where: {
                customer_payment_return_company: req.query.company,
                customer_payment_return_branch: req.query.branch,
                ...(req.query.customer == 'all' ?{}:{
                    customer_payment_return_customer: req.query.customer
                }),
                customer_payment_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                customer_payment_return_status: req.query.status,
                customer_payment_return_delete_status: 0
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        if(sales_payment.length > 0) {
            const sales_payment_data = await Promise.all(sales_payment.map(async (row) => ({
                customer_payment_return_id             : row.customer_payment_return_id ,
                customer_payment_return_company        : row.customer_payment_return_company,
                customer_payment_return_company_name   : row.customer_payment_return_company <= 0 ? '' : row.company.company_name,
                customer_payment_return_branch         : row.customer_payment_return_branch,
                customer_payment_return_branch_code    : row.customer_payment_return_branch <= 0 ? '' : row.branch.branch_code,
                customer_payment_return_branch_name    : row.customer_payment_return_branch <= 0 ? '' : row.branch.branch_name,
                customer_payment_return_customer       : row.customer_payment_return_customer,
                customer_payment_return_customer_name  : row.customer_payment_return_customer <= 0 ? '' : row.customer.customer_name,
                customer_payment_return_date           : row.customer_payment_return_date,
                customer_payment_return_sales       : row.customer_payment_return_sales,
                customer_payment_return_sales_invoice: row.customer_payment_return_sales_invoice,
                customer_payment_return_payable        : row.customer_payment_return_payable,
                customer_payment_return_paid           : row.customer_payment_return_paid,
                customer_payment_return_due            : row.customer_payment_return_due,
                customer_payment_return_type           : row.customer_payment_return_type,
                customer_payment_return_sales_reference_number  : row.customer_payment_return_sales_reference_number,
                customer_payment_return_sales_payment_type      : row.customer_payment_return_sales_payment_type,
                customer_payment_return_sales_payment_method    : row.customer_payment_return_sales_payment_method,
                customer_payment_return_status         : row.customer_payment_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Return Payment Find Successfully!",
                data    : sales_payment_data,
                company : company_data,
                branch  : branch_data,
                customer: customer_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Return Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            customer: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Balance
exports.sales_balance = async (req, res) => {
    try {
        
        const company = req.params.company;
        const from_date = new Date();
        const to_date   = new Date();
        
        const sales_data = await sales_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(sales_payable_amount))'),'sales_amount']
            ],
            where:{
                sales_company        : company,
                sales_date           : {[Op.between]: [from_date, to_date]},
                sales_status         : 1,
                sales_delete_status  : 0,
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });
        
        const sales_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'),'paid_amount']
            ],
            where:{
                customer_payment_company        : company,
                customer_payment_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_status         : 1,
                customer_payment_delete_status  : 0,
                customer_payment_type  : 'Sales'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_due_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'),'due_payment']
            ],
            where:{
                customer_payment_company        : company,
                customer_payment_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_status         : 1,
                customer_payment_delete_status  : 0,
                customer_payment_type  : 'Due'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_return_data = await sales_return_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(sales_return_payable_amount))'),'sales_return_amount']
            ],
            where:{
                sales_return_company        : company,
                sales_return_date           : {[Op.between]: [from_date, to_date]},
                sales_return_status         : 1,
                sales_return_delete_status  : 0,
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        const sales_return_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'),'return_paid_amount']
            ],
            where:{
                customer_payment_return_company        : company,
                customer_payment_return_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_return_status         : 1,
                customer_payment_return_delete_status  : 0,
                customer_payment_return_type  : 'Return'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const sales_return_due_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'),'return_due_payment']
            ],
            where:{
                customer_payment_return_company        : company,
                customer_payment_return_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_return_status         : 1,
                customer_payment_return_delete_status  : 0,
                customer_payment_return_type  : 'Due'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const sales = {
            sales_amount             : parseFloat(sales_data.dataValues.sales_amount || 0).toFixed(2),
            sales_paid_amount        : parseFloat(sales_payment_data.dataValues.paid_amount || 0).toFixed(2),
            sales_due_amount         : parseFloat(parseFloat(sales_data.dataValues.sales_amount || 0)-parseFloat(sales_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            sales_due_payment        : parseFloat(sales_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            sales_return_amount      : parseFloat(sales_return_data.dataValues.sales_return_amount || 0).toFixed(2),
            sales_return_paid_amount : parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            sales_return_due_amount  : parseFloat(parseFloat(sales_return_data.dataValues.sales_return_amount || 0)-parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            sales_return_due_payment : parseFloat(sales_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        return res.send({
            status  : "1",
            message : "Sales Balance Find Successfully !",
            data    : sales
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Sales Balance Branch
exports.sales_balance_branch = async (req, res) => {
    try {
        const company = req.query.company;
        const branch = req.query.branch;
        const from_date = new Date();
        const to_date   = new Date();
        
        const sales_data = await sales_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(sales_payable_amount))'),'sales_amount']
            ],
            where:{
                sales_company        : company,
                ...(branch == 'all' ?{}:{ sales_branch : branch}),
                sales_date           : {[Op.between]: [from_date, to_date]},
                sales_status         : 1,
                sales_delete_status  : 0,
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });
        
        const sales_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'),'paid_amount']
            ],
            where:{
                customer_payment_company        : company,
                ...(branch == 'all' ?{}:{ customer_payment_branch : branch}),
                customer_payment_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_status         : 1,
                customer_payment_delete_status  : 0,
                customer_payment_type  : 'Sales'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_due_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'),'due_payment']
            ],
            where:{
                customer_payment_company        : company,
                ...(branch == 'all' ?{}:{ customer_payment_branch : branch}),
                customer_payment_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_status         : 1,
                customer_payment_delete_status  : 0,
                customer_payment_type  : 'Due'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_return_data = await sales_return_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(sales_return_payable_amount))'),'sales_return_amount']
            ],
            where:{
                sales_return_company        : company,
                ...(branch == 'all' ?{}:{ sales_return_branch : branch}),
                sales_return_date           : {[Op.between]: [from_date, to_date]},
                sales_return_status         : 1,
                sales_return_delete_status  : 0,
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        const sales_return_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'),'return_paid_amount']
            ],
            where:{
                customer_payment_return_company        : company,
                ...(branch == 'all' ?{}:{ customer_payment_return_branch : branch}),
                customer_payment_return_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_return_status         : 1,
                customer_payment_return_delete_status  : 0,
                customer_payment_return_type  : 'Return'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const sales_return_due_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'),'return_due_payment']
            ],
            where:{
                customer_payment_return_company        : company,
                ...(branch == 'all' ?{}:{ customer_payment_return_branch : branch}),
                customer_payment_return_date           : {[Op.between]: [from_date, to_date]},
                customer_payment_return_status         : 1,
                customer_payment_return_delete_status  : 0,
                customer_payment_return_type  : 'Due'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const sales = {
            sales_amount             : parseFloat(sales_data.dataValues.sales_amount || 0).toFixed(2),
            sales_paid_amount        : parseFloat(sales_payment_data.dataValues.paid_amount || 0).toFixed(2),
            sales_due_amount         : parseFloat(parseFloat(sales_data.dataValues.sales_amount || 0)-parseFloat(sales_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            sales_due_payment        : parseFloat(sales_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            sales_return_amount      : parseFloat(sales_return_data.dataValues.sales_return_amount || 0).toFixed(2),
            sales_return_paid_amount : parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            sales_return_due_amount  : parseFloat(parseFloat(sales_return_data.dataValues.sales_return_amount || 0)-parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            sales_return_due_payment : parseFloat(sales_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        return res.send({
            status  : "1",
            message : "Sales Balance Branch Find Successfully !",
            data    : sales
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};