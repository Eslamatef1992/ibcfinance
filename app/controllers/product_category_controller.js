require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const product_category_model   = db.product_category_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Product Category List
exports.product_category_list = async (req, res) => {
    try {
        const product_category = await product_category_model.findAll({
            where: {
                product_category_company: req.query.company,
                product_category_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    product_category_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        product_category_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        product_category_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['product_category_code', 'ASC']
            ]
        });

        if(product_category.length > 0) {
            const product_category_data = await Promise.all(product_category.map(async (row) => ({
                product_category_id         : row.product_category_id ,
                product_category_company    : row.product_category_company,
                product_category_code       : row.product_category_code,
                product_category_name       : row.product_category_name,
                product_category_status     : row.product_category_status
            })));

            return res.send({
                status: "1",
                message: "Product Category Find Successfully!",
                data: product_category_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Category Not Found !",
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

// Product Category List Active
exports.product_category_list_active = async (req, res) => {
    try {
        const product_category = await product_category_model.findAll({
            where: {
                product_category_company: req.params.company,
                product_category_status: 1,
                product_category_delete_status: 0
            },
            order: [
                ['product_category_code', 'ASC']
            ]
        });

        if(product_category.length > 0) {
            const product_category_data = await Promise.all(product_category.map(async (row) => ({
                product_category_id          : row.product_category_id ,
                product_category_code        : row.product_category_code,
                product_category_company     : row.product_category_company,
                product_category_name        : row.product_category_name,
                product_category_status      : row.product_category_status
            })));

            return res.send({
                status: "1",
                message: "Product Category Find Successfully!",
                data: product_category_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Category Not Found !",
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

// Get Product Category
exports.get_product_category = async (req, res) => {
    try {
        const data = await product_category_model.findOne({
            where: {
                product_category_id: req.params.product_category_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Product Category Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Product Category Find Successfully!",
            data: {
                product_category_id: data.product_category_id,
                product_category_code: data.product_category_code,
                product_category_company: data.product_category_company,
                product_category_name: data.product_category_name,
                product_category_status: data.product_category_status
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

// Product Category Create
exports.product_category_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_category = await product_category_model.create({
            product_category_company   : req.body.product_category_company,
            product_category_code      : req.body.product_category_code,
            product_category_name      : req.body.product_category_name,
            product_category_status    : req.body.product_category_status,
            product_category_create_by : user_id,
        });

        if(product_category) {
            const data = await product_category_model.findOne({
                where: {
                    product_category_id: product_category.product_category_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Category Create Successfully!",
                data: {
                    product_category_id: data.product_category_id,
                    product_category_company: data.product_category_company,
                    product_category_code: data.product_category_code,
                    product_category_name: data.product_category_name,
                    product_category_status: data.product_category_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Product Category Create Error !",
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

// Product Category Update
exports.product_category_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_category_data = await product_category_model.findOne({
            where:{
                product_category_id: req.params.product_category_id
            }
        });

        if(!product_category_data) {
            return res.send({
                status: "0",
                message: "Product Category ID Not Found!",
                data: "",
            });
        }
        const product_category = await product_category_model.update({
            product_category_company   : req.body.product_category_company,
            product_category_code      : req.body.product_category_code,
            product_category_name      : req.body.product_category_name,
            product_category_status    : req.body.product_category_status,
            product_category_update_by : user_id,
        },
        {
            where:{
                product_category_id: req.params.product_category_id
            }
        });
        if(product_category) {
            const data = await product_category_model.findOne({
                where: {
                    product_category_id: req.params.product_category_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Category Update Successfully!",
                data: {
                    product_category_id: data.product_category_id,
                    product_category_company: data.product_category_company,
                    product_category_code: data.product_category_code,
                    product_category_name: data.product_category_name,
                    product_category_status: data.product_category_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Product Category Update Error!",
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

// Product Category Delete
exports.product_category_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_category_data = await product_category_model.findOne({
            where:{
                product_category_id: req.params.product_category_id
            }
        });

        if(!product_category_data) {
            return res.send({
                status: "0",
                message: "Product Category ID Not Found!",
                data: "",
            });
        }

        const product_category = await product_category_model.update({
            product_category_status        : 0,
            product_category_delete_status : 1,
            product_category_delete_by     : user_id,
            product_category_delete_at     : new Date(),
        },
        {
            where:{
                product_category_id: req.params.product_category_id
            }
        });

        return res.send({
            status: "1",
            message: "Product Category Delete Successfully!",
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