// Navigation
document.querySelectorAll('.sidebar-nav button').forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        showSection(sectionId);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Role change simulation
document.getElementById('change-role').addEventListener('click', () => {
    alert('Fonction de changement de rôle à implémenter.');
});

// Initialize with manager
showSection('manager');