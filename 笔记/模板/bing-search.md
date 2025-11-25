<%*
/**教程
1、选中对应的文本
2、alt+E，使用模板（会转换为搜索该文本的链接）
**/
  const selection = tp.file.selection();
  if (selection === '') {
    new Notice('Please select some text first!');
  } else {
    const searchQuery = encodeURIComponent(selection);
    var bingSearch = `https://www.bing.com/search?q=${searchQuery}`;
    tR += `[${selection}](${bingSearch})`;
  }
%>