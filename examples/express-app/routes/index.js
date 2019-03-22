var express = require('express');
var router = express.Router();
var currencyCourseProvider = require('currency-course-provider');

currencyCourseProvider.init(1000);

/* GET home page. */
router.get('/:from/:to', function(req, res, next) {
    res.send(JSON.stringify(currencyCourseProvider.getCurrencyCourseData(req.params.from, req.params.to)));
    // res.send(JSON.stringify(getCurrencyCourseData(req.params.from, req.params.to)));
});

module.exports = router;
