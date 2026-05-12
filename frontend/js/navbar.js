async function loadNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    try {
        const [menuRes, settingsRes] = await Promise.all([
            fetch('/api/menu'),
            fetch('/api/settings')
        ]);
        const menus = await menuRes.json();
        const s = await settingsRes.json();

        const namaBrand = s.nama_website || 'GuruOnline';
        const logoTeks = s.logo_teks || namaBrand[0] || 'G';
        const logoUrl = s.logo_url || '';

        const logoHTML = logoUrl
            ? `<img src="${logoUrl}" class="w-10 h-10 rounded-lg object-cover">`
            : `<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                   <span class="text-white font-bold text-lg">${logoTeks}</span>
               </div>`;

        // ── Desktop menu ──────────────────────────────────────────
        const desktopMenuHTML = menus.map(m => {
            const href = m.tipe === 'page' ? `page.html?slug=${m.link}` : (m.link || '#');
            if (m.submenu && m.submenu.length > 0) {
                const subItems = m.submenu.map(sub => {
                    const subHref = sub.tipe === 'page' ? `page.html?slug=${sub.link}` : (sub.link || '#');
                    // Sub-sub menu (level 3)
                    if (sub.submenu && sub.submenu.length > 0) {
                        const subsubItems = sub.submenu.map(ss => {
                            const ssHref = ss.tipe === 'page' ? `page.html?slug=${ss.link}` : (ss.link || '#');
                            return `<a href="${ssHref}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 whitespace-nowrap">${ss.label}</a>`;
                        }).join('');
                        return `
                            <div class="relative group/sub">
                                <a href="${subHref}" class="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <span class="flex items-center gap-2">
                                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                                        ${sub.label}
                                    </span>
                                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                </a>
                                <div class="absolute left-full top-0 hidden group-hover/sub:block z-50 min-w-48 pl-1">
                                    <div class="bg-white shadow-xl rounded-xl py-1.5 border border-gray-100">
                                        ${subsubItems}
                                    </div>
                                </div>
                            </div>`;
                    }
                    return `<a href="${subHref}" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                        ${sub.label}
                    </a>`;
                }).join('');
                return `
                    <div class="relative group">
                        <button class="flex items-center gap-1.5 text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                            ${m.label}
                            <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        <div class="absolute left-0 top-full pt-1 hidden group-hover:block z-50 min-w-52">
                            <div class="bg-white shadow-xl rounded-xl py-1.5 border border-gray-100">
                                ${subItems}
                            </div>
                        </div>
                    </div>`;
            }
            return `<a href="${href}" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors">${m.label}</a>`;
        }).join('');

        // ── Mobile menu (collapsible sub-menu) ───────────────────
        let mobileIdx = 0;
        const mobileMenuHTML = menus.map(m => {
            const href = m.tipe === 'page' ? `page.html?slug=${m.link}` : (m.link || '#');
            if (m.submenu && m.submenu.length > 0) {
                const idx = mobileIdx++;
                const subItems = m.submenu.map(sub => {
                    const subHref = sub.tipe === 'page' ? `page.html?slug=${sub.link}` : (sub.link || '#');
                    return `<a href="${subHref}" class="flex items-center gap-2 pl-8 pr-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-50">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0"></span>
                        ${sub.label}
                    </a>`;
                }).join('');
                return `
                    <div>
                        <button onclick="toggleMobileSub(${idx})" class="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-indigo-50 font-medium border-b border-gray-100 transition-colors">
                            <span>${m.label}</span>
                            <svg id="mobile-arrow-${idx}" class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        <div id="mobile-sub-${idx}" class="hidden bg-gray-50">
                            ${subItems}
                        </div>
                    </div>`;
            }
            return `<a href="${href}" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium border-b border-gray-100 transition-colors">${m.label}</a>`;
        }).join('');

        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <a href="index.html" class="flex items-center gap-2 flex-shrink-0">
                        ${logoHTML}
                        <span class="text-xl font-bold text-gray-800">${namaBrand}</span>
                    </a>
                    <div class="hidden md:flex items-center space-x-1 flex-1 ml-6">
                        ${desktopMenuHTML}
                    </div>
                    <div class="hidden md:flex items-center gap-2" id="auth-links">
                        <a href="login.html" class="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Login</a>
                        <a href="register.html" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">Daftar</a>
                    </div>
                    <button id="navbar-hamburger" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                        <svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                        <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t shadow-lg max-h-[70vh] overflow-y-auto">
                ${mobileMenuHTML}
                <div class="px-4 py-3 flex gap-3 border-t bg-gray-50">
                    <a href="login.html" class="flex-1 text-center py-2.5 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">Login</a>
                    <a href="register.html" class="flex-1 text-center py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Daftar</a>
                </div>
            </div>`;

        if (s.nama_website) document.title = document.title.replace('GuruOnline', s.nama_website);

    } catch(e) {
        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <a href="index.html" class="flex items-center gap-2">
                    <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">G</span>
                    </div>
                    <span class="font-bold text-gray-800">GuruOnline</span>
                </a>
                <div class="flex items-center gap-4">
                    <a href="berita.html" class="text-gray-700 text-sm">Berita</a>
                    <a href="login.html" class="text-indigo-600 text-sm font-medium">Login</a>
                </div>
            </div>`;
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const h = document.getElementById('hamburger-icon');
    const c = document.getElementById('close-icon');
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    h.classList.toggle('hidden', !isOpen);
    c.classList.toggle('hidden', isOpen);
}

function toggleMobileSub(idx) {
    const sub = document.getElementById(`mobile-sub-${idx}`);
    const arrow = document.getElementById(`mobile-arrow-${idx}`);
    const isOpen = !sub.classList.contains('hidden');
    sub.classList.toggle('hidden', isOpen);
    arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

loadNavbar();
