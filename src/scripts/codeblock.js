//****************************************************************************//
//                                                                            //
// Code blocks (styles/codeblock.css)                                         //
//                                                                            //
//****************************************************************************//
//
//    <div class="codeblock" data-language="php">
//      <pre><code>&lt;?php echo $title; ?&gt;</code></pre>
//    </div>
//
// initializeCodeblocks(root) prepares every .codeblock under root:
//
//    - adds a copy button in the top left corner if the block has none.
//      Pressing it copies the code text to the clipboard, shows a check icon
//      for 2 seconds and announces the result in a live region.
//      The texts come from data attributes on the .codeblock:
//      data-copy-label (default "Copy code"), data-copied-label ("Copied"),
//      data-copy-failed-label ("Copying failed")
//    - highlights the code by data-language: html (xml, markup), css,
//      js (javascript, json), php, bash (sh, shell). Other languages are left
//      as plain text. The highlighting is basic: comments, strings, keywords,
//      numbers, variables, HTML tags and attributes, CSS selectors and
//      properties. It is done once per block (data-highlighted is set)
//
// Call it again with the new element as root after adding code blocks to the
// page. highlightCode(text, language) returns the highlighted HTML of a text
// and setCodeblockCode(codeblock, text) replaces the code of a block.


const COPIED_TIMEOUT = 2000;


export function initializeCodeblocks(root = document) {
  const codeblocks = root.matches?.('.codeblock') ? [root] : root.querySelectorAll('.codeblock');

  codeblocks.forEach(codeblock => {
    highlightCodeblock(codeblock);
    addCopyButton(codeblock);
  });
}

export function setCodeblockCode(codeblock, text) {
  const code = getCodeElement(codeblock);
  code.textContent = text;
  delete codeblock.dataset.highlighted;
  highlightCodeblock(codeblock);
}

export function highlightCode(text, language) {
  const rules = getRules(language);

  if (!rules) {
    return escapeHtml(text);
  }

  return tokenize(text, rules);
}


//****************************************************************************//
// Copy button


function addCopyButton(codeblock) {
  const existingButton = codeblock.querySelector('.codeblock-copy');
  const button = existingButton || createCopyButton(codeblock);

  if (button.dataset.codeblockInitialized) {
    return;
  }

  button.dataset.codeblockInitialized = 'true';
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    copyCode(codeblock, button);
  });

  if (!existingButton) {
    codeblock.prepend(button);
  }

  if (!codeblock.querySelector('.codeblock-status')) {
    const status = document.createElement('span');
    status.className = 'codeblock-status';
    status.setAttribute('aria-live', 'polite');
    codeblock.append(status);
  }
}

function createCopyButton(codeblock) {
  const button = document.createElement('button');
  const label = codeblock.dataset.copyLabel || 'Copy code';

  button.type = 'button';
  button.className = 'codeblock-copy';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.innerHTML = '<i class="fa-light fa-copy" aria-hidden="true"></i>';

  return button;
}

async function copyCode(codeblock, button) {
  const text = getCodeElement(codeblock).textContent;
  const status = codeblock.querySelector('.codeblock-status');
  const icon = button.querySelector('i');

  try {
    await navigator.clipboard.writeText(text);
    showResult(codeblock.dataset.copiedLabel || 'Copied', 'fa-check', true);
  } catch (error) {
    console.error('Copying the code failed', error);
    showResult(codeblock.dataset.copyFailedLabel || 'Copying failed', 'fa-xmark', false);
  }

  function showResult(message, iconClass, copied) {
    if (status) {
      status.textContent = message;
    }

    if (icon) {
      icon.classList.remove('fa-copy', 'fa-check', 'fa-xmark');
      icon.classList.add(iconClass);
    }

    button.classList.toggle('codeblock-copied', copied);
    clearTimeout(button.codeblockTimeout);
    button.codeblockTimeout = setTimeout(() => {
      icon?.classList.remove('fa-check', 'fa-xmark');
      icon?.classList.add('fa-copy');
      button.classList.remove('codeblock-copied');

      if (status) {
        status.textContent = '';
      }
    }, COPIED_TIMEOUT);
  }
}


//****************************************************************************//
// Highlighting


function highlightCodeblock(codeblock) {
  if (codeblock.dataset.highlighted) {
    return;
  }

  const code = getCodeElement(codeblock);
  const language = (codeblock.dataset.language || code.dataset.language || '').toLowerCase();

  codeblock.dataset.highlighted = 'true';

  if (!getRules(language)) {
    return;
  }

  code.innerHTML = highlightCode(code.textContent, language);
}

function getCodeElement(codeblock) {
  const pre = codeblock.querySelector('pre') || codeblock.appendChild(document.createElement('pre'));
  return pre.querySelector('code') || pre;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function span(type, text) {
  return `<span class="code-${type}">${escapeHtml(text)}</span>`;
}

// Goes through the text once with all the rules of the language: at each
// position the first matching rule wins. A rule is [type, regex]; type null
// keeps the text plain, a function returns the highlighted HTML itself.
function tokenize(text, rules) {
  const pattern = new RegExp(rules.map(([, regex]) => `(${regex.source})`).join('|'), 'gy');
  const groupIndexes = getGroupIndexes(rules);
  let html = '';
  let plainStart = 0;
  let index = 0;

  while (index < text.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(text);

    if (!match || match[0] === '') {
      index += 1;
      continue;
    }

    const ruleIndex = groupIndexes.findIndex(groupIndex => match[groupIndex] !== undefined);
    const [type] = rules[ruleIndex];

    html += escapeHtml(text.slice(plainStart, index));
    html += typeof type === 'function' ? type(match[0]) : type ? span(type, match[0]) : escapeHtml(match[0]);

    index += match[0].length;
    plainStart = index;
  }

  return html + escapeHtml(text.slice(plainStart));
}

// Index of the outer group of each rule in the combined regex
function getGroupIndexes(rules) {
  let groupIndex = 1;

  return rules.map(([, regex]) => {
    const current = groupIndex;
    // the outer group and the groups inside the rule's own regex
    groupIndex += new RegExp(`${regex.source}|`).exec('').length;
    return current;
  });
}


//****************************************************************************//
// Language rules


const LANGUAGE_ALIASES = {
  html: 'html', xml: 'html', markup: 'html', hbs: 'html', handlebars: 'html',
  css: 'css',
  js: 'js', javascript: 'js', mjs: 'js', json: 'js',
  php: 'php',
  bash: 'bash', sh: 'bash', shell: 'bash'
};

const STRING_DOUBLE = /"(?:\\[\s\S]|[^"\\\n])*"/;
const STRING_SINGLE = /'(?:\\[\s\S]|[^'\\\n])*'/;
const NUMBER = /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/;
const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/;
const LINE_COMMENT = /\/\/[^\n]*/;

const JS_KEYWORDS = keywords([
  'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else',
  'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'null', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
  'undefined', 'var', 'void', 'while', 'yield'
]);

const PHP_KEYWORDS = keywords([
  'abstract', 'and', 'array', 'as', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'do',
  'echo', 'else', 'elseif', 'empty', 'endforeach', 'endif', 'extends', 'false', 'final', 'finally', 'fn',
  'for', 'foreach', 'function', 'global', 'if', 'implements', 'include', 'include_once', 'instanceof',
  'interface', 'isset', 'list', 'match', 'namespace', 'new', 'null', 'or', 'print', 'private', 'protected',
  'public', 'readonly', 'require', 'require_once', 'return', 'self', 'static', 'switch', 'throw', 'trait',
  'true', 'try', 'unset', 'use', 'var', 'while', 'yield'
]);

const BASH_KEYWORDS = keywords([
  'case', 'do', 'done', 'elif', 'else', 'esac', 'export', 'fi', 'for', 'function', 'if', 'in', 'local',
  'return', 'then', 'until', 'while'
]);

const RULES = {
  js: [
    ['comment', BLOCK_COMMENT],
    ['comment', LINE_COMMENT],
    ['string', /`(?:\\[\s\S]|[^`\\])*`/],
    ['string', STRING_DOUBLE],
    ['string', STRING_SINGLE],
    ['keyword', JS_KEYWORDS],
    ['number', NUMBER],
    [null, /[A-Za-z_$][\w$]*/]
  ],
  php: [
    ['keyword', /<\?(?:php|=)?|\?>/],
    ['comment', BLOCK_COMMENT],
    ['comment', LINE_COMMENT],
    ['comment', /#(?!\[)[^\n]*/],
    ['string', STRING_DOUBLE],
    ['string', STRING_SINGLE],
    ['variable', /\$[A-Za-z_]\w*/],
    ['keyword', PHP_KEYWORDS],
    ['number', NUMBER],
    [null, /[A-Za-z_]\w*/]
  ],
  css: [
    ['comment', BLOCK_COMMENT],
    ['string', STRING_DOUBLE],
    ['string', STRING_SINGLE],
    ['keyword', /@[\w-]+/],
    ['attribute', /-{0,2}[A-Za-z][\w-]*(?=\s*:(?:\s|[^;{}]*[;}]))/],
    ['variable', /--[\w-]+/],
    ['tag', /[.#]?[A-Za-z_][\w-]*(?=[^;{}]*\{)|&|::?[\w-]+(?=[^;{}]*\{)/],
    ['number', /#[\da-fA-F]{3,8}\b|-?\d*\.?\d+(?:%|[a-z]+)?/],
    [null, /[A-Za-z_][\w-]*/]
  ],
  bash: [
    ['comment', /(?:^|(?<=\s))#[^\n]*/],
    ['string', STRING_DOUBLE],
    ['string', STRING_SINGLE],
    ['variable', /\$(?:\{[^}\n]*\}|\w+|[@*#?$!])/],
    ['keyword', BASH_KEYWORDS],
    ['attribute', /(?<=\s)--?[\w-]+/],
    [null, /[\w./-]+/]
  ],
  html: [
    ['comment', /<!--[\s\S]*?(?:-->|$)/],
    ['comment', /\{\{!--[\s\S]*?(?:--\}\}|$)/],
    ['keyword', /<!DOCTYPE[^>]*>/i],
    [highlightTag, /<\/?[A-Za-z][\w:-]*(?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/],
    ['keyword', /\{\{\{?[\s\S]*?\}?\}\}/]
  ]
};

function getRules(language) {
  return RULES[LANGUAGE_ALIASES[language]];
}

function keywords(words) {
  return new RegExp(`\\b(?:${words.join('|')})\\b`);
}

// A whole HTML tag: the name, the attribute names and the attribute values
function highlightTag(tag) {
  return tokenize(tag, [
    ['tag', /^<\/?[A-Za-z][\w:-]*/],
    ['tag', /\/?>$/],
    ['string', /"[^"]*"|'[^']*'/],
    ['attribute', /[^\s"'>\/=]+/]
  ]);
}
