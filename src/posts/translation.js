'use strict';

const TRANSLATOR_SERVICE_URL = process.env.TRANSLATOR_SERVICE_URL || '';
const TRANSLATOR_TIMEOUT_MS = parseInt(process.env.TRANSLATOR_TIMEOUT_MS || '10000', 10);

async function fetchTranslation(content, title = '') {
	if (!TRANSLATOR_SERVICE_URL || !content || !content.trim()) {
		return null;
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TRANSLATOR_TIMEOUT_MS);

	try {
		const url = new URL(`${TRANSLATOR_SERVICE_URL.replace(/\/$/, '')}/`);
		url.searchParams.set('content', content);
		if (title && title.trim()) {
			url.searchParams.set('title', title);
		}

		const response = await fetch(
			url,
			{
				method: 'GET',
				signal: controller.signal,
				headers: {
					Accept: 'application/json',
				},
			}
		);

		if (!response.ok) {
			return null;
		}

		const payload = await response.json();
		if (!payload || typeof payload.is_english !== 'boolean' || typeof payload.translated_content !== 'string') {
			return null;
		}

		if (payload.is_english || !payload.translated_content.trim()) {
			return null;
		}

		const translated = payload.translated_content.trim();
		if (title && translated.toLowerCase() === title.trim().toLowerCase()) {
			return null;
		}

		return translated;
	} catch (err) {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

module.exports = {
	fetchTranslation,
};
