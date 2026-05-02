(function() {
    const extensionId = 'sillytavern-multithumb';
    const oldExtensionId = 'multithumbs';
    const defaultSettings = {
        width: 70
    };
    let settings = Object.assign({}, defaultSettings);
    const spriteCache = new Map();

    console.log('[SillyTavern-MultiThumb] Script version 2.2 loaded.');

    async function refreshCsrfToken() {
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            if (data && data.token) return data.token;
        } catch (e) {}
        return '';
    }

    async function getApiHeaders() {
        const token = await refreshCsrfToken();
        return {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token || window.token || ''
        };
    }

    function getAvatarUrl(character) {
        return `/thumbnail?type=avatar&file=${encodeURIComponent(character.avatar)}`;
    }

    function getGalleryFolderName(character) {
        if (character.data?.extensions?.gallery_id) return character.data.extensions.gallery_id;
        if (character.avatar) return character.avatar.replace(/\.(png|webp)$/i, '');
        return character.name;
    }

    async function getGalleryImages(characterName, character) {
        const folder = getGalleryFolderName(character);
        if (spriteCache.has(folder)) return spriteCache.get(folder);

        try {
            const headers = await getApiHeaders();
            const response = await fetch('/api/images/list', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ folder: folder, type: 1 })
            });
            if (!response.ok) return [];
            const files = await response.json();
            spriteCache.set(folder, files);
            return files;
        } catch (error) {
            console.error('[SillyTavern-MultiThumb] Gallery fetch failed:', error);
            return [];
        }
    }

    function getCleanName(mesElement) {
        const nameEl = mesElement.querySelector('.ch_name');
        if (!nameEl) return null;
        let name = nameEl.innerText.split('\n')[0];
        name = name.split(/\s\d{1,2}:\d{2}/)[0].trim();
        return name;
    }

    async function processMessage(mesElement) {
        try {
            if (mesElement.getAttribute('has-multithumbs') === 'true' || mesElement.getAttribute('is_user') === 'true') {
                return;
            }

            const context = window.SillyTavern.getContext();
            const characterName = getCleanName(mesElement);
            if (!characterName) return;

            const character = context.characters.find(c => c.name === characterName);
            if (!character) return;

            const galleryImages = await getGalleryImages(characterName, character);
            const folder = getGalleryFolderName(character);
            const mesBlock = mesElement.querySelector('.mes_block');
            if (!mesBlock) return;

            mesElement.querySelectorAll('.multithumb-container').forEach(el => el.remove());
            const container = document.createElement('div');
            container.className = 'multithumb-container';

            const avatarImg = document.createElement('img');
            avatarImg.className = 'multithumb-item';
            avatarImg.src = getAvatarUrl(character);
            avatarImg.title = characterName;
            avatarImg.onerror = () => avatarImg.style.display = 'none';
            container.appendChild(avatarImg);

            galleryImages.forEach(imgName => {
                const img = document.createElement('img');
                img.className = 'multithumb-item';
                img.src = `/user/images/${encodeURIComponent(folder)}/${encodeURIComponent(imgName)}`;
                img.title = imgName;
                img.onerror = () => img.style.display = 'none';
                container.appendChild(img);
            });

            const mesHeader = mesElement.querySelector('.mes_header');
            if (mesHeader) mesHeader.after(container);
            else mesBlock.prepend(container);

            mesElement.setAttribute('has-multithumbs', 'true');
        } catch (err) {
            console.error('[SillyTavern-MultiThumb] Error processing message:', err);
        }
    }

    function applySettings() {
        const width = Number(settings.width) || defaultSettings.width;
        document.documentElement.style.setProperty('--multithumb-width', `${width}px`);
        
        const $widthInput = $('#multithumbs_width');
        const $widthValue = $('#multithumbs_width_value');
        if ($widthInput.length) $widthInput.val(width);
        if ($widthValue.length) $widthValue.text(width);
    }

    function loadSettings() {
        try {
            const context = window.SillyTavern.getContext();
            const extSettings = context.extension_settings || (context.settings && context.settings.extensions);
            
            if (extSettings && extSettings[extensionId]) {
                settings = extSettings[extensionId];
            } else if (extSettings && extSettings[oldExtensionId]) {
                settings = extSettings[oldExtensionId];
            } else {
                const localBackup = localStorage.getItem('st_multithumbs_settings');
                if (localBackup) settings = JSON.parse(localBackup);
            }

            settings.width = Number(settings.width) || defaultSettings.width;
            applySettings();
        } catch (e) {
            console.error('[SillyTavern-MultiThumb] Failed to load settings:', e);
        }
    }

    function saveSettings() {
        try {
            const context = window.SillyTavern.getContext();
            const extSettings = context.extension_settings || (context.settings && context.settings.extensions);
            
            if (extSettings) {
                extSettings[extensionId] = settings;
            }
            
            if (typeof context.saveSettings === 'function') {
                context.saveSettings();
            } else if (typeof window.saveSettingsDebounced === 'function') {
                window.saveSettingsDebounced();
            }
            
            localStorage.setItem('st_multithumbs_settings', JSON.stringify(settings));
            applySettings();
        } catch (e) {
            console.error('[SillyTavern-MultiThumb] Failed to save settings:', e);
        }
    }

    async function setupSettingsUI() {
        try {
            const context = window.SillyTavern.getContext();
            let html = '';
            const paths = [
                'third-party/SillyTavern_MultiThumb',
                'SillyTavern_MultiThumb',
                'third-party/sillytavern-multithumb',
                'sillytavern-multithumb',
                'third-party/multithumbs',
                'multithumbs'
            ];
            for (const path of paths) {
                try {
                    html = await context.renderExtensionTemplateAsync(path, 'settings');
                    if (html) break;
                } catch (e) {}
            }
            if (!html) return;
            
            const $settingsContainer = $('#extensions_settings');
            if ($settingsContainer.length) {
                const $html = $(html);
                $settingsContainer.append($html);

                $html.find('.inline-drawer-header').on('click', function() {
                    $(this).closest('.inline-drawer').children('.inline-drawer-content').stop().slideToggle(200);
                    $(this).find('.inline-drawer-icon').toggleClass('down');
                });

                const $widthInput = $html.find('#multithumbs_width');
                if ($widthInput.length) {
                    $widthInput.val(settings.width);
                    $html.find('#multithumbs_width_value').text(settings.width);

                    $widthInput.on('input', (e) => {
                        settings.width = Number(e.target.value);
                        $('#multithumbs_width_value').text(settings.width);
                        document.documentElement.style.setProperty('--multithumb-width', `${settings.width}px`);
                    });
                    $widthInput.on('change', () => saveSettings());
                }
            }
        } catch (e) {
            console.error('[SillyTavern-MultiThumb] Failed settings UI:', e);
        }
    }

    async function init() {
        console.log('[SillyTavern-MultiThumb] Initializing...');
        loadSettings();
        await setupSettingsUI();
        const context = window.SillyTavern.getContext();
        const { eventSource, event_types } = context;
        const scan = () => document.querySelectorAll('.mes').forEach(processMessage);
        scan();
        if (eventSource && event_types) {
            eventSource.on(event_types.MESSAGE_RECEIVED, (idx) => {
                setTimeout(() => {
                    const el = document.querySelector(`.mes[display_index="${idx}"]`);
                    if (el) processMessage(el);
                }, 300);
            });
            const selectEvent = event_types.CHARACTER_SELECTED || event_types.CHARACTER_CHANGED || 'character_selected';
            eventSource.on(selectEvent, () => setTimeout(scan, 500));
        }
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('mes')) processMessage(node);
                        else node.querySelectorAll?.('.mes').forEach(processMessage);
                    }
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const itv = setInterval(() => {
        if (window.SillyTavern?.getContext) {
            clearInterval(itv);
            init();
        }
    }, 200);
})();
