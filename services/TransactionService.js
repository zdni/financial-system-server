import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

import User from '../models/User.js';

class TransactionService {
  async generateData(req) {
    try {
      const { 
        name,
        date,
        userId,
        seq,
        state,
      } = req.body;

      if(!date) return { status: false, code: 428, message: "DATE_IS_REQUIRED" }

      // userId
      if(!userId) return { status: false, code: 428, message: "USER_IS_REQUIRED" }
      let checkUserObjId = await checkValidationObjectId(userId, User, "USER");
      if(!checkUserObjId.status) return checkUserObjId;

      let data = {
        name,
        date,
        userId,
        seq,
        state,
      };

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
        endDate,
        startDate,

        sort,
        page,
        limit,
      } = req.query;

      if(startDate || endDate) {
        query['date'] = {}
        if(startDate != 0) { Object.assign(query['date'], { $gte: new Date(startDate*1) }) };
        if(endDate != 0) { Object.assign(query['date'], { $lte: new Date(endDate*1) }) };
      }

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
}

export default new TransactionService;