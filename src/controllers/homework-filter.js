'use strict';

const nconf = require('nconf');

const meta = require('../meta');
const topics = require('../topics');
const utils = require('../utils');

const homeworkFilterController = module.exports;
const relativePath = nconf.get('relative_path') || '';
const validSorts = new Set(['recent', 'old', 'create', 'posts', 'votes', 'views']);
const validTerms = new Set(['alltime', 'day', 'week', 'month', 'year']);
const validFilters = new Set(['', 'new', 'watched', 'unreplied']);

homeworkFilterController.get = async function (req, res) {
	const homeworkRaw = req.query.homework || req.query.hw || req.query.tag;
	const homeworkTag = utils.cleanUpTag(String(homeworkRaw || ''), meta.config.maximumTagLength);
	const minimumTagLength = meta.config.minimumTagLength || 3;

	if (!homeworkTag || homeworkTag.length < minimumTagLength) {
		return res.status(400).json({
			error: `homework/tag is required and must be at least ${minimumTagLength} characters`,
		});
	}

	const keyword = String(req.query.keyword || '').trim().toLowerCase();
	const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
	const perPage = clampInt(req.query.perPage, 20, 1, 100);
	const sort = validSorts.has(req.query.sort) ? req.query.sort : 'recent';
	const term = validTerms.has(req.query.term) ? req.query.term : 'alltime';
	const filter = validFilters.has(req.query.filter) ? req.query.filter : '';
	const cids = parseCids(req.query.cid);

	const data = await topics.getSortedTopics({
		cids,
		tags: [homeworkTag],
		uid: req.uid,
		start: 0,
		stop: -1,
		filter,
		term,
		sort,
		query: req.query,
	});

	const filteredTopics = keyword ?
		data.topics.filter(topic => topicMatchesKeyword(topic, keyword)) :
		data.topics;

	const total = filteredTopics.length;
	const pageCount = Math.max(1, Math.ceil(total / perPage));
	const start = (page - 1) * perPage;
	const end = start + perPage;
	const topicsPage = filteredTopics.slice(start, end).map(topic => ({
		tid: topic.tid,
		title: topic.title,
		slug: topic.slug,
		url: `${relativePath}/topic/${topic.slug || topic.tid}`,
		cid: topic.cid,
		category: topic.category ? {
			cid: topic.category.cid,
			name: topic.category.name,
			slug: topic.category.slug,
		} : null,
		user: topic.user ? {
			uid: topic.user.uid,
			username: topic.user.username,
			userslug: topic.user.userslug,
		} : null,
		tags: (topic.tags || []).map(tag => tag.value),
		timestamp: topic.timestamp,
		lastposttime: topic.lastposttime,
	}));

	res.json({
		homework: homeworkTag,
		keyword,
		sort,
		term,
		filter,
		cids: cids || [],
		pagination: {
			page,
			perPage,
			total,
			pageCount,
			hasNext: page < pageCount,
			hasPrev: page > 1,
		},
		topics: topicsPage,
	});
};

function topicMatchesKeyword(topic, keyword) {
	const title = String(topic.titleRaw || topic.title || '').toLowerCase();
	const tagValues = (topic.tags || []).map(tag => String(tag.value || '').toLowerCase());
	return title.includes(keyword) || tagValues.some(tag => tag.includes(keyword));
}

function clampInt(value, fallback, min, max) {
	const parsed = parseInt(value, 10);
	if (!Number.isFinite(parsed)) {
		return fallback;
	}
	return Math.max(min, Math.min(max, parsed));
}

function parseCids(queryCid) {
	if (!queryCid) {
		return undefined;
	}
	const values = Array.isArray(queryCid) ? queryCid : [queryCid];
	const cids = values
		.flatMap(value => String(value).split(','))
		.map(value => parseInt(value, 10))
		.filter(value => Number.isFinite(value) && value >= 0);
	return cids.length ? cids : undefined;
}
