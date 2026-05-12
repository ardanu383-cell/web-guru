// Navbar dinamis — load menu dan brand dari API
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

        // Menu desktop
        const desktopMenuHTML = menus.map(m => {
            const href = m.tipe === 'page' ? `page.html?slug=${m.link}` : (m.link || '#');
            if (m.submenu && m.submenu.length > 0) {
                const subItems = m.submenu.map(sub => {
                    const subHref = sub.tipe === 'page' ? `page.html?slug=${sub.link}` : (sub.link || '#');
                    return `<a href="${subHref}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 whitespace-nowrap">${sub.label}</a>`;
                }).join('');
                return `
                    <div class="relative group">
                        <button class="flex items-center gap-1 text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                            ${m.label}
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        <div class="absolute left-0 top-full hidden group-hover:block bg-white shadow-xl rounded-xl py-2 min-w-48 z-50 border">
                            ${subItems}
                        </div>
                    </div>`;
            }
            return `<a href="${href}" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">${m.label}</a>`;
        }).join('');

        // Menu mobile (flat list dengan sub-menu)
        const mobileMenuHTML = menus.map(m => {
            const href = m.tipe === 'page' ? `page.html?slug=${m.link}` : (m.link || '#');
            let html = `<a href="${href}" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium border-b border-gray-100">${m.label}</a>`;
            if (m.submenu && m.submenu.length > 0) {
                html += m.submenu.map(sub => {
                    const subHref = sub.tipe === 'page' ? `page.html?slug=${sub.link}` : (sub.link || '#');
                    return `<a href="${subHref}" class="block px-8 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-50">↳ ${sub.label}</a>`;
                }).join('');
            }
            return html;
        }).join('');

        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <!-- Brand -->
                    <a href="index.html" class="flex items-center gap-2 flex-shrink-0">
                        ${logoHTML}
                        <span class="text-xl font-bold text-gray-800">${namaBrand}</span>
                    </a>

                    <!-- Desktop menu -->
                    <div class="hidden md:flex items-center space-x-1 flex-1 ml-6">
                        ${desktopMenuHTML}
                    </div>

                    <!-- Desktop auth -->
                    <div class="hidden md:flex items-center gap-2" id="auth-links">
                        <a href="login.html" class="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Login</a>
                        <a href="register.html" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">Daftar</a>
                    </div>

                    <!-- Hamburger (mobile) -->
                    <button id="navbar-hamburger" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                        <svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                        <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile menu dropdown -->
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t shadow-lg">
                ${mobileMenuHTML}
                <div class="px-4 py-3 flex gap-3 border-t">
                    <a href="login.html" class="flex-1 text-center py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium">Login</a>
                    <a href="register.html" class="flex-1 text-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Daftar</a>
                </div>
            </div>`;

        // Update title
        if (s.nama_website) document.title = document.title.replace('GuruOnline', s.nama_website);

    } catch(e) {
        // Fallback
        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <a href="index.html" class="flex items-center gap-2">
                    <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">G</span>
                    </div>
                    <span class="font-bold text-gray-800">GuruOnline</span>
                </a>
                <div class="flex items-center gap-4">
                    <a href="index.html" class="text-gray-700 text-sm">Beranda</a>
                    <a href="berita.html" class="text-gray-700 text-sm">Berita</a>
                    <a href="login.html" class="text-indigo-600 text-sm font-medium">Login</a>
                </div>
            </div>`;
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger-icon');
    const closeBtn = document.getElementById('close-icon');
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    hamburger.classList.toggle('hidden', !isOpen);
    closeBtn.classList.toggle('hidden', isOpen);
}

loadNavbar();
