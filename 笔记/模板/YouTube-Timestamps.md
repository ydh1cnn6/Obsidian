<%*
/* 使用教程
1、笔记熟悉添加url属性
2、笔记添加时间戳
YT=01:30 这里介绍了第一个重要概念 
YT=05:18 这里有一个精彩的演示
3、快捷键alt+E,使用该模板
*/
// define function to replace timestamps in file
async function replaceTimestamp () {
	const regexHHMM = /YT=((\d+):([0-5]\d))/g; 
	// change "YT=" if you want a different search term. currently videos cannot be longer than 99m59s
	var content = tp.file.content; // *content of file*
	var matches = content.matchAll(regexHHMM); // *find all regex matches in file*
	for(let match of matches){
		content = content.replace(
			match[0], 
			"["+match[1]+"]("+urlPrompt+"&t="+match[2]+"m"+match[3]+"s)"
			); // *make YouTube URL from first match*
	}
	var file = app.workspace.activeLeaf.view.file; // *get current file*
	await app.vault.modify(file, content); // *replace content with new content*
}

// if url is in frontmatter and contains youtube, check if it contains http then run function, else prompt user for url
var url = tp.frontmatter.url; // *get url field from frontmatter*
if(url != undefined && url.contains("youtu") === true){
	if (url.includes("https://") === false){
		url = "https://" + url;
		};
	urlPrompt = url;
	await replaceTimestamp();
} else {	
if(url === undefined){url = "Enter a YouTube URL"}; // *if url doesnt exist*
var urlPrompt;
while(urlPrompt == null || urlPrompt.length < 1 || urlPrompt.contains("youtu") === false){urlPrompt = (await tp.system.prompt("YouTube URL:", url, 1))}; 
// *proper conditions are not met, reprompt*
if (urlPrompt.includes("https://") === false){urlPrompt = "https://" + urlPrompt}
await replaceTimestamp();
}
%>