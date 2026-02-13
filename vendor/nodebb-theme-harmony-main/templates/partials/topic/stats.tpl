{{{ if ./crossposts.length }}}
<span class="badge text-body border border-gray-300 stats text-xs position-relative">
	<i class="fa-regular fa-fw fa-clone visible-xs-inline" title="[[global:crossposts]]"></i>
	<span component="topic/crosspost-count" title="{crossposts.length}" class="fw-bold">{humanReadableNumber(crossposts.length)}</span>
	<span class="hidden-xs text-lowercase fw-normal">[[global:crossposts]]</span>
	<a href="#" aria-label="[[aria:show-crossposts]]" id="show-crossposts" class="stretched-link"></a>
</span>
{{{ end }}}
<span class="badge text-body border border-gray-300 stats text-xs">
	<i class="fa-regular fa-fw fa-message visible-xs-inline" title="[[global:posts]]"></i>
	<span component="topic/post-count" title="{postcount}" class="fw-bold">{humanReadableNumber(postcount)}</span>
	<span class="hidden-xs text-lowercase fw-normal">[[global:posts]]</span>
</span>
<span class="badge text-body border border-gray-300 stats text-xs">
	<i class="fa fa-fw fa-user visible-xs-inline" title="[[global:posters]]"></i>
	<span title="{postercount}" class="fw-bold">{humanReadableNumber(postercount)}</span>
	<span class="hidden-xs text-lowercase fw-normal">[[global:posters]]</span>
</span>
<span class="badge text-body border border-gray-300 stats text-xs">
	<i class="fa fa-fw fa-eye visible-xs-inline" title="[[global:views]]"></i>
	<span class="fw-bold" title="{viewcount}">{humanReadableNumber(viewcount)}</span>
	<span class="hidden-xs text-lowercase fw-normal">[[global:views]]</span>
</span>

{{{ if ./followercount }}}
<span class="badge text-body border border-gray-300 stats text-xs">
	<i class="fa fa-fw fa-bell-o visible-xs-inline" title="[[global:watching]]"></i>
	<span class="fw-bold" title="{viewcount}">{humanReadableNumber(followercount)}</span>
	<span class="hidden-xs text-lowercase fw-normal">[[global:watching]]</span>
</span>
{{{ end }}}

<!-- Resolved/Open Status Badge -->
{{{ if topic.isResolved }}}
<span component="topic/resolved-status"
      class="badge text-body border border-success text-success stats text-xs">
	<i class="fa fa-fw fa-check-circle visible-xs-inline"></i>
	<span class="fw-bold">Resolved</span>
</span>
{{{ else }}}
<span component="topic/resolved-status"
      class="badge text-body border border-danger text-danger stats text-xs">
	<i class="fa fa-fw fa-circle-o visible-xs-inline"></i>
	<span class="fw-bold">Open</span>
</span>
{{{ end }}}