import wkhtmltopdf from 'wkhtmltopdf'
import fs from 'node:fs'

class PDFController {
  async export(req, res) {
    try {
      wkhtmltopdf('http://google.com/', { pageSize: 'letter' }).pipe(fs.createWriteStream('out.pdf'));
      
      return res.status(200).json({
        status: true,
        message: "SUCCESS_EXPORT",
      });
    } catch (error) {
      if(!error.code) { error.code = 500 }
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new PDFController;