import express 		from 'express';
const router = express.Router();


router.get('/', (req, res) => {
	res.render('frontend.ejs', { title: 'TipeWize'});
});

module.exports = router;