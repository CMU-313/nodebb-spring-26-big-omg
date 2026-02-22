'use strict';


define('sort', ['components'], function (components) {
	const module = {};

	module.handleSort = function (field, gotoOnSave) {
		const threadSort = components.get('thread/sort');
		threadSort.find('i').removeClass('fa-check');
		const currentSort = utils.params().sort || config[field];
		const currentSetting = threadSort.find('a[data-sort="' + currentSort + '"]');
		currentSetting.find('i').addClass('fa-check');

		$('body')
			.off('click', '[component="thread/sort"] a[data-sort]')
			.on('click', '[component="thread/sort"] a[data-sort]', function () {
				const newSetting = $(this).attr('data-sort');
				const urlParams = utils.params();
				urlParams.sort = newSetting;
				const qs = $.param(urlParams);
				ajaxify.go(gotoOnSave + (qs ? '?' + qs : ''));
			});
	};

	module.handleStatusFilter = function (gotoOnSave) {
		const currentStatus = utils.params().resolved || 'all';

		// Mark active status with check icon
		$('[component="thread/sort"] a[data-status]').each(function () {
			const status = $(this).attr('data-status');
			$(this).find('i').toggleClass('fa-check', status === currentStatus)
				.toggleClass('text-secondary', status !== currentStatus);
		});

		$('body')
			.off('click', '[component="thread/sort"] a[data-status]')
			.on('click', '[component="thread/sort"] a[data-status]', function (e) {
				e.preventDefault();
				e.stopPropagation();
				const newStatus = $(this).attr('data-status');
				const params = utils.params();
				if (newStatus === 'all') {
					delete params.resolved;
				} else {
					params.resolved = newStatus;
				}
				delete params.page;
				const qs = $.param(params);
				ajaxify.go(gotoOnSave + (qs ? '?' + qs : ''));
			});
	};

	return module;
});