const router = require('express').Router()
const bodyParser = require('body-parser')
const slack = require('./lib/slack')

const SLACK_TOKEN = process.env.SLACK_TOKEN

router.use(bodyParser.urlencoded({ extended: true }))

if (SLACK_TOKEN) {
	router.use(function slackVerifier (req, res, next) {
		const token = req.body && req.body.token

		if (token === SLACK_TOKEN) {
			next()
		} else {
			next(new Error('yo'))
		}
	})
}

router.post('/slack.clapresponse', slack.slackResponse)
router.use((req, res, next) => res.send())
router.use(function (error, req, res, next) {
	if (error && error.message === 'yo') {
		res.status(200).send()
	} else {
		next(error)
	}
})

module.exports = router