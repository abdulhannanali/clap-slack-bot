const usersCache = require('../../data/users')
const Fuse = require('fuse.js')

const CLAP_TEXT = ':clap: :clap: :clap: :partyparrot:'
const REVERSE_CLAP_TEXT = CLAP_TEXT.split(' ').reverse().join(' ')

const fuseUser = new Fuse(usersCache, {
	include: ['matches'],
	threshold: 0.6,
	keys: [
		'name',
		'username'
	],
	distance: 1000,
	tokenize: true
})

function sanitizeText(text) {
	return text.replace(/[\[\]\/\\\"\'\|<>]/ig, " ")
}

function resolveUser (text = '') {
	if (!text) {
		return
	}

	const searchMatch = fuseUser.search(sanitizeText(text))

	if (searchMatch && searchMatch[0]) {
		return searchMatch[0].item.id
	}
}

function clapReply (userId) {
	return `${CLAP_TEXT}<@${userId}>${REVERSE_CLAP_TEXT}\nKeep it up! :+1:`
}

/**
  * respondClap
  * responds with a clap from the request object
  *
  */
function respondClap (req, res, next) {
	const text = req.body.text || ''
	const userId = resolveUser(text)

	if (userId) {
		res.json({
			text: clapReply(userId)
		})
	} else {
		next()
	}
}

function slackResponse (req, res, next) {
	const botName = req.body.bot_name
	const botId = req.body.bot_id
	const text = req.body.text

	if (text.match(/clapbot\s*help/i)) {
		return help(res)
	}

	if (botId && botName && isGitActivity(text)) {
		respondClap(req, res, next)
	} else {
		next()
	}
}

function isGitActivity (text) {
	return text.match(/gitlab.com/ig)
}

function help (res) {
	res.json({
		text: 'Clap bot claps :clap: :clap: :clap: and also does :partyparrot: :kissing_heart:'
	})
}

module.exports = {
	slackResponse: slackResponse
}