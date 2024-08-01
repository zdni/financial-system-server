import Vendor from "../models/Vendor.js";
import TransactionLine from "../models/TransactionLine.js";

import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

class VendorController {
  async index(req, res) {
    try {
      const vendors = await Vendor.find();
      if(!vendors) { throw { code: 404, message: "VENDOR_DATA_NOT_FOUND", data: null, status: false } }
      
      return res.status(200).json({
        status: true,
        message: "LIST_VENDOR",
        data: vendors
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async store(req, res) {
    try {
      const { name } = req.body;
      if(!name) { return { status: false, code: 428, message: "NAME_IS_REQUIRED" } }

      const document = new Vendor({ name: name });
      const vendor = await document.save();
      if(!vendor) { throw { code: 500, message: "FAILED_CREATE_VENDOR", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_CREATE_VENDOR",
        data: vendor,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async show(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 428, message: "ID_REQUIRED", data: null, status: false } }

      const checkObjId = await checkValidationObjectId(id, Vendor, "VENDOR", true)
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      return res.status(200).json({
        status: true,
        message: "VENDOR_FOUND",
        data: { ...checkObjId.data._doc }
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async update(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 420, message: "ID_REQUIRED", data: null, status: false } }
      
      const checkObjId = await checkValidationObjectId(id, Vendor, "VENDOR")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const vendor = await Vendor.findByIdAndUpdate( { _id: id }, req.body, { new: true } )
      if(!vendor) { throw { code: 500, message: "VENDOR_UPDATE_FAILED", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "VENDOR_UPDATE_SUCCESS",
        data: vendor,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async destroy(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 420, message: "ID_REQUIRED", data: null, status: false } }
      
      const checkObjId = await checkValidationObjectId(id, Vendor, "VENDOR")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      // check if account has transaction
      const vendors = await TransactionLine.find({ accountId: id });
      if(vendors.length > 0) {
        return res.status(500).json({
          status: false,
          message: "Gagal menghapus Vendor karena telah memiliki riwayat transaksi!",
          data: null,
        });
      }

      const vendor = await Vendor.findOneAndDelete({ _id: id })
      if(!vendor) { throw { code: 500, message: "VENDOR_DELETE_FAILED", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "VENDOR_DELETE_SUCCESS",
        data: vendor,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }
}

export default new VendorController;