import mongoose from "mongoose";

import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

import Account from '../models/Account.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

class TransactionService {
  async generateData(req) {
    try {
      const { 
        accountId,
        credit,
        date,
        debit,
        label,
        userId,
        vendorId,
      } = req.query;

      if(!date) return { status: false, code: 428, message: "DATE_IS_REQUIRED" }
      
      // accountId
      if(!accountId) return { status: false, code: 428, message: "ACCOUNT_IS_REQUIRED" }
      let checkAccountObjId = await checkValidationObjectId(accountId, Account, "ACCOUNT");
      if(!checkAccountObjId.status) return checkAccountObjId;

      // userId
      if(!userId) return { status: false, code: 428, message: "USER_IS_REQUIRED" }
      let checkUserObjId = await checkValidationObjectId(userId, User, "USER");
      if(!checkUserObjId.status) return checkUserObjId;

      let data = {
        accountId,
        date,
        userId,
      };
      
      // vendorId
      if(vendorId) {
        let checkVendorObjId = await checkValidationObjectId(vendorId, Vendor, "VENDOR");
        if(!checkVendorObjId.status) return checkVendorObjId;

        data['vendorId'] = vendorId;
      }

      if(credit) data['credit'] = credit;
      if(debit) data['debit'] = debit;
      if(label) data['label'] = label;

      return { status: true, data };
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }

  async generateQuerySearch(req) {
    try {
      let query = {};
      const {
        accountId,
        credit,
        debit,
        endDate,
        startDate,
        vendorId,

        sort,
        page,
        limit,
      } = req.query;

      if(accountId) {
        let checkObjId = await checkValidationObjectId(accountId, Account, "ACCOUNT");
        if(checkObjId.status) query['accountId'] = new mongoose.Types.ObjectId(accountId);
      }
      if(vendorId) {
        let checkObjId = await checkValidationObjectId(vendorId, Vendor, "VENDOR");
        if(checkObjId.status) query['vendorId'] = new mongoose.Types.ObjectId(vendorId);
      }

      if(startDate || endDate) {
        query['date'] = {}
        if(startDate != 0) { Object.assign(query['date'], { $gte: startDate }) };
        if(endDate != 0) { Object.assign(query['date'], { $lte: endDate }) };
      }

      if(debit > 0) query['debit'] = { $gte: parseFloat(debit) };
      if(credit > 0) query['credit'] = { $gte: parseFloat(credit) };

      const aggregate = [ { $match: query } ]

      if(sort) {
        if(sort.includes('-')) {
          aggregate.push({ $sort: { [sort.substring(1)]: -1 } })
        } else {
          aggregate.push({ $sort: { [sort]: 1 } })
        }
      }

      aggregate.push({
        $lookup: {
          from: "accounts",
          localField: "accountId",
          foreignField: "_id",
          as: "accountId"
        }
      })
      aggregate.push({ $unwind: {"path": '$accountId', "preserveNullAndEmptyArrays": true} })
      aggregate.push({
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorId"
        }
      })
      aggregate.push({ $unwind: {"path": '$vendorId', "preserveNullAndEmptyArrays": true} })
      aggregate.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      })
      aggregate.push({ $unwind: {"path": '$userId', "preserveNullAndEmptyArrays": true} })

      if(limit) {
        const skip = ((Number(page) !== 0 && !isNaN(Number(page))) && (Number(limit) !== 0 && !isNaN(Number(limit)))) ? (Number(page) - 1) * Number(limit) : 0
        aggregate.push({ $skip: skip })
        aggregate.push({ $limit: Number(limit) })
      }

      return { status: true, aggregate };
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }

  async generateQueryGroup(req) {
    try {
      const { group } = req.query;

      const query = [];

      if(group === 'account') {
        query.push(
          {
            $lookup: {
              from: "accounts",
              localField: "accountId",
              foreignField: "_id",
              as: "result"
            }
          },
          {
            $group: { _id: "$result", total: { $sum: 1 } }
          }
        )
      }
      if(group === 'vendor') {
        query.push(
          {
            $lookup: {
              from: "vendors",
              localField: "vendorId",
              foreignField: "_id",
              as: "result"
            }
          },
          {
            $group: { _id: "$result", total: { $sum: 1 } }
          }
        )
      }

      if(query.length == 0) return {status: false, code: 400}

      return { status: true, query }
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }
}

export default new TransactionService;