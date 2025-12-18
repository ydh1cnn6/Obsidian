---
title: aaaaa
updateDate: 2025-11-26 14:02:09
---

```dataviewjs
const libraries = [
    { src: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', name: 'marked' },
    { src: 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js', name: 'DOMPurify' },
    { src: 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js', name: 'Sortable' },
    { src: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js', name: 'hljs' }
];

// ==============================================================================
// ==                          增强日志系统                                     ==
// ==============================================================================
const DEBUG = {
    ENABLED: true,
    LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4 },
    currentLevel: 4
};

const log = (level, component, message, data = {}) => {
    if (!DEBUG.ENABLED || level > DEBUG.currentLevel) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    const levelName = levelNames[level];
    const colors = { ERROR: '#ef4444', WARN: '#f59e0b', INFO: '#3b82f6', DEBUG: '#10b981', TRACE: '#8b5cf6' };
    
    console.log(`%c[${timestamp}] ${levelName} [${component}] ${message}`, `color: ${colors[levelName]}; font-weight: bold;`, data);
};

const logError = (component, message, data) => log(0, component, message, data);
const logWarn = (component, message, data) => log(1, component, message, data);
const logInfo = (component, message, data) => log(2, component, message, data);
const logDebug = (component, message, data) => log(3, component, message, data);
const logTrace = (component, message, data) => log(4, component, message, data);

// 全局状态检查函数
const checkGlobalState = () => {
    return {
        isResizing,
        startX,
        initialLeftWidth,
        initialRightWidth,
        leftColEl: !!leftColEl,
        rightColEl: !!rightColEl,
        columnsCount: columns.length,
        documentCursor: document.body.style.cursor,
        documentUserSelect: document.body.style.userSelect,
        resizingBodyClass: document.body.classList.contains('resizing-body'),
        activeElement: document.activeElement ? `${document.activeElement.tagName}.${document.activeElement.className}` : 'null'
    };
};

const loadedLibraries = new Set();
const loadLibrary = (lib) => {
    return new Promise((resolve, reject) => {
        if (loadedLibraries.has(lib.name) && window[lib.name]) {
            logDebug('LIB', `${lib.name} is already loaded`);
            return resolve();
        }
        logInfo('LIB', `Loading ${lib.name}...`);
        const script = document.createElement('script');
        script.src = lib.src;
        script.onload = () => {
            loadedLibraries.add(lib.name);
            logInfo('LIB', `${lib.name} loaded successfully`);
            resolve();
        };
        script.onerror = () => {
            logError('LIB', `Failed to load ${lib.name}`);
            reject(new Error(`Failed to load ${lib.name}`));
        };
        document.head.appendChild(script);
    });
};

// 内嵌样式表
const customStyle = document.createElement('style');
customStyle.textContent = `
  .hljs { display: block; overflow-x: auto; padding: 0.5em; color: #c9d1d9; background: #0d1117; }
  .hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-variable.language_ { color: #ff7300; }
  .hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_ { color: #3fb950; }
  .hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-variable, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id { color: #79c0ff; }
  .hljs-regexp, .hljs-string, .hljs-meta .hljs-string { color: #e3b341; }
  .hljs-built_in, .hljs-symbol { color: #f8d583; }
  .hljs-comment, .hljs-code, .hljs-formula { color: #8b949e; }
  .hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag { color: #d2a8ff; }
  .hljs-subst { color: #c9d1d9; }
  .hljs-section { color: #1f6feb; font-weight: bold; }
  .hljs-bullet { color: #f2cc60; }
  .hljs-emphasis { color: #c9d1d9; font-style: italic; }
  .hljs-strong { color: #c9d1d9; font-weight: bold; }

  .editor-content > h1, .editor-content > h2, .editor-content > h3, .editor-content > h4, .editor-content > h5, .editor-content > h6, .editor-content > p, .editor-content > ul, .editor-content > ol, .editor-content > pre, .editor-content > blockquote, .editor-content > table {
    margin-top: 0 !important; margin-bottom: 0.75em !important;
  }
  .editor-content > ul li, .editor-content > ol li { margin-bottom: 0.3em !important; }
  .editor-content > pre { padding: 0.8em !important; margin-bottom: 1em !important; }

  .action-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .drag-handle {
    cursor: grab;
    color: #6366f1;
    user-select: none;
    font-size: 1.4em;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }
  .drag-handle:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
  .drag-handle:active {
    cursor: grabbing;
    color: #4f46e5;
  }
  
  .delete-column-btn {
    background: transparent !important; color: #ef4444 !important; border: none !important; outline: none !important;
    cursor: pointer; font-size: 1.4em; padding: 0; user-select: none;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
    transition: color 0.2s ease;
  }
  .delete-column-btn:hover { color: #f87171 !important; }
  .delete-column-btn:active { color: #dc2626 !important; }

  #save-indicator {
    position: absolute; top: 10px; right: 20px;
    background-color: rgba(79, 70, 229, 0.8); color: white;
    padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;
    opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 1000;
  }
  #save-indicator.visible { opacity: 1; }

  .column-title {
    min-width: 50px; padding: 2px 4px; border-radius: 4px;
    transition: border 0.2s ease; border: 1px solid transparent;
  }
  .column-title:hover { border-color: #e5e7eb; }
  .column-title:focus { outline: none; border: 1px solid #6366f1; background-color: #f9fafb; }
  
  .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #9ca3af;
      font-style: italic;
  }

  .resizing-body * {
    pointer-events: none !important;
  }
  .resizing-body .resizer,
  .resizing-body .resizer * {
    pointer-events: auto !important;
  }

  .editor-content.editing {
    background-color: #ffffff !important;
    border: 2px solid #ef4444 !important;
    border-radius: 4px;
    padding: 8px !important;
    pointer-events: auto !important;
    z-index: 10 !important;
  }

  .column {
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(customStyle);

// 全局状态和 DOM 元素
let columns = [];
let sortableInstance = null;
const container = dv.container;
let columnContainer, addColumnBtn, saveIndicator;
let isResizing = false; 
let startX = 0, initialLeftWidth = 0, initialRightWidth = 0;
let leftColEl = null, rightColEl = null;

// 存储全局事件监听器
const globalEventListeners = new Map();

// 数据持久化函数
const getNoteUniqueId = () => dv.current().file.path.replace(/\//g, '_');
const showSaveIndicator = () => saveIndicator?.classList.add('visible');
const hideSaveIndicator = () => saveIndicator?.classList.remove('visible');

// ==============================================================================
// ==                      数据持久化函数 (优化)                                ==
// ==============================================================================
const loadColumnsData = () => {
    try {
        const loadStart = performance.now();
        const data = localStorage.getItem(`multiColumnData_${getNoteUniqueId()}`);
        const loadTime = performance.now() - loadStart;
        logDebug('PERF', `loadColumnsData took ${loadTime.toFixed(2)}ms`);
        
        if (!data) {
            logInfo('DATA', 'No saved data found in localStorage');
            return null;
        }
        
        const parsedData = JSON.parse(data);
        logInfo('DATA', `Loaded ${parsedData.length} columns from saved data`, parsedData);
        return parsedData;
    } catch (e) {
        logError('DATA', 'Failed to load columns data', { error: e.message });
        localStorage.removeItem(`multiColumnData_${getNoteUniqueId()}`);
        return null;
    }
};

// 优化：将同步操作放入 RAF 中，并确保 columns 数组干净
const saveColumnsData = () => {
    logInfo('DATA', 'saveColumnsData triggered');
    showSaveIndicator();
    
    // 使用 requestAnimationFrame 将耗时操作推迟到下一次重排时执行，避免阻塞
    requestAnimationFrame(() => {
        try {
            // 直接从 DOM 获取最新的列状态，确保同步
            const currentColumns = Array.from(columnContainer.querySelectorAll('.column'));
            const data = currentColumns.map((col, index) => ({
                title: col.querySelector('.column-title').innerText.trim() || `分栏 ${index + 1}`,
                content: col.querySelector('.editor-content').dataset.markdown || '',
                width: col.style.flexBasis || `${100 / currentColumns.length}%`
            }));
            
            // localStorage 写入也是同步操作，但通常很快
            localStorage.setItem(`multiColumnData_${getNoteUniqueId()}`, JSON.stringify(data));
            logInfo('DATA', `Saved ${data.length} columns to localStorage`, { dataSize: JSON.stringify(data).length });
            
        } catch (e) {
            logError('DATA', 'Failed to save columns data', { error: e.message });
        } finally {
            // 保存指示器的隐藏也可以稍作延迟，让用户看到
            setTimeout(hideSaveIndicator, 300);
        }
    });
};


// ==============================================================================
// ==                      关键修复：增强的同步函数 (优化)                      ==
// ==============================================================================
let syncInProgress = false;
const syncEditingContent = (targetColumn = null) => {
    if (syncInProgress) {
        logDebug('SYNC', 'Sync already in progress, skipping');
        return;
    }
    
    syncInProgress = true;
    const targetTitle = targetColumn ? targetColumn.querySelector('.column-title')?.innerText : 'ALL';
    logDebug('SYNC', `Syncing editing content for: ${targetTitle}`);
    
    // 关键修复：始终从DOM获取最新的列列表，而不是依赖可能过时的 columns 数组
    const columnsToSync = targetColumn ? [targetColumn] : Array.from(columnContainer.querySelectorAll('.column'));
    let syncedCount = 0;
    
    columnsToSync.forEach(col => {
        const editor = col.querySelector('.editor-content');
        if (editor && editor.classList.contains('editing')) {
            const columnTitle = col.querySelector('.column-title').innerText;
            logInfo('SYNC', `Syncing content for column: "${columnTitle}"`);
            
            const cleanedContent = editor.innerText.replace(/\n{3,}/g, '\n\n');
            editor.dataset.markdown = cleanedContent;
            editor.classList.remove('editing');
            editor.innerHTML = renderMarkdown(cleanedContent);
            editor.blur(); // 确保失去焦点
            syncedCount++;
        }
    });
    
    if (syncedCount > 0) {
        logInfo('SYNC', `Synced ${syncedCount} columns`);
        saveColumnsData(); // 同步后触发保存
    }
    
    syncInProgress = false;
};

const renderMarkdown = (markdownText = '') => {
    markdownText = String(markdownText || '');
    if (!window.marked || !window.DOMPurify) {
        logWarn('RENDER', 'Dependencies (marked/DOMPurify) not ready');
        return markdownText;
    }
    
    const renderStart = performance.now();
    const renderer = new window.marked.Renderer();
    
    renderer.code = function(code, language) {
        code = String(code || '');
        if (!window.hljs) return `<pre><code>${window.DOMPurify.sanitize(code)}</code></pre>`;
        try {
            const result = language && window.hljs.getLanguage(language)
                ? window.hljs.highlight(code, { language })
                : window.hljs.highlightAuto(code);
            return `<pre><code class="hljs language-${result.language}">${result.value}</code></pre>`;
        } catch (err) {
            logError('RENDER', 'Code highlight failed', { error: err.message });
            return `<pre><code class="hljs">${window.DOMPurify.sanitize(code)}</code></pre>`;
        }
    };
    
    const rendered = window.DOMPurify.sanitize(
        window.marked.parse(markdownText, { renderer, gfm: true, breaks: true, smartLists: true, smartypants: false })
    );
    
    const renderTime = performance.now() - renderStart;
    logDebug('PERF', `renderMarkdown took ${renderTime.toFixed(2)}ms`, { contentLength: markdownText.length });
    
    return rendered;
};

// ==============================================================================
// ==                      调整大小相关函数                                    ==
// ==============================================================================
const createResizer = () => {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.cssText = 'width: 12px; background: rgba(99, 102, 241, 0.1); position: relative; touch-action: none; cursor: col-resize; flex-shrink: 0; display: flex; align-items: center; justify-content: center; z-index: 10;';
    const innerBar = document.createElement('div');
    innerBar.style.cssText = 'width: 4px; height: 80px; background: #6366f1; border-radius: 2px;';
    resizer.appendChild(innerBar);
    return resizer;
};

const startResize = (e, resizer) => {
    logDebug('RESIZE', 'startResize initiated', { 
        clientX: e.clientX,
        resizerIndex: Array.from(columnContainer.children).indexOf(resizer)
    });
    
    // 移除之前可能残留的事件监听器
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('mouseleave', endResize);

    const resizerIndex = Array.from(columnContainer.children).indexOf(resizer);
    if (resizerIndex === -1) {
        logError('RESIZE', 'Resizer not found in container');
        return;
    }
    
    leftColEl = columnContainer.children[resizerIndex - 1];
    rightColEl = columnContainer.children[resizerIndex + 1];
    
    if (!leftColEl || !rightColEl || !leftColEl.classList.contains('column') || !rightColEl.classList.contains('column')) {
        logError('RESIZE', 'Cannot find adjacent columns for resizing');
        return;
    }

    isResizing = true;
    startX = e.clientX;
    initialLeftWidth = parseFloat(leftColEl.style.flexBasis || (100 / columns.length));
    initialRightWidth = parseFloat(rightColEl.style.flexBasis || (100 / columns.length));
    
    logDebug('RESIZE', 'Resize state initialized', {
        startX, initialLeftWidth, initialRightWidth,
        leftCol: leftColEl.querySelector('.column-title')?.innerText,
        rightCol: rightColEl.querySelector('.column-title')?.innerText
    });
    
    document.body.classList.add('resizing-body');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', () => endResize('mouseup'));
    document.addEventListener('mouseleave', () => endResize('mouseleave'));

    e.preventDefault();
    e.stopPropagation();
    logInfo('RESIZE', 'Resize started successfully');
};

const doResize = (e) => {
    if (!isResizing) return;
    
    const containerRect = columnContainer.getBoundingClientRect();
    const mouseDelta = e.clientX - startX;
    const percentDelta = (mouseDelta / containerRect.width) * 100;
    
    const newLeftWidth = initialLeftWidth + percentDelta;
    const newRightWidth = initialRightWidth - percentDelta;
    const minWidth = 10;

    if (newLeftWidth >= minWidth && newRightWidth >= minWidth) {
        leftColEl.style.flexBasis = `${newLeftWidth}%`;
        rightColEl.style.flexBasis = `${newRightWidth}%`;
        
        logTrace('RESIZE', 'Resizing in progress', {
            newLeftWidth, newRightWidth, mouseDelta, percentDelta
        });
    }
    
    e.preventDefault();
    e.stopPropagation();
};

const endResize = (caller = 'unknown') => {
    logDebug('RESIZE', `endResize called by: ${caller}`, { isResizing, ...checkGlobalState() });
    
    if (isResizing) {
        logInfo('RESIZE', 'Resetting resize state', { caller });
        
        isResizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', endResize);
        document.removeEventListener('mouseleave', endResize);
        
        document.body.classList.remove('resizing-body');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        leftColEl = null;
        rightColEl = null;
        startX = initialLeftWidth = initialRightWidth = 0;
        
        saveColumnsData(); // 调整大小结束后保存
        logInfo('RESIZE', 'Resize state fully reset');
    } else {
        logDebug('RESIZE', 'endResize called but not resizing (no-op)');
    }
};

const bindResizeEvents = (resizer) => {
    const mouseDownHandler = (e) => startResize(e, resizer);
    resizer.addEventListener('mousedown', mouseDownHandler);
    return () => {
        resizer.removeEventListener('mousedown', mouseDownHandler);
        if (isResizing) {
            endResize();
        }
    };
};

const rebuildResizers = () => {
    logInfo('LAYOUT', 'rebuildResizers triggered');
    
    // 使用 RAF 来避免布局抖动
    requestAnimationFrame(() => {
        // 先解绑并移除旧的 resizers
        columnContainer.querySelectorAll('.resizer').forEach(resizer => {
            if (resizer.unbind) {
                resizer.unbind();
                resizer.unbind = null;
            }
            resizer.remove();
        });
        
        // 从 DOM 获取当前列数
        const currentColumns = Array.from(columnContainer.querySelectorAll('.column'));
        if (currentColumns.length < 2) {
            logDebug('LAYOUT', 'Not enough columns to need resizers');
            return;
        }
        
        // 在每两列之间插入新的 resizer
        currentColumns.forEach((col, index) => {
            if (index < currentColumns.length - 1) {
                const resizer = createResizer();
                col.after(resizer);
                resizer.unbind = bindResizeEvents(resizer);
            }
            col.style.borderRight = index < currentColumns.length - 1 ? '1px solid #e2e8f0' : 'none';
        });
        
        logInfo('LAYOUT', `Rebuilt resizers between ${currentColumns.length} columns`);
    });
};

// ==============================================================================
// ==                      分栏创建和事件绑定 (优化)                            ==
// ==============================================================================
const createColumnElement = (title = '', content = '', width = '') => {
    title = String(title || '');
    content = String(content || '');
    logInfo('UI', `Creating new column: Title="${title}", Width="${width}"`);
    
    const newColumn = document.createElement('div');
    newColumn.className = 'column';
    newColumn.style.cssText = `flex: 1 1 ${width}; padding: 1px; background: #f9fafb; box-sizing: border-box; overflow: auto; display: flex; flex-direction: column;`;
    
    const renderedContent = renderMarkdown(content);
    
    newColumn.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #6366f1;">
      <span class="column-title" contenteditable="true" spellcheck="false">${title}</span>
      <div class="action-buttons">
        <span class="drag-handle">☰</span>
        <button class="delete-column-btn">✕</button>
      </div>
    </div>
    <div class="editor-content" style="flex-grow: 1; min-height: 350px; outline: none; font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap; word-break: break-word; padding: 0 5px;" contenteditable="true" data-markdown="${content}">${renderedContent}</div>
  `;
    
    return newColumn;
};

// ==============================================================================
// ==                      关键修复：增强的事件绑定函数 (优化)                  ==
// ==============================================================================
const bindColumnEvents = (column) => {
    const title = column.querySelector('.column-title').innerText;
    logInfo('EVENT', `Binding events for column: "${title}"`);
    
    const deleteBtn = column.querySelector('.delete-column-btn');
    const editorContent = column.querySelector('.editor-content');
    const columnTitle = column.querySelector('.column-title');

    const handleDeleteClick = (e) => {
        logInfo('EVENT', `Delete button clicked for column: "${title}"`);
        e.preventDefault();
        e.stopPropagation();
        deleteColumn(column); // 直接调用删除
    };

    const handleEditorMouseDown = (e) => {
        // 关键优化：检查列是否仍然存在于 DOM 中
        if (!columnContainer.contains(column)) {
            logWarn('EVENT', `Column "${title}" no longer exists in DOM, aborting editor click.`);
            return;
        }
        
        if (isResizing) {
            logDebug('EVENT', 'Resizing in progress, aborting editor click');
            endResize();
            return;
        }
        
        // 如果当前点击的不是正在编辑的列，则同步所有内容
        if (!editorContent.classList.contains('editing')) {
             // 优化：只同步正在编辑的其他列，而不是全部
             const editingColumns = Array.from(columnContainer.querySelectorAll('.editor-content.editing'));
             if (editingColumns.length > 0) {
                 logInfo('EVENT', `Syncing ${editingColumns.length} other editing column(s) before entering edit mode.`);
                 editingColumns.forEach(ec => syncEditingContent(ec.closest('.column')));
             }
             
             logInfo('EVENT', `Entering edit mode for column: "${title}"`);
             const markdownContent = editorContent.dataset.markdown || '';
             
             editorContent.setAttribute('contenteditable', 'true');
             editorContent.innerText = markdownContent;
             editorContent.classList.add('editing');
             
             setTimeout(() => {
                 try {
                     editorContent.focus({ preventScroll: true });
                     setTimeout(() => {
                         if (document.activeElement === editorContent) {
                             const range = document.createRange();
                             range.selectNodeContents(editorContent);
                             range.collapse(false);
                             const selection = window.getSelection();
                             selection.removeAllRanges();
                             selection.addRange(range);
                         }
                     }, 0);
                 } catch (err) {
                     editorContent.click();
                 }
             }, 0);
        }
    };
    
    const handleEditorBlur = (e) => {
        // 关键优化：检查列是否仍然存在于 DOM 中
        if (!columnContainer.contains(column)) {
            logWarn('EVENT', `Column "${title}" no longer exists in DOM, skipping blur.`);
            return;
        }
        
        if (editorContent.classList.contains('editing')) {
            logInfo('EVENT', `Exiting edit mode for column: "${title}"`);
            syncEditingContent(column); // 直接同步当前列
        }
    };

    const handleEditorKeydown = (e) => {
        if (editorContent.classList.contains('editing')) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                logInfo('EVENT', `Ctrl+Enter detected for column: "${title}"`);
                e.preventDefault();
                editorContent.blur(); // 触发 blur 事件来同步
            }
            // e.stopPropagation(); // 通常不需要阻止事件冒泡
        }
    };
    
    const handleTitleBlur = (e) => {
        // 关键优化：检查列是否仍然存在于 DOM 中
        if (!columnContainer.contains(column)) {
            logWarn('EVENT', `Column "${title}" no longer exists in DOM, skipping title blur.`);
            return;
        }
        
        const newTitle = e.target.innerText.trim();
        if (!newTitle) {
            const colIndex = Array.from(columnContainer.querySelectorAll('.column')).findIndex(col => col === column);
            e.target.innerText = `分栏 ${colIndex + 1}`;
        }
        saveColumnsData(); // 标题改变也需要保存
    };

    const handleTitleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            columnTitle.blur();
        } else if (e.key === 'Escape') {
            columnTitle.blur();
        }
    };

    // 将事件处理函数附加到 column 对象上，以便后续解绑
    column.eventHandlers = {
        handleDeleteClick,
        handleEditorMouseDown,
        handleEditorBlur,
        handleEditorKeydown,
        handleTitleBlur,
        handleTitleKeydown,
        elements: { deleteBtn, editorContent, columnTitle }
    };

    deleteBtn.addEventListener('click', handleDeleteClick);
    editorContent.addEventListener('mousedown', handleEditorMouseDown);
    editorContent.addEventListener('blur', handleEditorBlur);
    editorContent.addEventListener('keydown', handleEditorKeydown);
    columnTitle.addEventListener('blur', handleTitleBlur);
    columnTitle.addEventListener('keydown', handleTitleKeydown);
};

const unbindColumnEvents = (column) => {
    if (!column || !column.eventHandlers) return;

    const title = column.querySelector('.column-title')?.innerText || 'Unknown';
    logInfo('EVENT', `Unbinding events for column: "${title}"`);
    
    const {
        handleDeleteClick,
        handleEditorMouseDown,
        handleEditorBlur,
        handleEditorKeydown,
        handleTitleBlur,
        handleTitleKeydown,
        elements: { deleteBtn, editorContent, columnTitle }
    } = column.eventHandlers;

    if (deleteBtn) deleteBtn.removeEventListener('click', handleDeleteClick);
    if (editorContent) {
        editorContent.removeEventListener('mousedown', handleEditorMouseDown);
        editorContent.removeEventListener('blur', handleEditorBlur);
        editorContent.removeEventListener('keydown', handleEditorKeydown);
    }
    if (columnTitle) {
        columnTitle.removeEventListener('blur', handleTitleBlur);
        columnTitle.removeEventListener('keydown', handleTitleKeydown);
    }

    // 清理引用，有助于垃圾回收
    delete column.eventHandlers;
};

// ==============================================================================
// ==                      核心功能函数 (优化)                                  ==
// ==============================================================================
const initDragAndDrop = () => {
    logInfo('DRAG', 'initDragAndDrop triggered');
    
    if (sortableInstance) {
        sortableInstance.destroy();
        logDebug('DRAG', 'Sortable instance destroyed');
        sortableInstance = null;
    }
    
    // 从 DOM 获取当前列数
    const currentColumns = Array.from(columnContainer.querySelectorAll('.column'));
    if (currentColumns.length <= 1) {
        logDebug('DRAG', 'Not enough columns to initialize Sortable');
        return;
    }
    
    try {
        sortableInstance = new window.Sortable(columnContainer, {
            animation: 150,
            handle: '.drag-handle',
            draggable: '.column',
            ghostClass: 'sortable-ghost',
            onStart: () => {
                logInfo('DRAG', 'Drag started');
                // 优化：在拖拽开始前，同步所有正在编辑的内容
                syncEditingContent();
                document.body.style.userSelect = 'none';
            },
            onEnd: () => {
                logInfo('DRAG', 'Drag ended');
                // 拖拽结束后，更新 columns 数组并保存
                columns = Array.from(columnContainer.querySelectorAll('.column'));
                rebuildResizers(); // 重新构建 resizers
                saveColumnsData();
                document.body.style.userSelect = '';
            }
        });
        logInfo('DRAG', 'Sortable initialized successfully');
    } catch (e) {
        logError('DRAG', 'Failed to initialize Sortable', { error: e.message });
        document.body.style.userSelect = '';
    }
};

const addNewColumn = (title = '', content = '', width = '') => {
    logInfo('COLUMN', 'addNewColumn triggered');
    
    endResize('addNewColumn-before');
    
    // 优化：新增列前，只需要同步正在编辑的列，而不是全部
    // syncEditingContent(); // 这通常是不必要的，因为新增列不影响现有内容
    
    const currentColumns = Array.from(columnContainer.querySelectorAll('.column'));
    const newColCount = currentColumns.length + 1;
    const newWidthPercent = width || `${100 / newColCount}%`;

    // 优化：重新计算所有现有列的宽度
    const widthToTakePerExistingCol = currentColumns.length > 0 ? (parseFloat(newWidthPercent) / currentColumns.length) : 0;
    
    // 使用 RAF 来避免布局抖动
    requestAnimationFrame(() => {
        currentColumns.forEach(col => {
            const currentWidth = parseFloat(col.style.flexBasis || (100 / currentColumns.length));
            const newWidth = currentWidth - widthToTakePerExistingCol;
            col.style.flexBasis = `${newWidth}%`;
        });
    });
    
    const effectiveTitle = title ? String(title).trim() : '';
    const defaultTitle = effectiveTitle || `分栏 ${newColCount}`;
    const defaultContent = content ? String(content).trim() : `# 新分栏 ${newColCount}\n\n在这里输入你的内容，支持 **Markdown** 和代码高亮。\n\n点击分栏内容区域开始编辑。`;
    
    const newColumn = createColumnElement(defaultTitle, defaultContent, newWidthPercent);
    
    // 使用 RAF 来插入新列
    requestAnimationFrame(() => {
        columnContainer.appendChild(newColumn);
        
        bindColumnEvents(newColumn);
        
        // 更新 columns 数组
        columns = Array.from(columnContainer.querySelectorAll('.column'));
        
        rebuildResizers();
        initDragAndDrop(); // 重新初始化拖拽，因为 DOM 变了
        
        newColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // 优化：新增列后自动进入编辑模式
        setTimeout(() => {
            const editor = newColumn.querySelector('.editor-content');
            if (editor) {
                editor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            }
        }, 100);

        saveColumnsData(); // 最后保存
        logInfo('COLUMN', `New column added. Total columns: ${columns.length}`);
    });
    
    return newColumn;
};

// ==============================================================================
// ==                      关键修复：非阻塞的 deleteColumn 函数 (核心优化)      ==
// ==============================================================================
let deleteInProgress = false;

const deleteColumn = (columnToDelete) => {
    if (deleteInProgress) {
        logWarn('DELETE', 'Delete operation already in progress, skipping');
        return;
    }
    
    // 关键优化：检查列是否仍然存在于 DOM 中
    if (!columnContainer.contains(columnToDelete)) {
        logWarn('DELETE', 'Column to delete no longer exists in DOM, aborting.');
        return;
    }

    deleteInProgress = true;
    const columnTitle = columnToDelete.querySelector('.column-title')?.innerText || 'Unknown';
    logInfo('DELETE', `Starting deletion of column: "${columnTitle}"`, { 
        currentColumns: columns.length,
        globalState: checkGlobalState()
    });

    // 步骤 1: 在删除前强制结束所有可能的状态
    endResize('deleteColumn-before');

    // 步骤 2: 同步编辑内容并确保退出编辑模式
    const editor = columnToDelete.querySelector('.editor-content');
    if (editor && editor.classList.contains('editing')) {
        logInfo('DELETE', `Forcing exit from edit mode: "${columnTitle}"`);
        // 直接同步内容，不需要触发 blur
        const cleanedContent = editor.innerText.replace(/\n{3,}/g, '\n\n');
        editor.dataset.markdown = cleanedContent;
        editor.classList.remove('editing');
        editor.innerHTML = renderMarkdown(cleanedContent);
    }

    // 步骤 3: 确认提示 (必须在 setTimeout 之外)
    const currentColumns = Array.from(columnContainer.querySelectorAll('.column'));
    let confirmMessage;
    if (currentColumns.length <= 1) {
        confirmMessage = '确定要删除最后一个分栏吗？此操作将清除所有本地存储的分栏数据！';
    } else {
        confirmMessage = `确定要删除分栏 "${columnTitle}" 吗？内容将永久丢失！`;
    }
    
    if (!confirm(confirmMessage)) {
        logInfo('DELETE', 'Deletion cancelled by user');
        deleteInProgress = false; // 重置状态
        return;
    }

    // 步骤 4: 解绑事件 (可以立即执行)
    logDebug('DELETE', 'Unbinding column events');
    unbindColumnEvents(columnToDelete);
    
    // ==========================================================================
    // ==                      核心优化：使用 setTimeout 实现非阻塞               ==
    // ==========================================================================
    // 将耗时的 DOM 操作和重新布局任务推迟到下一个事件循环
    setTimeout(() => {
        try {
            // 步骤 5: 从 DOM 中移除列
            if (columnToDelete.parentNode) {
                columnToDelete.parentNode.removeChild(columnToDelete);
                logDebug('DELETE', 'Column removed from DOM');
            } else {
                logWarn('DELETE', 'Column already has no parent, cannot remove from DOM.');
            }
            
            // 步骤 6: 更新 columns 数组 (从 DOM 重新获取，最可靠)
            columns = Array.from(columnContainer.querySelectorAll('.column'));
            logInfo('DELETE', `Column removed from array. Remaining: ${columns.length}`);

            // 步骤 7: 如果没有分栏了，清理并显示空状态
            if (columns.length === 0) {
                logInfo('DELETE', 'No columns remaining, showing empty state');
                columnContainer.innerHTML = '<div class="empty-state">没有分栏，请点击上方 "+ 新增分栏" 按钮创建</div>';
                localStorage.removeItem(`multiColumnData_${getNoteUniqueId()}`);
                return; // 提前退出，不需要后续步骤
            }

            // 步骤 8: 重新分配剩余分栏的宽度
            const widthPercent = `${100 / columns.length}%`;
            logDebug('DELETE', `Redistributing widths: ${widthPercent}`);
            columns.forEach(col => {
                col.style.flexBasis = widthPercent;
            });

            // 步骤 9: 重建布局和事件
            logDebug('DELETE', 'Rebuilding resizers and drag-drop');
            rebuildResizers();
            initDragAndDrop(); // 重新初始化拖拽

            // 步骤 10: 保存数据
            saveColumnsData();
            
            logInfo('DELETE', 'Deletion completed successfully');

        } catch (error) {
            logError('DELETE', 'Error during deletion', { error: error.message });
        } finally {
            // 步骤 11: 重置删除状态
            deleteInProgress = false;
        }
    }, 0); // 使用 0ms 延迟将任务放入下一个事件循环
};


// ==============================================================================
// ==                      关键修复：增强的全局点击事件处理 (优化)              ==
// ==============================================================================
let lastClickTime = 0;
const CLICK_DEBOUNCE = 300; // 300ms防抖

const setupGlobalClickHandler = () => {
    // 移除已存在的处理器
    const existingHandler = globalEventListeners.get('document:click');
    if (existingHandler) {
        document.removeEventListener('click', existingHandler);
        logDebug('EVENT', 'Removed existing global click handler');
    }
    
    const globalClickHandler = (e) => {
        const now = Date.now();
        if (now - lastClickTime < CLICK_DEBOUNCE) {
            logDebug('EVENT', 'Click debounced, skipping');
            return;
        }
        lastClickTime = now;
        
        // 关键优化：更精确地判断点击是否在容器内部
        const isClickOnColumnContainer = columnContainer.contains(e.target);
        const isClickOnActionButton = e.target.closest('.delete-column-btn, .drag-handle, #addColumnBtn');

        logTrace('GLOBAL_CLICK', 'Document click detected', {
            target: e.target.tagName,
            isClickOnColumnContainer,
            isClickOnActionButton,
            isResizing: isResizing,
            columnsCount: columns.length
        });
        
        // 如果点击在容器外部，并且不在调整大小，并且有列，则同步内容
        if (!isClickOnColumnContainer && !isResizing && columns.length > 0 && !isClickOnActionButton) {
            logInfo('GLOBAL_CLICK', 'Click outside container, syncing content');
            syncEditingContent();
        }
    };
    
    document.addEventListener('click', globalClickHandler);
    globalEventListeners.set('document:click', globalClickHandler);
    logDebug('EVENT', 'Global click handler registered');
};

const init = () => {
    logInfo('INIT', 'Initializing Multi-Column Component');
    
    // 确保在初始化前销毁旧实例
    destroy();

    try {
        container.innerHTML = '';
        
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'position: relative; width: 100%; margin: 20px 0; box-sizing: border-box;';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'position: absolute; top: -20px; left: 10px; display: flex; gap: 10px; z-index: 999;';
        
        addColumnBtn = document.createElement('button');
        addColumnBtn.id = 'addColumnBtn';
        addColumnBtn.textContent = '+ 新增分栏';
        addColumnBtn.style.cssText = 'background: #6366f1; color: white; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 14px;';
        buttonContainer.appendChild(addColumnBtn);
        
        saveIndicator = document.createElement('div');
        saveIndicator.id = 'save-indicator';
        saveIndicator.textContent = '正在保存...';
        saveIndicator.style.cssText = 'position: absolute; top: 10px; right: 20px; background-color: rgba(79, 70, 229, 0.8); color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 1000;';
        
        columnContainer = document.createElement('div');
        columnContainer.id = 'columnContainer';
        columnContainer.style.cssText = 'display: flex; width: 100%; border: 3px solid #6366f1; border-radius: 12px; overflow: hidden; height: 450px; box-sizing: border-box;';
        
        mainContainer.appendChild(buttonContainer);
        mainContainer.appendChild(saveIndicator);
        mainContainer.appendChild(columnContainer);
        container.appendChild(mainContainer);
        
        if (!addColumnBtn || !columnContainer || !saveIndicator) {
            logError('INIT', 'Failed to create essential DOM elements');
            container.innerHTML = '<div style="color: red; padding: 20px;">组件初始化失败：无法创建必要的界面元素。</div>';
            return;
        }

        const savedData = loadColumnsData();
        if (savedData && savedData.length > 0) {
            logInfo('INIT', `Loading ${savedData.length} columns from saved data`);
            
            // 使用文档片段来批量插入 DOM，提高性能
            const fragment = document.createDocumentFragment();
            
            savedData.forEach((data, index) => {
                const newColumn = createColumnElement(data.title, data.content, data.width);
                fragment.appendChild(newColumn);
                bindColumnEvents(newColumn);
            });
            
            columnContainer.appendChild(fragment);
            columns = Array.from(columnContainer.querySelectorAll('.column'));
            rebuildResizers();
        } else {
            logInfo('INIT', 'No saved data, creating default columns');
            // 直接调用 addNewColumn 来创建默认列，这样可以复用逻辑
            addNewColumn('分栏 1', '# 分栏 1\n\n默认内容', '100%');
            // 初始只有一列时，不需要再 addNewColumn，它会自动进入编辑模式
        }
        
        initDragAndDrop();
        addColumnBtn.addEventListener('click', () => addNewColumn());
        
        // 使用修复后的全局点击事件处理
        setupGlobalClickHandler();
        
        logInfo('INIT', 'Initialization completed successfully');
        
    } catch (error) {
        logError('INIT', 'Initialization failed', { error: error.message, stack: error.stack });
        container.innerHTML = `<div style="color: red; padding: 20px;">组件初始化失败: ${error.message}</div>`;
    }
};

const destroy = () => {
    logInfo('DESTROY', 'Destroying component');
    
    if (sortableInstance) {
        sortableInstance.destroy();
        logDebug('DESTROY', 'Sortable instance destroyed');
    }
    
    // 解绑所有列的事件
    columns.forEach(column => {
        unbindColumnEvents(column);
    });

    // 移除所有全局事件监听器
    globalEventListeners.forEach((handler, key) => {
        const [target, event] = key.split(':');
        if (target === 'document') {
            document.removeEventListener(event, handler);
        }
    });
    globalEventListeners.clear();
    
    // 清理 DOM
    if (container) {
        container.innerHTML = '';
    }
    
    // 重置所有状态变量
    columns = [];
    isResizing = false;
    startX = initialLeftWidth = initialRightWidth = 0;
    leftColEl = rightColEl = null;
    deleteInProgress = false;
    syncInProgress = false;
    lastClickTime = 0;
    
    logInfo('DESTROY', 'Component destroyed');
};

// 加载库并初始化
Promise.all(libraries.map(loadLibrary))
    .then(() => {
        logInfo('BOOT', 'All libraries loaded, starting initialization');
        init();
    })
    .catch(err => {
        logError('BOOT', 'Failed to load libraries', { error: err.message });
        container.innerHTML = `<div style="color: red; padding: 20px;">加载依赖失败: ${err.message}</div>`;
    });

// 导出销毁函数供Obsidian使用
module.exports = { destroy };
```
