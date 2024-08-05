import Account from "../models/Account.js";
import TransactionLine from "../models/TransactionLine.js";

import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

class AccountController {
  async index(req, res) {
    try {
      const accounts = await Account.find();
      if(!accounts) { throw { code: 404, message: "ACCOUNT_DATA_NOT_FOUND", data: null, status: false } }
      
      return res.status(200).json({
        status: true,
        message: "LIST_ACCOUNT",
        data: accounts
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
      const { name, account_type } = req.body;
      if(!name) { return { status: false, code: 428, message: "NAME_IS_REQUIRED" } }
      if(!account_type) { return { status: false, code: 428, message: "TYPE_IS_REQUIRED" } }

      const document = new Account({ name: name, account_type: account_type });
      const account = await document.save();
      if(!account) { throw { code: 500, message: "Gagal Menambahkan data akun!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Berhasil menambahkan data akun!",
        data: account,
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

      const checkObjId = await checkValidationObjectId(id, Account, "ACCOUNT", true)
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      return res.status(200).json({
        status: true,
        message: "ACCOUNT_FOUND",
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
      
      const checkObjId = await checkValidationObjectId(id, Account, "ACCOUNT")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const account = await Account.findByIdAndUpdate( { _id: id }, req.body, { new: true } )
      if(!account) { throw { code: 500, message: "Gagal mengubah data akun!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Berhasil mengubah data akun!",
        data: account,
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
      
      const checkObjId = await checkValidationObjectId(id, Account, "ACCOUNT")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      // check if account has transaction
      const accounts = await TransactionLine.find({ accountId: id });
      if(accounts.length > 0) {
        return res.status(500).json({
          status: false,
          message: "Gagal menghapus akun karena telah memiliki riwayat transaksi!",
          data: null,
        });
      }

      const account = await Account.findOneAndDelete({ _id: id })
      if(!account) { throw { code: 500, message: "Gagal menghapus data akun!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Berhasil menghapus data akun!",
        data: account,
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

export default new AccountController;