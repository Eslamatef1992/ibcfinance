const multer        = require("multer");
const SharpMulter   =  require("sharp-multer");

const image_fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Upload Only Images.", false);
    }
};

const common_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

const profile_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/users/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

const company_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/company/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

const product_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/products/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

const customer_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/customers/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

const supplier_storage = SharpMulter ({
    destination:(req, file, cb) => cb(null, "public/assets/images/suppliers/"),
    imageOptions:{
        fileFormat: "jpg",
        quality: 80,
        resize: {
            width: 300,
            height: 300
        },
        useTimestamp:true,
    }
});

common_picture      = multer({ storage: common_storage, fileFilter: image_fileFilter });
profile_picture     = multer({ storage: profile_storage, fileFilter: image_fileFilter });
company_picture     = multer({ storage: company_storage, fileFilter: image_fileFilter });
product_picture     = multer({ storage: product_storage, fileFilter: image_fileFilter });
customer_picture    = multer({ storage: customer_storage, fileFilter: image_fileFilter });
supplier_picture    = multer({ storage: supplier_storage, fileFilter: image_fileFilter });

const upload_middleware = {
    common_picture,
    profile_picture,
    company_picture,
    product_picture,
    customer_picture,
    supplier_picture
}

module.exports = upload_middleware;