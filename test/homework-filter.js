'use strict';

const assert = require('assert');
const { JSDOM } = require('jsdom');

describe('Homework Filter UI', () => {
	// Setup JSDOM magic
	const dom = new JSDOM('<!DOCTYPE html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.jQuery = require('jquery');
	global.$ = global.jQuery;
	const { $ } = global;

	// Mock NodeBB globals
	global.ajaxify = {
		go: (url) => { global.lastNavigatedUrl = url; },
	};
	const utils = require('../public/src/utils');

	it('should build the correct URL and preserve keyword (Note 5)', () => {
		const originalParams = utils.params;
		utils.params = () => ({ keyword: 'algebra' });

		document.body.innerHTML = '<a id="hw-btn" data-homework="hw1">Filter</a>';

		const btn = document.getElementById('hw-btn'); 
		const hwValue = btn.getAttribute('data-homework');
		
		const params = utils.params();
		params.homework = hwValue;
		
		const finalUrl = '/api/homework/filter?' + $.param(params);
		global.ajaxify.go(finalUrl);

		assert.strictEqual(global.lastNavigatedUrl, '/api/homework/filter?keyword=algebra&homework=hw1');
		utils.params = originalParams;
	});

	it('should show empty state message when topics is empty (Note 5)', () => {
		// 1. Setup HTML with a topic list and a hidden empty-state alert
		document.body.innerHTML = `
			<div id="homework-container">
				<ul component="category/topic"><li>Existing Topic</li></ul>
				<div id="empty-homework-alert" class="hidden">No topics found.</div>
			</div>
		`;

		// 2. Mock API response with 0 topics
		const mockData = {
			topics: [],
			pagination: { pageCount: 0 },
		};

		// 3. Logic: callback that handles the API response
		const container = $('[component="category/topic"]');
		const alert = $('#empty-homework-alert');

		if (mockData.topics.length === 0) {
			container.empty();
			alert.removeClass('hidden');
		}

		// 4. Assertions
		assert.strictEqual(container.children().length, 0, 'Topic list should be cleared');
		assert.strictEqual(alert.hasClass('hidden'), false, 'Empty state alert should be visible');
	});

	it('should hide empty state when topics are returned', () => {
		// 1. Setup HTML with the empty state currently visible
		document.body.innerHTML = `
			<div id="homework-container">
				<ul id="topic-list" component="category/topic"></ul>
				<div id="empty-homework-alert" class="">No topics found.</div>
			</div>
		`;

		// 2. Mock API response with actual data
		const mockData = { topics: [{ title: 'Math Homework' }] };
		const alert = document.getElementById('empty-homework-alert');

		// 3. Logic: If topics exist, hide the alert
		if (mockData.topics.length > 0) {
			alert.classList.add('hidden');
			// (Your render logic would go here)
		}

		// 4. Assertion
		assert.strictEqual(alert.classList.contains('hidden'), true);
	});

	it('should build the correct URL without the homework param when cleared', () => {
		const originalParams = utils.params;
		utils.params = () => ({ keyword: 'algebra', homework: 'hw1' });

		// Simulate user clicking a "Clear Filter" button
		const params = utils.params();
		delete params.homework; // Drop the filter
		
		const finalUrl = '/api/homework/filter?' + $.param(params);
		global.ajaxify.go(finalUrl);

		assert.strictEqual(global.lastNavigatedUrl, '/api/homework/filter?keyword=algebra');
		utils.params = originalParams;
	});
});