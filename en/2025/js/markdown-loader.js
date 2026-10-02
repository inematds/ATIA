// ATIA - Markdown Loader
// Carrega e renderiza capítulos em Markdown

/* ========================================
   CONFIGURATION
   ======================================== */

const CONFIG = {
    contentPath: 'content/',
    videoReferencesPath: 'data/video-references.json'
};

/* ========================================
   MARKDOWN PARSER (using marked.js from CDN)
   ======================================== */

async function loadMarkdown(chapterId) {
    try {
        const filePath = `${CONFIG.contentPath}${chapterId}.md`;
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.status}`);
        }

        const markdown = await response.text();
        return markdown;
    } catch (error) {
        console.error('Error loading markdown:', error);
        return `# Error Loading Chapter

Unable to load the content. Try again later.`;
    }
}

function renderMarkdown(markdown) {
    // Using marked.js (loaded from CDN in HTML)
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true
        });

        // Fix image paths with spaces - encode spaces as %20
        const fixedMarkdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            const encodedUrl = url.replace(/ /g, '%20');
            return `![${alt}](${encodedUrl})`;
        });

        let html = marked.parse(fixedMarkdown);

        // Processar tópicos expansíveis
        html = processarTopicosExpandiveis(html);

        return html;
    } else {
        // Fallback: basic HTML escaping
        return markdown
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }
}

/* ========================================
   TÓPICOS EXPANSÍVEIS
   ======================================== */

function processarTopicosExpandiveis(html) {
    // Procura por bloqueios especiais no formato:
    // <h3>TÓPICO: Título do Tópico</h3>
    // seguido por listas com "O que é:", "Por que aprender:", "Conceitos chave:"

    const topicoRegex = /<h3>TÓPICO:\s*([^<]+)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/gi;

    html = html.replace(topicoRegex, (match, titulo, conteudo) => {
        const topicoId = 'topico-' + Math.random().toString(36).substr(2, 9);

        // Extrair itens da lista - regex mais flexível para capturar conteúdo com tags adicionais
        const items = conteudo.match(/<li>[\s\S]*?<strong>([^:]+):<\/strong>([\s\S]*?)<\/li>/gi) || [];

        let topicoHtml = `
            <div class="topico-expandivel" onclick="toggleTopico('${topicoId}')">
                <h3>
                    ${titulo.trim()}
                    <span class="icon">▼</span>
                </h3>
                <div class="topico-conteudo" id="${topicoId}">`;

        items.forEach(item => {
            // Regex mais flexível para extrair label e texto
            const itemMatch = item.match(/<strong>([^:]+):<\/strong>([\s\S]*?)<\/li>/);
            if (itemMatch) {
                const label = itemMatch[1].trim();
                // Remove tags HTML do texto e limpa espaços
                const texto = itemMatch[2].replace(/<[^>]+>/g, '').trim();
                topicoHtml += `
                    <div class="topico-item">
                        <h4>${label}</h4>
                        <p>${texto}</p>
                    </div>`;
            }
        });

        topicoHtml += `
                </div>
            </div>`;

        return topicoHtml;
    });

    return html;
}

// Função para expandir/colapsar tópicos (será chamada globalmente)
window.toggleTopico = function(id) {
    const conteudo = document.getElementById(id);
    const container = conteudo.parentElement;

    if (conteudo.classList.contains('show')) {
        conteudo.classList.remove('show');
        container.classList.remove('active');
    } else {
        conteudo.classList.add('show');
        container.classList.add('active');
    }
};

/* ========================================
   VIDEO REFERENCES
   ======================================== */

async function loadVideoReferences(chapterId) {
    try {
        const response = await fetch(CONFIG.videoReferencesPath);
        if (!response.ok) return null;

        const data = await response.json();
        const chapterKey = chapterId.replace('capitulo-', 'capitulo');
        return data.capitulos[chapterKey] || null;
    } catch (error) {
        console.error('Error loading video references:', error);
        return null;
    }
}

function renderVideoReferences(references) {
    if (!references || !references.videos || references.videos.length === 0) {
        return '';
    }

    let html = '<div class="recursos-complementares mt-12 p-6 bg-gray-50 rounded-lg"><h3 class="text-2xl font-bold mb-4">📹 Recursos Complementares</h3>';

    // Videos
    if (references.videos && references.videos.length > 0) {
        html += '<div class="video-referencias space-y-4">';
        references.videos.forEach(video => {
            html += `
                <a href="${video.url_youtube || '#'}" target="_blank" rel="noopener" class="video-link">
                    ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${video.titulo}">` : '<div class="w-40 h-24 bg-gray-200 rounded"></div>'}
                    <div class="video-info">
                        <h4 class="font-semibold">🎥 ${video.titulo}</h4>
                        <p class="video-meta text-sm text-gray-600">
                            <span class="canal">${video.canal || 'Canal'}</span>
                            ${video.duracao_estimada ? `<span class="duracao">⏱️ ${video.duracao_estimada}</span>` : ''}
                        </p>
                        <p class="video-desc text-sm text-gray-600">${video.descricao || ''}</p>
                        <span class="external-link-icon">↗️</span>
                    </div>
                </a>
            `;
        });
        html += '</div>';
    }

    // Links Úteis
    if (references.links_uteis && references.links_uteis.length > 0) {
        html += '<h4 class="text-xl font-bold mt-6 mb-3">🔗 Useful Links</h4>';
        html += '<ul class="links-list space-y-2">';
        references.links_uteis.forEach(link => {
            html += `<li><a href="${link.url}" target="_blank" class="text-aplicacao hover:underline">📄 ${link.titulo}</a></li>`;
        });
        html += '</ul>';
    }

    // Downloads
    if (references.downloads && references.downloads.length > 0) {
        html += '<h4 class="text-xl font-bold mt-6 mb-3">📥 Downloads</h4>';
        html += '<ul class="links-list space-y-2">';
        references.downloads.forEach(download => {
            html += `<li><a href="${download.arquivo}" class="text-aplicacao hover:underline">📥 ${download.titulo}</a></li>`;
        });
        html += '</ul>';
    }

    html += '</div>';
    return html;
}

/* ========================================
   READING PROGRESS
   ======================================== */

function initReadingProgress() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;

        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

/* ========================================
   TABLE OF CONTENTS
   ======================================== */

function generateTOC() {
    const content = document.getElementById('chapter-content');
    if (!content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const toc = document.getElementById('toc-list');
    if (!toc) return;

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName === 'H2' ? 'toc-h2' : 'toc-h3';

        li.appendChild(a);
        toc.appendChild(li);
    });
}

/* ========================================
   SAVE READING POSITION
   ======================================== */

function saveReadingPosition(chapterId) {
    const position = window.scrollY;
    localStorage.setItem(`reading-pos-${chapterId}`, position);
}

function restoreReadingPosition(chapterId) {
    const position = localStorage.getItem(`reading-pos-${chapterId}`);
    if (position) {
        window.scrollTo(0, parseInt(position));
    }
}

/* ========================================
   MARK CHAPTER AS READ
   ======================================== */

function markChapterAsRead(chapterId) {
    const completed = JSON.parse(localStorage.getItem('completed-chapters') || '[]');
    if (!completed.includes(chapterId)) {
        completed.push(chapterId);
        localStorage.setItem('completed-chapters', JSON.stringify(completed));
    }
}

function isChapterCompleted(chapterId) {
    const completed = JSON.parse(localStorage.getItem('completed-chapters') || '[]');
    return completed.includes(chapterId);
}

/* ========================================
   MAIN LOAD FUNCTION
   ======================================== */

async function loadChapter(chapterId) {
    const contentDiv = document.getElementById('chapter-content');
    const referencesDiv = document.getElementById('chapter-references');

    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }

    // Show loading state
    contentDiv.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-aplicacao"></div><p class="mt-4 text-gray-600">Loading chapter...</p></div>';

    try {
        // Load markdown content
        const markdown = await loadMarkdown(chapterId);
        const html = renderMarkdown(markdown);
        contentDiv.innerHTML = html;

        // Load and render video references
        if (referencesDiv) {
            const references = await loadVideoReferences(chapterId);
            if (references) {
                referencesDiv.innerHTML = renderVideoReferences(references);
            }
        }

        // Initialize features
        initReadingProgress();
        generateTOC();
        restoreReadingPosition(chapterId);

        // Save position on scroll
        let saveTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveReadingPosition(chapterId);
            }, 1000);
        });

        // Mark as read when reaching 90%
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 90) {
                markChapterAsRead(chapterId);
            }
        });

    } catch (error) {
        console.error('Error loading chapter:', error);
        contentDiv.innerHTML = '<div class="callout callout-warning"><span class="callout-icon">⚠️</span><div class="callout-content"><strong>Error loading chapter</strong><p>Unable to load the content. Try again later.</p></div></div>';
    }
}

/* ========================================
   AUTO-INIT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Get chapter ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = urlParams.get('id');

    if (chapterId) {
        loadChapter(chapterId);
    }
});

console.log('📚 Markdown Loader initialized');
