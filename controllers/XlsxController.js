class XlsxController {
  async export(req, res) {
    try {
      
    } catch (error) {
      if(!err.code) { err.code = 500 }
      return res.status(err.code).json({
        status: false,
        message: err.message,
        data: null
      });
    }
  }
}

export default new XlsxController;