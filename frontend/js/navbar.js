// Navbar dinamis — load menu dari API
async function loadNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    try {
        const res = await fetch('/api/menu');
        const menus = await res.json();

        const menuHTML = menus.map(m => {
            const href = m.tipe === 'page' ? `page.html?slug=${m.link}` : (m.link || '#');
            if (m.submenu && m.submenu.length > 0) {
                const subItems = m.submenu.map(s => {
                    const subHref = s.tipe === 'page' ? `page.html?slug=${s.link}` : (s.link || '#');
                    return `<a href="${subHref}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">${s.label}</a>`;
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

        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="index.html" class="flex items-center mr-8">
                            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold">G</span>
                            </div>
                            <span class="ml-2 text-lg font-bold text-gray-800">GuruOnline</span>
                        </a>
                        <div class="hidden md:flex items-center space-x-1">
                            <a href="index.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Beranda</a>
                            ${menuHTML}
                            <a href="berita.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Berita</a>
                        </div>
                    </div>
                    <div class="flex items-center" id="auth-links">
                        <a href="login.html" class="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Login</a>
                        <a href="register.html" class="ml-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm">Daftar</a>
                    </div>
                </div>
            </div>`;
    } catch(e) {
        // Fallback navbar sederhana
        navbar.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <a href="index.html" class="font-bold text-gray-800">GuruOnline</a>
                <a href="login.html" class="text-indigo-600">Login</a>
            </div>`;
    }
}
loadNavbar();
