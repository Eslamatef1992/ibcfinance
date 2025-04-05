require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const company_model         = db.company_model;
const user_model            = db.user_model;
const chart_of_accounts_model   = db.chart_of_accounts_model;
const financial_year_model      = db.financial_year_model;
const accounts_link_model      = db.accounts_link_model;
const company_package_model     = db.company_package_model;

const Op                    = db.Sequelize.Op;
let user_id;

// Company List
exports.company_list = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const login_user_data = await user_model.findOne({
            where: {
                user_id: user_id
            }
        });

        const data = await company_model.findAll({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    company_id : login_user_data.user_company
                }:{}),
                ...(req.query.status == 'all' ?{}:{
                    company_status : req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        company_name: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_owner_name:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_phone:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_email:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_website:{[Op.like]: `%${req.query.search}%`}
                    }
                ]}:{}),
                company_delete_status: 0
            },
            order   : [
                ['company_id', 'DESC']
            ]
        });

        if(data.length > 0) {
            const company_data = await Promise.all(data.map(async (row) => ({
                company_id          : row.company_id ,
                company_name        : row.company_name,
                company_owner_name  : row.company_owner_name,
                company_phone       : row.company_phone,
                company_email       : row.company_email,
                company_website     : row.company_website,
                company_address     : row.company_address,
                company_opening_date: row.company_opening_date,
                company_picture     : row.company_picture === null ? '' : `${process.env.BASE_URL}/${row.company_picture}`,
                company_package     : row.company_company_package,
                company_package_code: row.company_package === null ? '' : row.company_package.company_package_name,
                company_package_name: row.company_package === null ? '' : row.company_package.company_package_name,
                company_status      : row.company_status,
                company_create_at   : row.company_create_at,
                company_update_at   : row.company_update_at
            })));

            return res.send({
                status: "1",
                message: "Company Data Found Successfully!",
                data: company_data
            });
        }

        return res.send({
            status: "0",
            message: "Company Data Not Found!",
            data: [],
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Company List Active
exports.company_list_active = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const login_user_data = await user_model.findOne({
            where: {
                user_id: user_id
            }
        });

        const data = await company_model.findAll({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    company_id : login_user_data.user_company
                }:{
                    company_id : login_user_data.user_company
                }),
                company_status: 1,
                company_delete_status: 0
            },
            order   : [
                ['company_name', 'ASC']
            ]
        });

        if(data.length > 0) {
            const company_data = await Promise.all(data.map(async (row) => ({
                company_id          : row.company_id ,
                company_name        : row.company_name,
                company_owner_name  : row.company_owner_name,
                company_phone       : row.company_phone,
                company_email       : row.company_email,
                company_website     : row.company_website,
                company_address     : row.company_address,
                company_opening_date: row.company_opening_date,
                company_picture     : row.company_picture === null ? '' : `${process.env.BASE_URL}/${row.company_picture}`,
                company_package     : row.company_company_package,
                company_package_code: row.company_package === null ? '' : row.company_package.company_package_name,
                company_package_name: row.company_package === null ? '' : row.company_package.company_package_name,
                company_status      : row.company_status,
                company_create_at   : row.company_create_at,
                company_update_at   : row.company_update_at
            })));

            return res.send({
                status: "1",
                message: "Company Data Found Successfully!",
                data: company_data,
            });
        }

        return res.send({
            status: "0",
            message: "Company Data Not Found!",
            data: [],
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Company
exports.get_company = async (req, res) => {
    try {
        const data = await company_model.findOne({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                company_id: req.params.company_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Data Not Found!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Data Found Successfully!",
            data: {
                company_id          : data.company_id,
                company_name        : data.company_name,
                company_owner_name  : data.company_owner_name,
                company_phone       : data.company_phone,
                company_email       : data.company_email,
                company_website     : data.company_website,
                company_address     : data.company_address,
                company_opening_date: data.company_opening_date,
                company_picture     : data.company_picture === null ? '' : `${process.env.BASE_URL}/${data.company_picture}`,
                company_package     : data.company_company_package,
                company_package_code: data.company_package === null ? '' : data.company_package.company_package_name,
                company_package_name: data.company_package === null ? '' : data.company_package.company_package_name,
                company_status      : data.company_status,
                company_create_at   : data.company_create_at,
                company_update_at   : data.company_update_at
            },
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Create
exports.company_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let company_data = await company_model.findOne({
            where: {
                company_name: req.body.company_name
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Company Name Exist!",
            data: '',
            });
        }

        // Phone Number
        company_data = await company_model.findOne({
            where: {
                company_phone: req.body.company_phone
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        company_data = await company_model.findOne({
            where: {
                company_email: req.body.company_email
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        // Username
        let user_data = await user_model.findOne({
            where: {
            username: req.body.username
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Username Exist!",
            data: '',
            });
        }

        // Phone Number
        user_data = await user_model.findOne({
            where: {
            user_phone: req.body.company_phone
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        user_data = await user_model.findOne({
            where: {
            user_email: req.body.company_email
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        const u_id_date = new Date();

        let company_picture;
        if (req.file == undefined) {
            company_picture = "assets/images/company/company-icon.png";
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const company_register = await company_model.create({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_picture     : company_picture,
            company_company_package     : req.body.company_package,
            company_status      : req.body.company_status,
            company_create_by   : user_id
        });

        if(!company_register) {
            return res.send({
                status: "0",
                message: "Company Register Failed!",
                data: "",
            });
        }

        const user_register = await user_model.create({
            user_name           : req.body.company_owner_name,
            username            : req.body.username,
            password            : bcrypt.hashSync(req.body.password, 10),
            password_show       : req.body.password,
            user_designation    : 'Company Owner',
            user_phone          : req.body.company_phone,
            user_email          : req.body.company_email,
            user_address        : req.body.company_address,
            user_company        : company_register.company_id,
            user_branch         : 0,
            user_user_group     : 3,
            user_picture        : 'assets/images/users/user-icon.png',
            user_language       : 'en',
            user_theme          : 'blue',
            user_status         : req.body.company_status,
            user_create_by      : user_id
        });

        if(!user_register) {
            return res.send({
                status: "0",
                message: "User Register Failed!",
                data: "",
            });
        }

        const user_id_number    = u_id_date.getFullYear().toString().substr(-2)+""+(u_id_date.getMonth()+1).toString().padStart(2, '0')+""+user_register.user_id.toString().padStart(6, '0');

        const user_update = await user_model.update(
            {
                user_id_number  : user_id_number
            },
            {
                where:{
                    user_id: user_register.user_id
                }
            }
        );

        const accounts_link_list = [
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_in_hand_bank",
                accounts_link_name  : "Cash in Hand & Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_in_hand",
                accounts_link_name  : "Cash in Hand",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_at_bank",
                accounts_link_name  : "Cash at Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash",
                accounts_link_name  : "Cash",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "bank",
                accounts_link_name  : "Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_cg",
                accounts_link_name  : "Excess of Income Over Expenditure (CG)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_gl",
                accounts_link_name  : "Excess of Income Over Expenditure (GL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_sl",
                accounts_link_name  : "Excess of Income Over Expenditure (SL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_payment",
                accounts_link_name  : "Purchase Payment",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_due",
                accounts_link_name  : "Purchase Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_return",
                accounts_link_name  : "Purchase Return",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_return_due",
                accounts_link_name  : "Purchase Return Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_collection",
                accounts_link_name  : "Sales Collection",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_due",
                accounts_link_name  : "Sales Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_return",
                accounts_link_name  : "Sales Return",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_return_due",
                accounts_link_name  : "Sales Return Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_cg",
                accounts_link_name  : "Investments (CG)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_gl",
                accounts_link_name  : "Investments (GL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_sl",
                accounts_link_name  : "Investments (SL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "advance_payments",
                accounts_link_name  : "Advance Payments",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "advance_received",
                accounts_link_name  : "Advance Received",
                accounts_link_status: 1
            }
        ];
        const accounts_link_create = await accounts_link_model.bulkCreate(accounts_link_list);

        const get_coa_id = async(id) => {
            const data = await chart_of_accounts_model.findOne({
                where: {
                    chart_of_accounts_company       : company_register.company_id,
                    chart_of_accounts_code          : id,
                    chart_of_accounts_status        : 1,
                    chart_of_accounts_delete_status : 0,
                }
            });

            return data.chart_of_accounts_id;
        };
        
        const getAccountsLink = async(type, data) => {
            if(type == 'id') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_id;
            } else if(type == 'code') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_code;
            } else if(type == 'name') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_name;
            } else {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_name;
            }
        };

        const AC_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10100000',
                chart_of_accounts_name              : 'Fixed Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10200000',
                chart_of_accounts_name              : 'Current Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20100000',
                chart_of_accounts_name              : 'Funds',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_cg'),
                chart_of_accounts_accounts_link     : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20200000',
                chart_of_accounts_name              : 'Liabilities',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30100000',
                chart_of_accounts_name              : 'General Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30200000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40100000',
                chart_of_accounts_name              : 'General Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40200000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const AC_COA_create = await chart_of_accounts_model.bulkCreate(AC_COA);

        const CG_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101000',
                chart_of_accounts_name              : 'Property Plan & Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102000',
                chart_of_accounts_name              : 'Electrical & Electronics Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103000',
                chart_of_accounts_name              : 'Computers & Networks',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104000',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201000',
                chart_of_accounts_name              : 'Cash in Hand & Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10200000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_in_hand_bank'),
                chart_of_accounts_accounts_link     : 'cash_in_hand_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202000',
                chart_of_accounts_name              : 'Receivable',
                chart_of_accounts_accounts_category : await get_coa_id('10200000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Fund & Liabilities CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101000',
                chart_of_accounts_name              : 'Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20100000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_cg'),
                chart_of_accounts_accounts_link     : 'investments_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102000',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20100000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_cg'),
                chart_of_accounts_accounts_link     : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201000',
                chart_of_accounts_name              : 'Payable',
                chart_of_accounts_accounts_category : await get_coa_id('20200000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Income CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101000',
                chart_of_accounts_name              : 'Product Sales Income',
                chart_of_accounts_accounts_category : await get_coa_id('30100000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102000',
                chart_of_accounts_name              : 'Purchase Product Return Income',
                chart_of_accounts_accounts_category : await get_coa_id('30100000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30200000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Expense CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101000',
                chart_of_accounts_name              : 'Product Purchase Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40100000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102000',
                chart_of_accounts_name              : 'Sales Product Return Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40100000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40200000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const CG_COA_create = await chart_of_accounts_model.bulkCreate(CG_COA);
        
        const GL_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101100',
                chart_of_accounts_name              : 'Land Purchase & Development',
                chart_of_accounts_accounts_category : await get_coa_id('10101000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102100',
                chart_of_accounts_name              : 'Electrical Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10102000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102200',
                chart_of_accounts_name              : 'Electronics Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10102000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103100',
                chart_of_accounts_name              : 'Computers & Computer Accessories',
                chart_of_accounts_accounts_category : await get_coa_id('10103000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103200',
                chart_of_accounts_name              : 'Networks & Network Accessories',
                chart_of_accounts_accounts_category : await get_coa_id('10103000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104100',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10104000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201100',
                chart_of_accounts_name              : 'Cash in Hand',
                chart_of_accounts_accounts_category : await get_coa_id('10201000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_in_hand'),
                chart_of_accounts_accounts_link     : 'cash_in_hand',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201200',
                chart_of_accounts_name              : 'Cash at Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10201000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_at_bank'),
                chart_of_accounts_accounts_link     : 'cash_at_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202100',
                chart_of_accounts_name              : 'Receivable from Customers',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202200',
                chart_of_accounts_name              : 'Receivable from Suppliers',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202300',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101100',
                chart_of_accounts_name              : 'Owner & Partner Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20101000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_gl'),
                chart_of_accounts_accounts_link     : 'investments_gl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102100',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20102000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_gl'),
                chart_of_accounts_accounts_link     : 'income_expenditure_gl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201100',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201200',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201300',
                chart_of_accounts_name              : 'Advance Received',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Income
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101100',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : await get_coa_id('30101000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102100',
                chart_of_accounts_name              : 'Purchase Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('30102000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201100',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30201000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101100',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('40101000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102100',
                chart_of_accounts_name              : 'Sales Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('40102000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201100',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40201000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const GL_COA_create = await chart_of_accounts_model.bulkCreate(GL_COA);
        
        const SL_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101101',
                chart_of_accounts_name              : 'Land Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('10101100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101102',
                chart_of_accounts_name              : 'Land Development',
                chart_of_accounts_accounts_category : await get_coa_id('10101100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102101',
                chart_of_accounts_name              : '2RM Cable',
                chart_of_accounts_accounts_category : await get_coa_id('10102100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102201',
                chart_of_accounts_name              : 'Television',
                chart_of_accounts_accounts_category : await get_coa_id('10102200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103101',
                chart_of_accounts_name              : 'Desktop Computer',
                chart_of_accounts_accounts_category : await get_coa_id('10103100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103201',
                chart_of_accounts_name              : 'Server Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10103200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104101',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10104100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201101',
                chart_of_accounts_name              : 'Cash',
                chart_of_accounts_accounts_category : await get_coa_id('10201100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash'),
                chart_of_accounts_accounts_link     : 'cash',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201201',
                chart_of_accounts_name              : 'Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10201200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'bank'),
                chart_of_accounts_accounts_link     : 'bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202101',
                chart_of_accounts_name              : 'Sales Due',
                chart_of_accounts_accounts_category : await get_coa_id('10202100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_due'),
                chart_of_accounts_accounts_link     : 'sales_due',
                chart_of_accounts_status            : 1
            },
            
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202201',
                chart_of_accounts_name              : 'Purchase Return Due',
                chart_of_accounts_accounts_category : await get_coa_id('10202200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_return_due'),
                chart_of_accounts_accounts_link     : 'purchase_return_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202301',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : await get_coa_id('10202300'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'advance_payments'),
                chart_of_accounts_accounts_link     : 'advance_payments',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101101',
                chart_of_accounts_name              : 'Owner Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20101100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_sl'),
                chart_of_accounts_accounts_link     : 'investments_sl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102101',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20102100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_sl'),
                chart_of_accounts_accounts_link     : 'income_expenditure_sl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201101',
                chart_of_accounts_name              : 'Purchase Due',
                chart_of_accounts_accounts_category : await get_coa_id('20201100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_due'),
                chart_of_accounts_accounts_link     : 'purchase_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201201',
                chart_of_accounts_name              : 'Sales Return Due',
                chart_of_accounts_accounts_category : await get_coa_id('20201200'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_return_due'),
                chart_of_accounts_accounts_link     : 'sales_return_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201301',
                chart_of_accounts_name              : 'Advance Received',
                chart_of_accounts_accounts_category : await get_coa_id('20201300'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'advance_received'),
                chart_of_accounts_accounts_link     : 'advance_received',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101101',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : await get_coa_id('30101100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_collection'),
                chart_of_accounts_accounts_link     : 'sales_collection',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102101',
                chart_of_accounts_name              : 'Purchase Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('30102100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_return'),
                chart_of_accounts_accounts_link     : 'purchase_return',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201101',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30201100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101101',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('40101100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_payment'),
                chart_of_accounts_accounts_link     : 'purchase_payment',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102101',
                chart_of_accounts_name              : 'Sales Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('40102100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_return'),
                chart_of_accounts_accounts_link     : 'sales_return',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201101',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40201100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const SL_COA_create = await chart_of_accounts_model.bulkCreate(SL_COA);

        const financial_year_create = await financial_year_model.create({
                financial_year_company          : company_register.company_id,
                financial_year_starting_date    : '01',
                financial_year_starting_month   : '07',
                financial_year_closing_date     : '30',
                financial_year_closing_month    : '06',
                financial_year_status           : 1
            }
        );

        const company = await company_model.findOne({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where:{
                company_id: company_register.company_id
            }
        });

        return res.send({
            status: "1",
            message: "Company Successfully Registered!",
            data: {
                company_id          : company.company_id,
                company_name        : company.company_name,
                company_owner_name  : company.company_owner_name,
                company_phone       : company.company_phone,
                company_email       : company.company_email,
                company_website     : company.company_website,
                company_address     : company.company_address,
                company_opening_date: company.company_opening_date,
                company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}/${company.company_picture}`,
                company_package     : company.company_company_package,
                company_package_code: company.company_package === null ? '' : company.company_package.company_package_name,
                company_package_name: company.company_package === null ? '' : company.company_package.company_package_name,
                company_status      : company.company_status,
                company_create_at   : company.company_create_at,
                company_update_at   : company.company_update_at
            },
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Register
exports.company_register = async (req, res) => {
    try {
        let company_data = await company_model.findOne({
            where: {
                company_name: req.body.company_name
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Company Name Exist!",
            data: '',
            });
        }

        // Phone Number
        company_data = await company_model.findOne({
            where: {
                company_phone: req.body.company_phone
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        company_data = await company_model.findOne({
            where: {
                company_email: req.body.company_email
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        // Username
        let user_data = await user_model.findOne({
            where: {
            username: req.body.username
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Username Exist!",
            data: '',
            });
        }

        // Phone Number
        user_data = await user_model.findOne({
            where: {
            user_phone: req.body.company_phone
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        user_data = await user_model.findOne({
            where: {
            user_email: req.body.company_email
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }
        const u_id_date = new Date();

        let company_picture;
        if (req.file == undefined) {
            company_picture = "assets/images/company/company-icon.png";
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const company_register = await company_model.create({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_company_package : req.body.company_package,
            company_picture     : company_picture,
            company_status      : 0,
        });

        if(!company_register) {
            return res.send({
                status: "0",
                message: "Company Register Failed!",
                data: "",
            });
        }

        const user_register = await user_model.create({
            user_name           : req.body.company_owner_name,
            username            : req.body.username,
            password            : bcrypt.hashSync(req.body.password, 10),
            password_show       : req.body.password,
            user_designation    : 'Company Owner',
            user_phone          : req.body.company_phone,
            user_email          : req.body.company_email,
            user_address        : req.body.company_address,
            user_company        : company_register.company_id,
            user_branch         : 0,
            user_user_group     : 3,
            user_picture        : 'assets/images/users/user-icon.png',
            user_language       : 'en',
            user_theme          : 'blue',
            user_status         : 0
        });

        if(!user_register) {
            return res.send({
                status: "0",
                message: "User Register Failed!",
                data: "",
            });
        }

        const user_id_number    = u_id_date.getFullYear().toString().substr(-2)+""+(u_id_date.getMonth()+1).toString().padStart(2, '0')+""+user_register.user_id.toString().padStart(6, '0');

        const user_update = await user_model.update(
            {
                user_id_number  : user_id_number
            },
            {
                where:{
                    user_id: user_register.user_id
                }
            }
        );

        const accounts_link_list = [
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_in_hand_bank",
                accounts_link_name  : "Cash in Hand & Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_in_hand",
                accounts_link_name  : "Cash in Hand",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash_at_bank",
                accounts_link_name  : "Cash at Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "cash",
                accounts_link_name  : "Cash",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "bank",
                accounts_link_name  : "Bank",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_cg",
                accounts_link_name  : "Excess of Income Over Expenditure (CG)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_gl",
                accounts_link_name  : "Excess of Income Over Expenditure (GL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "income_expenditure_sl",
                accounts_link_name  : "Excess of Income Over Expenditure (SL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_payment",
                accounts_link_name  : "Purchase Payment",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_due",
                accounts_link_name  : "Purchase Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_return",
                accounts_link_name  : "Purchase Return",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "purchase_return_due",
                accounts_link_name  : "Purchase Return Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_collection",
                accounts_link_name  : "Sales Collection",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_due",
                accounts_link_name  : "Sales Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_return",
                accounts_link_name  : "Sales Return",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "sales_return_due",
                accounts_link_name  : "Sales Return Due",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_cg",
                accounts_link_name  : "Investments (CG)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_gl",
                accounts_link_name  : "Investments (GL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "investments_sl",
                accounts_link_name  : "Investments (SL)",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "advance_payments",
                accounts_link_name  : "Advance Payments",
                accounts_link_status: 1
            },
            {
                accounts_link_company: company_register.company_id,
                accounts_link_code  : "advance_received",
                accounts_link_name  : "Advance Received",
                accounts_link_status: 1
            }
        ];
        const accounts_link_create = await accounts_link_model.bulkCreate(accounts_link_list);

        const get_coa_id = async(id) => {
            const data = await chart_of_accounts_model.findOne({
                where: {
                    chart_of_accounts_company       : company_register.company_id,
                    chart_of_accounts_code          : id,
                    chart_of_accounts_status        : 1,
                    chart_of_accounts_delete_status : 0,
                }
            });

            return data.chart_of_accounts_id;
        };
        
        const getAccountsLink = async(type, data) => {
            if(type == 'id') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_id;
            } else if(type == 'code') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_code;
            } else if(type == 'name') {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_name;
            } else {
                const get_data = await accounts_link_model.findOne({ where:{ accounts_link_code : data } });
                return get_data.accounts_link_name;
            }
        };

        const AC_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10100000',
                chart_of_accounts_name              : 'Fixed Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10200000',
                chart_of_accounts_name              : 'Current Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20100000',
                chart_of_accounts_name              : 'Funds',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_cg'),
                chart_of_accounts_accounts_link     : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20200000',
                chart_of_accounts_name              : 'Liabilities',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30100000',
                chart_of_accounts_name              : 'General Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30200000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40100000',
                chart_of_accounts_name              : 'General Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40200000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const AC_COA_create = await chart_of_accounts_model.bulkCreate(AC_COA);

        const CG_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101000',
                chart_of_accounts_name              : 'Property Plan & Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102000',
                chart_of_accounts_name              : 'Electrical & Electronics Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103000',
                chart_of_accounts_name              : 'Computers & Networks',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104000',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10100000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201000',
                chart_of_accounts_name              : 'Cash in Hand & Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10200000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_in_hand_bank'),
                chart_of_accounts_accounts_link     : 'cash_in_hand_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202000',
                chart_of_accounts_name              : 'Receivable',
                chart_of_accounts_accounts_category : await get_coa_id('10200000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Fund & Liabilities CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101000',
                chart_of_accounts_name              : 'Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20100000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_cg'),
                chart_of_accounts_accounts_link     : 'investments_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102000',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20100000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_cg'),
                chart_of_accounts_accounts_link     : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201000',
                chart_of_accounts_name              : 'Payable',
                chart_of_accounts_accounts_category : await get_coa_id('20200000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Income CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101000',
                chart_of_accounts_name              : 'Product Sales Income',
                chart_of_accounts_accounts_category : await get_coa_id('30100000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102000',
                chart_of_accounts_name              : 'Purchase Product Return Income',
                chart_of_accounts_accounts_category : await get_coa_id('30100000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30200000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Expense CG
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101000',
                chart_of_accounts_name              : 'Product Purchase Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40100000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102000',
                chart_of_accounts_name              : 'Sales Product Return Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40100000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40200000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const CG_COA_create = await chart_of_accounts_model.bulkCreate(CG_COA);
        
        const GL_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101100',
                chart_of_accounts_name              : 'Land Purchase & Development',
                chart_of_accounts_accounts_category : await get_coa_id('10101000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102100',
                chart_of_accounts_name              : 'Electrical Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10102000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102200',
                chart_of_accounts_name              : 'Electronics Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10102000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103100',
                chart_of_accounts_name              : 'Computers & Computer Accessories',
                chart_of_accounts_accounts_category : await get_coa_id('10103000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103200',
                chart_of_accounts_name              : 'Networks & Network Accessories',
                chart_of_accounts_accounts_category : await get_coa_id('10103000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104100',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10104000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201100',
                chart_of_accounts_name              : 'Cash in Hand',
                chart_of_accounts_accounts_category : await get_coa_id('10201000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_in_hand'),
                chart_of_accounts_accounts_link     : 'cash_in_hand',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201200',
                chart_of_accounts_name              : 'Cash at Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10201000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash_at_bank'),
                chart_of_accounts_accounts_link     : 'cash_at_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202100',
                chart_of_accounts_name              : 'Receivable from Customers',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202200',
                chart_of_accounts_name              : 'Receivable from Suppliers',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202300',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : await get_coa_id('10202000'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101100',
                chart_of_accounts_name              : 'Owner & Partner Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20101000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_gl'),
                chart_of_accounts_accounts_link     : 'investments_gl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102100',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20102000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_gl'),
                chart_of_accounts_accounts_link     : 'income_expenditure_gl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201100',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201200',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201300',
                chart_of_accounts_name              : 'Advance Received',
                chart_of_accounts_accounts_category : await get_coa_id('20201000'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            // Income
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101100',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : await get_coa_id('30101000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102100',
                chart_of_accounts_name              : 'Purchase Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('30102000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201100',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30201000'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101100',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('40101000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102100',
                chart_of_accounts_name              : 'Sales Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('40102000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201100',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40201000'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const GL_COA_create = await chart_of_accounts_model.bulkCreate(GL_COA);
        
        const SL_COA = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101101',
                chart_of_accounts_name              : 'Land Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('10101100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101102',
                chart_of_accounts_name              : 'Land Development',
                chart_of_accounts_accounts_category : await get_coa_id('10101100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102101',
                chart_of_accounts_name              : '2RM Cable',
                chart_of_accounts_accounts_category : await get_coa_id('10102100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102201',
                chart_of_accounts_name              : 'Television',
                chart_of_accounts_accounts_category : await get_coa_id('10102200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103101',
                chart_of_accounts_name              : 'Desktop Computer',
                chart_of_accounts_accounts_category : await get_coa_id('10103100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103201',
                chart_of_accounts_name              : 'Server Equipment',
                chart_of_accounts_accounts_category : await get_coa_id('10103200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104101',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : await get_coa_id('10104100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201101',
                chart_of_accounts_name              : 'Cash',
                chart_of_accounts_accounts_category : await get_coa_id('10201100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'cash'),
                chart_of_accounts_accounts_link     : 'cash',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201201',
                chart_of_accounts_name              : 'Bank',
                chart_of_accounts_accounts_category : await get_coa_id('10201200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'bank'),
                chart_of_accounts_accounts_link     : 'bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202101',
                chart_of_accounts_name              : 'Sales Due',
                chart_of_accounts_accounts_category : await get_coa_id('10202100'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_due'),
                chart_of_accounts_accounts_link     : 'sales_due',
                chart_of_accounts_status            : 1
            },
            
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202201',
                chart_of_accounts_name              : 'Purchase Return Due',
                chart_of_accounts_accounts_category : await get_coa_id('10202200'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_return_due'),
                chart_of_accounts_accounts_link     : 'purchase_return_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202301',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : await get_coa_id('10202300'),
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'advance_payments'),
                chart_of_accounts_accounts_link     : 'advance_payments',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101101',
                chart_of_accounts_name              : 'Owner Investments',
                chart_of_accounts_accounts_category : await get_coa_id('20101100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'investments_sl'),
                chart_of_accounts_accounts_link     : 'investments_sl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102101',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : await get_coa_id('20102100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'income_expenditure_sl'),
                chart_of_accounts_accounts_link     : 'income_expenditure_sl',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201101',
                chart_of_accounts_name              : 'Purchase Due',
                chart_of_accounts_accounts_category : await get_coa_id('20201100'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_due'),
                chart_of_accounts_accounts_link     : 'purchase_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201201',
                chart_of_accounts_name              : 'Sales Return Due',
                chart_of_accounts_accounts_category : await get_coa_id('20201200'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_return_due'),
                chart_of_accounts_accounts_link     : 'sales_return_due',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201301',
                chart_of_accounts_name              : 'Advance Received',
                chart_of_accounts_accounts_category : await get_coa_id('20201300'),
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'advance_received'),
                chart_of_accounts_accounts_link     : 'advance_received',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101101',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : await get_coa_id('30101100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_collection'),
                chart_of_accounts_accounts_link     : 'sales_collection',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102101',
                chart_of_accounts_name              : 'Purchase Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('30102100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_return'),
                chart_of_accounts_accounts_link     : 'purchase_return',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201101',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : await get_coa_id('30201100'),
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101101',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : await get_coa_id('40101100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'purchase_payment'),
                chart_of_accounts_accounts_link     : 'purchase_payment',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102101',
                chart_of_accounts_name              : 'Sales Product Return',
                chart_of_accounts_accounts_category : await get_coa_id('40102100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : await getAccountsLink('id', 'sales_return'),
                chart_of_accounts_accounts_link     : 'sales_return',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201101',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : await get_coa_id('40201100'),
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_accounts_link_id  : 0,
                chart_of_accounts_accounts_link     : null,
                chart_of_accounts_status            : 1
            }
        ];
        const SL_COA_create = await chart_of_accounts_model.bulkCreate(SL_COA);

        const financial_year_create = await financial_year_model.create({
                financial_year_company          : company_register.company_id,
                financial_year_starting_date    : '01',
                financial_year_starting_month   : '07',
                financial_year_closing_date     : '30',
                financial_year_closing_month    : '06',
                financial_year_status           : 1
            }
        );
        
        const company = await company_model.findOne({
            where:{
                company_id: company_register.company_id
            }
        });

        return res.send({
            status: "1",
            message: "Company Successfully Registered!",
            data: {
                company_id          : company.company_id,
                company_name        : company.company_name,
                company_owner_name  : company.company_owner_name,
                company_phone       : company.company_phone,
                company_email       : company.company_email,
                company_website     : company.company_website,
                company_address     : company.company_address,
                company_opening_date: company.company_opening_date,
                company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}/${company.company_picture}`,
                company_package     : company.company_company_package,
                company_status      : company.company_status,
                company_create_at   : company.company_create_at,
                company_update_at   : company.company_update_at
            }
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Update
exports.company_update = async (req, res) => {
    try {

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });
        const company = await company_model.findOne({
            where: {
                company_id: req.params.company_id
            }
        });

        if(!company) {
            return res.send({
                status: "0",
                message: "Company ID Not Found!",
                data: "",
            });
        }

        let company_picture;
        if (req.file == undefined) {
            company_picture = req.body.company_picture_old;
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const data = await company_model.update({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_picture     : company_picture,
            company_company_package: req.body.company_package,
            company_status      : req.body.company_status,
            company_update_by   : user_id
        },
        {
            where: {
                company_id : req.params.company_id
            }
        });

        if(data) {
            const company = await company_model.findOne({
                include: [
                    {
                        model: company_package_model,
                        association: company_model.hasOne(company_package_model, {
                            foreignKey : 'company_package_id',
                            sourceKey : "company_company_package",
                            required:false
                        })
                    }
                ],
                where: {
                    company_id: req.params.company_id
                }
            });

            if(req.body.company_status == 0) {
                const user_update = await user_model.update({
                    user_status: 0,
                },
                {
                    where: {
                        user_company: req.params.company_id,
                        user_status: 1,
                        user_delete_status: 0,
                    }
                });
            } else {
                const user_update = await user_model.update({
                    user_status: 1,
                },
                {
                    where: {
                        user_company: req.params.company_id,
                        user_status: 0,
                        user_delete_status: 0,
                    }
                });
            }

            return res.send({
                status: "1",
                message: "Company Update Successfully!",
                data: {
                    company_id          : company.company_id,
                    company_name        : company.company_name,
                    company_owner_name  : company.company_owner_name,
                    company_phone       : company.company_phone,
                    company_email       : company.company_email,
                    company_website     : company.company_website,
                    company_address     : company.company_address,
                    company_opening_date: company.company_opening_date,
                    company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}/${company.company_picture}`,
                    company_package     : company.company_company_package,
                    company_package_code: company.company_package === null ? '' : company.company_package.company_package_name,
                    company_package_name: company.company_package === null ? '' : company.company_package.company_package_name,
                    company_package     : company.company_package,
                    company_status      : company.company_status,
                    company_create_at   : company.company_create_at,
                    company_update_at   : company.company_update_at
                },
            });
        } else {
            return res.send({
                status: "0",
                message: "Company Update Failed!",
                data: "",
            });
        }

    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Delete
exports.company_delete = async (req, res) => {
    try {
        const company = await company_model.findOne({
            where: {
                company_id: req.params.company_id
            }
        });

        if(!company) {
            return res.send({
                status: "0",
                message: "Company ID Not Found!",
                data: "",
            });
        }

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await company_model.update({
            company_status          : 0,
            company_delete_status   : 1,
            company_delete_by       : user_id,
            company_delete_at       : new Date()
        },
        {
            where: {
                company_id : req.params.company_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Delete Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Delete Successfully!",
            data: "",
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Count
exports.company_count = async (req, res) => {
    try {
        const data = await company_model.count({
            where: {
                company_status: 1,
                company_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Count Successfully!",
            data: data,
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};