[1mdiff --git a/src/topics/data.js b/src/topics/data.js[m
[1mindex a5801e0..45ba1ec 100644[m
[1m--- a/src/topics/data.js[m
[1m+++ b/src/topics/data.js[m
[36m@@ -13,7 +13,7 @@[m [mconst intFields = [[m
 	'viewcount', 'postercount', 'followercount',[m
 	'deleted', 'locked', 'pinned', 'pinExpiry',[m
 	'timestamp', 'upvotes', 'downvotes',[m
[31m-	'lastposttime', 'deleterUid',[m
[32m+[m	[32m'lastposttime', 'deleterUid','resolved',[m
 ];[m
 [m
 module.exports = function (Topics) {[m
[36m@@ -22,20 +22,24 @@[m [mmodule.exports = function (Topics) {[m
 			return [];[m
 		}[m
 [m
[32m+[m		[32mfields = Array.isArray(fields) ? fields : [];[m
[32m+[m[41m		[m
 		// "scheduled" is derived from "timestamp"[m
 		if (fields.includes('scheduled') && !fields.includes('timestamp')) {[m
 			fields.push('timestamp');[m
 		}[m
 [m
[32m+[m		[32mconst isDefaultFetch = !fields || !fields.length;[m
[32m+[m		[32mconst fieldsToFetch = isDefaultFetch ? [...intFields, 'title', 'slug', 'tags', 'thumbs'] : fields;[m
 		const keys = tids.map(tid => `topic:${tid}`);[m
[31m-		const topics = await db.getObjects(keys, fields);[m
[32m+[m		[32mconst topics = await db.getObjects(keys, fieldsToFetch);[m
 		const result = await plugins.hooks.fire('filter:topic.getFields', {[m
 			tids: tids,[m
 			topics: topics,[m
[31m-			fields: fields,[m
[32m+[m			[32mfields: fieldsToFetch,[m
 			keys: keys,[m
 		});[m
[31m-		result.topics.forEach(topic => modifyTopic(topic, fields));[m
[32m+[m		[32mresult.topics.forEach(topic => modifyTopic(topic, fieldsToFetch));[m
 		return result.topics;[m
 	};[m
 [m
