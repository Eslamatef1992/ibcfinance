require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const supplier_model        = db.supplier_model;
const purchase_model        = db.purchase_model;
const warehouse_model       = db.warehouse_model;
const company_model         = db.company_model;
const branch_model          = db.branch_model;
const supplier_payment_model= db.supplier_payment_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Supplier List
exports.supplier_list = async (req, res) => {
    try {
        const supplier = await supplier_model.findAll({
            where: {
                supplier_company: req.query.company,
                supplier_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    supplier_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        supplier_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        supplier_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['supplier_id', 'DESC']
            ]
        });

        if(supplier.length > 0) {
            const supplier_data = await Promise.all(supplier.map(async (row) => ({
                supplier_id             : row.supplier_id ,
                supplier_company        : row.supplier_company,
                supplier_name           : row.supplier_name,
                supplier_contact_person : row.supplier_contact_person,
                supplier_phone_number   : row.supplier_phone_number,
                supplier_email          : row.supplier_email,
                supplier_address        : row.supplier_address,
                supplier_picture        : row.supplier_picture === null ? '' : `${process.env.BASE_URL}/${row.supplier_picture}`,
                supplier_purchase       : row.supplier_purchase,
                supplier_paid           : row.supplier_paid,
                supplier_due            : row.supplier_due,
                supplier_return         : row.supplier_return,
                supplier_return_paid    : row.supplier_return_paid,
                supplier_return_due     : row.supplier_return_due,
                supplier_status         : row.supplier_status
            })));

            return res.send({
                status: "1",
                message: "Supplier Find Successfully!",
                data: supplier_data
            });
        }

        return res.send({
            status: "0",
            message: "Supplier Not Found !",
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

// Supplier List Active
exports.supplier_list_active = async (req, res) => {
    try {
        const supplier = await supplier_model.findAll({
            where: {
                supplier_company: req.params.company,
                supplier_status: 1,
                supplier_delete_status: 0
            },
            order: [
                ['supplier_name', 'ASC']
            ]
        });

        if(supplier.length > 0) {
            const supplier_data = await Promise.all(supplier.map(async (row) => ({
                supplier_id             : row.supplier_id ,
                supplier_company        : row.supplier_company,
                supplier_name           : row.supplier_name,
                supplier_contact_person : row.supplier_contact_person,
                supplier_phone_number   : row.supplier_phone_number,
                supplier_email          : row.supplier_email,
                supplier_address        : row.supplier_address,
                supplier_picture        : row.supplier_picture === null ? '' : `${process.env.BASE_URL}/${row.supplier_picture}`,
                supplier_purchase       : row.supplier_purchase,
                supplier_paid           : row.supplier_paid,
                supplier_due            : row.supplier_due,
                supplier_return         : row.supplier_return,
                supplier_return_paid    : row.supplier_return_paid,
                supplier_return_due     : row.supplier_return_due,
                supplier_status         : row.supplier_status
            })));

            return res.send({
                status: "1",
                message: "Supplier Find Successfully!",
                data: supplier_data
            });
        }
        return res.send({
            status: "0",
            message: "Supplier Not Found !",
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

// Get Supplier
exports.get_supplier = async (req, res) => {
    try {
        const data = await supplier_model.findOne({
            where: {
                supplier_id: req.params.supplier_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Supplier Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Supplier Find Successfully!",
            data: {
                supplier_id             : data.supplier_id ,
                supplier_company        : data.supplier_company,
                supplier_name           : data.supplier_name,
                supplier_contact_person : data.supplier_contact_person,
                supplier_phone_number   : data.supplier_phone_number,
                supplier_email          : data.supplier_email,
                supplier_address        : data.supplier_address,
                supplier_picture        : data.supplier_picture === null ? '' : `${process.env.BASE_URL}/${data.supplier_picture}`,
                supplier_purchase       : data.supplier_purchase,
                supplier_paid           : data.supplier_paid,
                supplier_due            : data.supplier_due,
                supplier_return         : data.supplier_return,
                supplier_return_paid    : data.supplier_return_paid,
                supplier_return_due     : data.supplier_return_due,
                supplier_status         : data.supplier_status
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

// Supplier Create
exports.supplier_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let supplier_check_data = await supplier_model.findOne({
            where: {
                supplier_phone_number: req.body.supplier_phone_number
            }
        });

        if(supplier_check_data) {
            return res.send({
            status: "0",
            message: "Supplier Phone Exist!",
            data: '',
            });
        }

        supplier_check_data = await supplier_model.findOne({
            where: {
                supplier_email: req.body.supplier_email
            }
        });

        if(supplier_check_data) {
            return res.send({
            status: "0",
            message: "Supplier Email Exist!",
            data: '',
            });
        }

        let supplier_picture;
        if (req.file == undefined) {
            supplier_picture = "assets/images/suppliers/supplier-icon.png";
        } else {
            supplier_picture = "assets/images/suppliers/"+req.file.filename;
        }

        const supplier = await supplier_model.create({
            supplier_company        : req.body.supplier_company,
            supplier_name           : req.body.supplier_name,
            supplier_contact_person : req.body.supplier_contact_person,
            supplier_phone_number   : req.body.supplier_phone_number,
            supplier_email          : req.body.supplier_email,
            supplier_address        : req.body.supplier_address,
            supplier_picture        : supplier_picture,
            supplier_status         : req.body.supplier_status,
            supplier_create_by      : user_id,
        });

        if(supplier) {
            const data = await supplier_model.findOne({
                where: {
                    supplier_id: supplier.supplier_id
                },
            });

            return res.send({
                status: "1",
                message: "Supplier Create Successfully!",
                data: {
                    supplier_id             : data.supplier_id ,
                    supplier_company        : data.supplier_company,
                    supplier_name           : data.supplier_name,
                    supplier_contact_person : data.supplier_contact_person,
                    supplier_phone_number   : data.supplier_phone_number,
                    supplier_email          : data.supplier_email,
                    supplier_address        : data.supplier_address,
                    supplier_picture        : data.supplier_picture === null ? '' : `${process.env.BASE_URL}/${data.supplier_picture}`,
                    supplier_purchase       : data.supplier_purchase,
                    supplier_paid           : data.supplier_paid,
                    supplier_due            : data.supplier_due,
                    supplier_return         : data.supplier_return,
                    supplier_return_paid    : data.supplier_return_paid,
                    supplier_return_due     : data.supplier_return_due,
                    supplier_status         : data.supplier_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Supplier Create Error !",
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

// Supplier Update
exports.supplier_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let supplier_check_data = await supplier_model.findOne({
            where: {
                supplier_phone_number: req.body.supplier_phone_number,
                [Op.not]: [
                    { supplier_id: req.params.supplier_id }
                ]
            }
        });

        if(supplier_check_data) {
            return res.send({
            status: "0",
            message: "Supplier Phone Exist!",
            data: '',
            });
        }

        supplier_check_data = await supplier_model.findOne({
            where: {
                supplier_email: req.body.supplier_email,
                [Op.not]: [
                    { supplier_id: req.params.supplier_id }
                ]
            }
        });

        if(supplier_check_data) {
            return res.send({
            status: "0",
            message: "Supplier Email Exist!",
            data: '',
            });
        }

        const supplier_data = await supplier_model.findOne({
            where:{
                supplier_id: req.params.supplier_id
            }
        });

        if(!supplier_data) {
            return res.send({
                status: "0",
                message: "Supplier ID Not Found!",
                data: "",
            });
        }

        let supplier_picture;
        if (req.file == undefined) {
            supplier_picture = "assets/images/suppliers/supplier-icon.png";
        } else {
            supplier_picture = "assets/images/suppliers/"+req.file.filename;
        }

        const supplier = await supplier_model.update({
            supplier_company        : req.body.supplier_company,
            supplier_name           : req.body.supplier_name,
            supplier_contact_person : req.body.supplier_contact_person,
            supplier_phone_number   : req.body.supplier_phone_number,
            supplier_email          : req.body.supplier_email,
            supplier_address        : req.body.supplier_address,
            supplier_picture        : supplier_picture,
            supplier_status         : req.body.supplier_status,
            supplier_update_by      : user_id,
        },
        {
            where:{
                supplier_id: req.params.supplier_id
            }
        });
        if(supplier) {
            const data = await supplier_model.findOne({
                where: {
                    supplier_id: req.params.supplier_id
                },
            });

            return res.send({
                status: "1",
                message: "Supplier Update Successfully!",
                data: {
                    supplier_id             : data.supplier_id ,
                    supplier_company        : data.supplier_company,
                    supplier_name           : data.supplier_name,
                    supplier_contact_person : data.supplier_contact_person,
                    supplier_phone_number   : data.supplier_phone_number,
                    supplier_email          : data.supplier_email,
                    supplier_address        : data.supplier_address,
                    supplier_picture        : data.supplier_picture === null ? '' : `${process.env.BASE_URL}/${data.supplier_picture}`,
                    supplier_purchase       : data.supplier_purchase,
                    supplier_paid           : data.supplier_paid,
                    supplier_due            : data.supplier_due,
                    supplier_return         : data.supplier_return,
                    supplier_return_paid    : data.supplier_return_paid,
                    supplier_return_due     : data.supplier_return_due,
                    supplier_status         : data.supplier_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Supplier Update Error!",
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

// Supplier Delete
exports.supplier_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const supplier_data = await supplier_model.findOne({
            where:{
                supplier_id: req.params.supplier_id
            }
        });

        if(!supplier_data) {
            return res.send({
                status: "0",
                message: "Supplier ID Not Found!",
                data: "",
            });
        }

        const supplier = await supplier_model.update({
            supplier_status        : 0,
            supplier_delete_status : 1,
            supplier_delete_by     : user_id,
            supplier_delete_at     : new Date(),
        },
        {
            where:{
                supplier_id: req.params.supplier_id
            }
        });

        return res.send({
            status: "1",
            message: "Supplier Delete Successfully!",
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

// Supplier Report
exports.supplier_report = async (req, res) => {
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
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date,
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
        const supplier = await supplier_model.findAll({
            where: {
                supplier_company: req.query.company,
                ...(req.query.status == 'all' ?{}:{
                    supplier_status: req.query.status
                }),
                supplier_delete_status: 0,
            },
            order: [
                ['supplier_name', 'ASC']
            ]
        });

        if(supplier.length > 0) {
            const supplier_data = await Promise.all(supplier.map(async (row) => ({
                supplier_id             : row.supplier_id ,
                supplier_company        : row.supplier_company,
                supplier_name           : row.supplier_name,
                supplier_contact_person : row.supplier_contact_person,
                supplier_phone_number   : row.supplier_phone_number,
                supplier_email          : row.supplier_email,
                supplier_address        : row.supplier_address,
                supplier_picture        : row.supplier_picture === null ? '' : `${process.env.BASE_URL}/${row.supplier_picture}`,
                supplier_purchase       : row.supplier_purchase,
                supplier_paid           : row.supplier_paid,
                supplier_due            : row.supplier_due,
                supplier_return         : row.supplier_return,
                supplier_return_paid    : row.supplier_return_paid,
                supplier_return_due     : row.supplier_return_due,
                supplier_status         : row.supplier_status
            })));

            return res.send({
                status  : "1",
                message : "Supplier Find Successfully!",
                data    : supplier_data,
                company : company_data,
                branch  : branch_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Not Found !",
            data    : [],
            company : '',
            branch  : '',
        });

    } catch (error) {
        res .send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// Supplier Purchase Report
exports.supplier_purchase_report = async (req, res) => {
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
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date,
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

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const supplier_purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company    : req.query.company,
                purchase_branch     : req.query.branch,
                purchase_supplier   : req.query.supplier,
                purchase_date: {
                    [Op.between]    : [req.query.from_date, req.query.to_date],
                },
                purchase_status     : req.query.status,
                purchase_delete_status: 0
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(supplier_purchase.length > 0) {
            const supplier_purchase_data = await Promise.all(supplier_purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status  : "1",
                message : "Purchase Find Successfully!",
                data    : supplier_purchase_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// Supplier Payment Report
exports.supplier_payment_report = async (req, res) => {
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
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date,
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

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const supplier_payment = await supplier_payment_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: supplier_payment_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "supplier_payment_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: supplier_payment_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "supplier_payment_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: supplier_payment_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "supplier_payment_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                supplier_payment_company: req.query.company,
                supplier_payment_branch: req.query.branch,
                supplier_payment_supplier: req.query.supplier,
                supplier_payment_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                supplier_payment_status: req.query.status,
                supplier_payment_delete_status: 0
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        if(supplier_payment.length > 0) {
            const supplier_payment_data = await Promise.all(supplier_payment.map(async (row) => ({
                supplier_payment_id             : row.supplier_payment_id ,
                supplier_payment_company        : row.supplier_payment_company,
                supplier_payment_company_name   : row.supplier_payment_company <= 0 ? '' : row.company.company_name,
                supplier_payment_branch         : row.supplier_payment_branch,
                supplier_payment_branch_code    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_code,
                supplier_payment_branch_name    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_name,
                supplier_payment_supplier       : row.supplier_payment_supplier,
                supplier_payment_supplier_name  : row.supplier_payment_supplier <= 0 ? '' : row.supplier.supplier_name,
                supplier_payment_date           : row.supplier_payment_date,
                supplier_payment_purchase       : row.supplier_payment_purchase,
                supplier_payment_purchase_invoice: row.supplier_payment_purchase_invoice,
                supplier_payment_payable        : row.supplier_payment_payable,
                supplier_payment_paid           : row.supplier_payment_paid,
                supplier_payment_due            : row.supplier_payment_due,
                supplier_payment_type           : row.supplier_payment_type,
                supplier_payment_purchase_reference_number  : row.supplier_payment_purchase_reference_number,
                supplier_payment_purchase_payment_type      : row.supplier_payment_purchase_payment_type,
                supplier_payment_purchase_payment_method    : row.supplier_payment_purchase_payment_method,
                supplier_payment_status         : row.supplier_payment_status,
            })));

            return res.send({
                status  : "1",
                message : "Supplier Payment Find Successfully!",
                data    : supplier_payment_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
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

// Supplier Due Report
exports.supplier_due_report = async (req, res) => {
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
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date,
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

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const supplier_due = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                purchase_branch: req.query.branch,
                purchase_supplier: req.query.supplier,
                purchase_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_payment_status: 'Due',
                purchase_status: req.query.status,
                purchase_delete_status: 0
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(supplier_due.length > 0) {
            const supplier_due_data = await Promise.all(supplier_due.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status  : "1",
                message : "Supplier Due Find Successfully!",
                data    : supplier_due_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Due Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
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