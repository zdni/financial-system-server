import fs from 'fs';
import Document from "../models/Document.js";

import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

class DocumentController {
  async index(req, res) {
    try {
      const documents = await Document.find();
      if(!documents) { throw { code: 404, message: "DOCUMENT_DATA_NOT_FOUND", data: null, status: false } }
      
      return res.status(200).json({
        status: true,
        message: "LIST_DOCUMENT",
        data: documents
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
      const { name, document_type } = req.body;
      if(!name) { return { status: false, code: 428, message: "NAME_IS_REQUIRED" } }
      if(!document_type) { return { status: false, code: 428, message: "TYPE_IS_REQUIRED" } }

      const data = new Document({ name: name, document_type: document_type });
      const document = await data.save();
      if(!document) { throw { code: 500, message: "Export File Gagal!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Export File Berhasil!",
        data: document,
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
      
      const checkObjId = await checkValidationObjectId(id, Document, "DOCUMENT", true)
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const document = await Document.findOneAndDelete({ _id: id })
      if(!document) { throw { code: 500, message: "Gagal menghapus file!", data: null, status: false } }

      const filepath = `exports/${checkObjId.data.name}`;

      fs.stat('foo.txt', function(err, stat) {
        if (err == null) {
          fs.unlink(filepath, (err) => {
            if(err) {
              console.log(err)
              return res.status(500).json({
                status: false,
                message: "Gagal menghapus file pada server!",
                data: null
              });
            }
          })
        } else {
          console.log('Some other error: ', err.code);
        }
      });

      return res.status(200).json({
        status: true,
        message: "Berhasil menghapus file!",
        data: document,
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

export default new DocumentController;