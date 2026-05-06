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


// Preparation page interactions
const prepDate = document.getElementById('prep-date');
if (prepDate) {
    const now = new Date();
    prepDate.textContent = now.toLocaleDateString('fr-FR');
}

const prepStatusBadge = document.querySelector('#preparation .status-badge');
const prepSummaryStatus = document.querySelector('#prep-summary-table .status-badge');

function updatePrepStatus(text, cls) {
    if (prepStatusBadge) {
        prepStatusBadge.textContent = text;
        prepStatusBadge.className = `badge status-badge ${cls}`;
    }
    if (prepSummaryStatus) {
        prepSummaryStatus.textContent = text;
        prepSummaryStatus.className = `badge status-badge ${cls}`;
    }
}

const prepStartBtn = document.getElementById('prep-start');
const prepFinishBtn = document.getElementById('prep-finish');
const prepPauseBtn = document.getElementById('prep-pause');
const prepIssueBtn = document.getElementById('prep-issue');
const prepSaveBtn = document.getElementById('prep-save');

if (prepStartBtn) {
    prepStartBtn.addEventListener('click', () => {
        updatePrepStatus('En cours', 'status-running');
    });
}

if (prepFinishBtn) {
    prepFinishBtn.addEventListener('click', () => {
        updatePrepStatus('Terminé', 'status-running');
    });
}

if (prepPauseBtn) {
    prepPauseBtn.addEventListener('click', () => {
        updatePrepStatus('En pause', 'status-waiting');
    });
}

if (prepIssueBtn) {
    prepIssueBtn.addEventListener('click', () => {
        updatePrepStatus('Bloqué', 'status-blocked');
    });
}

if (prepSaveBtn) {
    prepSaveBtn.addEventListener('click', () => {
        alert('Saisie opérateur enregistrée (simulation).');
    });
}

const prepAddObservationBtn = document.getElementById('prep-add-observation');
if (prepAddObservationBtn) {
    prepAddObservationBtn.addEventListener('click', () => {
        const obsList = document.getElementById('prep-observation-list');
        const obsText = document.getElementById('prep-observation-text');
        const obsType = document.getElementById('prep-observation-type');
        const obsLevel = document.getElementById('prep-observation-level');

        const content = (obsText && obsText.value.trim()) || 'Observation ajoutée par l’opérateur (simulation).';
        const li = document.createElement('li');
        li.textContent = `[${obsType.value} - ${obsLevel.value}] ${content}`;
        obsList.prepend(li);

        if (obsText) {
            obsText.value = '';
        }
    });
}
