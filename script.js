// Navigation
const navButtons = document.querySelectorAll('.sidebar-nav button');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        showSection(sectionId);
        setActiveNavButton(sectionId);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setActiveNavButton(sectionId) {
    navButtons.forEach(button => {
        button.classList.toggle('active-nav', button.dataset.section === sectionId);
    });
}

// Role change simulation
document.getElementById('change-role').addEventListener('click', () => {
    alert('Fonction de changement de rôle à implémenter.');
});

// Initialize with manager
showSection('manager');
setActiveNavButton('manager');
