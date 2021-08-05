const errorHandler = (req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        messsage: error.messsage,
        stack: process.any.NODE_ENV === 'production' ? "Error" :error.stack
    })
}

module.exports = errorHandler

//Standard Middleware