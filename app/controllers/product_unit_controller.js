require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const product_unit_model   = db.product_unit_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Product Unit List
exports.product_unit_list = async (req, res) => {
    try {
        const product_unit = await product_unit_model.findAll({
            where: {
                product_unit_company: req.query.company,
                product_unit_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    product_unit_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        product_unit_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        product_unit_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['product_unit_code', 'ASC']
            ]
        });

        if(product_unit.length > 0) {
            const product_unit_data = await Promise.all(product_unit.map(async (row) => ({
                product_unit_id         : row.product_unit_id ,
                product_unit_company    : row.product_unit_company,
                product_unit_code       : row.product_unit_code,
                product_unit_name       : row.product_unit_name,
                product_unit_status     : row.product_unit_status
            })));

            return res.send({
                status: "1",
                message: "Product Unit Find Successfully!",
                data: product_unit_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Unit Not Found !",
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

// Product Unit List Active
exports.product_unit_list_active = async (req, res) => {
    try {
        const product_unit = await product_unit_model.findAll({
            where: {
                product_unit_company: req.params.company,
                product_unit_status: 1,
                product_unit_delete_status: 0
            },
            order: [
                ['product_unit_code', 'ASC']
            ]
        });

        if(product_unit.length > 0) {
            const product_unit_data = await Promise.all(product_unit.map(async (row) => ({
                product_unit_id          : row.product_unit_id ,
                product_unit_code        : row.product_unit_code,
                product_unit_company     : row.product_unit_company,
                product_unit_name        : row.product_unit_name,
                product_unit_status      : row.product_unit_status
            })));

            return res.send({
                status: "1",
                message: "Product Unit Find Successfully!",
                data: product_unit_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Unit Not Found !",
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

// Get Product Unit
exports.get_product_unit = async (req, res) => {
    try {
        const data = await product_unit_model.findOne({
            where: {
                product_unit_id: req.params.product_unit_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Product Unit Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Product Unit Find Successfully!",
            data: {
                product_unit_id: data.product_unit_id,
                product_unit_code: data.product_unit_code,
                product_unit_company: data.product_unit_company,
                product_unit_name: data.product_unit_name,
                product_unit_status: data.product_unit_status
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

// Product Unit Create
exports.product_unit_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_unit = await product_unit_model.create({
            product_unit_company   : req.body.product_unit_company,
            product_unit_code      : req.body.product_unit_code,
            product_unit_name      : req.body.product_unit_name,
            product_unit_status    : req.body.product_unit_status,
            product_unit_create_by : user_id,
        });

        if(product_unit) {
            const data = await product_unit_model.findOne({
                where: {
                    product_unit_id: product_unit.product_unit_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Unit Create Successfully!",
                data: {
                    product_unit_id: data.product_unit_id,
                    product_unit_company: data.product_unit_company,
                    product_unit_code: data.product_unit_code,
                    product_unit_name: data.product_unit_name,
                    product_unit_status: data.product_unit_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Product Unit Create Error !",
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

// Product Unit Update
exports.product_unit_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_unit_data = await product_unit_model.findOne({
            where:{
                product_unit_id: req.params.product_unit_id
            }
        });

        if(!product_unit_data) {
            return res.send({
                status: "0",
                message: "Product Unit ID Not Found!",
                data: "",
            });
        }
        const product_unit = await product_unit_model.update({
            product_unit_company   : req.body.product_unit_company,
            product_unit_code      : req.body.product_unit_code,
            product_unit_name      : req.body.product_unit_name,
            product_unit_status    : req.body.product_unit_status,
            product_unit_update_by : user_id,
        },
        {
            where:{
                product_unit_id: req.params.product_unit_id
            }
        });
        if(product_unit) {
            const data = await product_unit_model.findOne({
                where: {
                    product_unit_id: req.params.product_unit_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Unit Update Successfully!",
                data: {
                    product_unit_id: data.product_unit_id,
                    product_unit_company: data.product_unit_company,
                    product_unit_code: data.product_unit_code,
                    product_unit_name: data.product_unit_name,
                    product_unit_status: data.product_unit_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Product Unit Update Error!",
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

// Product Unit Delete
exports.product_unit_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_unit_data = await product_unit_model.findOne({
            where:{
                product_unit_id: req.params.product_unit_id
            }
        });

        if(!product_unit_data) {
            return res.send({
                status: "0",
                message: "Product Unit ID Not Found!",
                data: "",
            });
        }

        const product_unit = await product_unit_model.update({
            product_unit_status        : 0,
            product_unit_delete_status : 1,
            product_unit_delete_by     : user_id,
            product_unit_delete_at     : new Date(),
        },
        {
            where:{
                product_unit_id: req.params.product_unit_id
            }
        });

        return res.send({
            status: "1",
            message: "Product Unit Delete Successfully!",
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