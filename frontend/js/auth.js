function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    
    return user;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authLinks = document.getElementById('auth-links');
    
    if (authLinks && user.nama) {
        authLinks.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-gray-700">Halo, <strong>${user.nama}</strong></span>
                <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    Logout
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar);