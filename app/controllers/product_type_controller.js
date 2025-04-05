require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const product_type_model   = db.product_type_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Product Type List
exports.product_type_list = async (req, res) => {
    try {
        const product_type = await product_type_model.findAll({
            where: {
                product_type_company: req.query.company,
                product_type_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    product_type_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        product_type_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        product_type_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['product_type_code', 'ASC']
            ]
        });

        if(product_type.length > 0) {
            const product_type_data = await Promise.all(product_type.map(async (row) => ({
                product_type_id         : row.product_type_id ,
                product_type_company    : row.product_type_company,
                product_type_code       : row.product_type_code,
                product_type_name       : row.product_type_name,
                product_type_status     : row.product_type_status
            })));

            return res.send({
                status: "1",
                message: "Product Type Find Successfully!",
                data: product_type_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Type Not Found !",
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

// Product Type List Active
exports.product_type_list_active = async (req, res) => {
    try {
        const product_type = await product_type_model.findAll({
            where: {
                product_type_company: req.params.company,
                product_type_status: 1,
                product_type_delete_status: 0
            },
            order: [
                ['product_type_code', 'ASC']
            ]
        });

        if(product_type.length > 0) {
            const product_type_data = await Promise.all(product_type.map(async (row) => ({
                product_type_id          : row.product_type_id ,
                product_type_code        : row.product_type_code,
                product_type_company     : row.product_type_company,
                product_type_name        : row.product_type_name,
                product_type_status      : row.product_type_status
            })));

            return res.send({
                status: "1",
                message: "Product Type Find Successfully!",
                data: product_type_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Type Not Found !",
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

// Get Product Type
exports.get_product_type = async (req, res) => {
    try {
        const data = await product_type_model.findOne({
            where: {
                product_type_id: req.params.product_type_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Product Type Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Product Type Find Successfully!",
            data: {
                product_type_id: data.product_type_id,
                product_type_code: data.product_type_code,
                product_type_company: data.product_type_company,
                product_type_name: data.product_type_name,
                product_type_status: data.product_type_status
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

// Product Type Create
exports.product_type_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_type = await product_type_model.create({
            product_type_company   : req.body.product_type_company,
            product_type_code      : req.body.product_type_code,
            product_type_name      : req.body.product_type_name,
            product_type_status    : req.body.product_type_status,
            product_type_create_by : user_id,
        });

        if(product_type) {
            const data = await product_type_model.findOne({
                where: {
                    product_type_id: product_type.product_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Type Create Successfully!",
                data: {
                    product_type_id: data.product_type_id,
                    product_type_company: data.product_type_company,
                    product_type_code: data.product_type_code,
                    product_type_name: data.product_type_name,
                    product_type_status: data.product_type_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Product Type Create Error !",
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

// Product Type Update
exports.product_type_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_type_data = await product_type_model.findOne({
            where:{
                product_type_id: req.params.product_type_id
            }
        });

        if(!product_type_data) {
            return res.send({
                status: "0",
                message: "Product Type ID Not Found!",
                data: "",
            });
        }
        const product_type = await product_type_model.update({
            product_type_company   : req.body.product_type_company,
            product_type_code      : req.body.product_type_code,
            product_type_name      : req.body.product_type_name,
            product_type_status    : req.body.product_type_status,
            product_type_update_by : user_id,
        },
        {
            where:{
                product_type_id: req.params.product_type_id
            }
        });
        if(product_type) {
            const data = await product_type_model.findOne({
                where: {
                    product_type_id: req.params.product_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Type Update Successfully!",
                data: {
                    product_type_id: data.product_type_id,
                    product_type_company: data.product_type_company,
                    product_type_code: data.product_type_code,
                    product_type_name: data.product_type_name,
                    product_type_status: data.product_type_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Product Type Update Error!",
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

// Product Type Delete
exports.product_type_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_type_data = await product_type_model.findOne({
            where:{
                product_type_id: req.params.product_type_id
            }
        });

        if(!product_type_data) {
            return res.send({
                status: "0",
                message: "Product Type ID Not Found!",
                data: "",
            });
        }

        const product_type = await product_type_model.update({
            product_type_status        : 0,
            product_type_delete_status : 1,
            product_type_delete_by     : user_id,
            product_type_delete_at     : new Date(),
        },
        {
            where:{
                product_type_id: req.params.product_type_id
            }
        });

        return res.send({
            status: "1",
            message: "Product Type Delete Successfully!",
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