<%* 
/**教程
1、选中对应的文本
2、alt+E，使用模板（会转换为标注块）
**/
//get selection
noteContent = tp.file.selection();
//get array of lines
lines = noteContent.split('\n')
//make a new string with > prepended to each line
let newContent = "";
lines.forEach(l => {
	newContent += '> ' + l + "\n";
})
//remove the last newline character
newContent = newContent.replace(/\n$/, "");
//define callout header
header = "> [!quote]-\n"
// Return the complete callout block
return header + newContent;
%>
