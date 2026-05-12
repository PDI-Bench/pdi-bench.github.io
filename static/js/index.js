window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function setupLeaderboardTabs() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    const panels = document.querySelectorAll('.leaderboard-panel');
    if (tabs.length === 0 || panels.length === 0) return;

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            tabs.forEach((item) => item.classList.remove('is-active'));
            panels.forEach((panel) => panel.classList.remove('is-active'));
            tab.classList.add('is-active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('is-active');
        });
    });
}

function setupSamplePreviews() {
    const previews = document.querySelectorAll('.sample-preview');
    previews.forEach((preview) => {
        const video = preview.querySelector('video');
        if (!video) return;
        preview.addEventListener('mouseenter', () => {
            video.play().catch(() => {});
        });
        preview.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

function setupLeaderboardSorting() {
    const table = document.querySelector('.leaderboard-table');
    const tbody = document.getElementById('leaderboardBodyCompact');
    if (!table || !tbody) return;

    const sortHeaders = table.querySelectorAll('th.sortable');
    const numeric = (value) => parseFloat(value);

    sortHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            const key = header.dataset.sortKey;
            const currentDir = header.dataset.sortDir === 'desc' ? 'desc' : 'asc';
            const nextDir = key === 'mathpass' ? (currentDir === 'asc' ? 'desc' : 'asc') : (currentDir === 'asc' ? 'desc' : 'asc');

            sortHeaders.forEach((item) => delete item.dataset.sortDir);
            header.dataset.sortDir = nextDir;

            const baseline = tbody.querySelector('.baseline-row');
            const rows = Array.from(tbody.querySelectorAll('tr:not(.baseline-row)'));
            rows.sort((a, b) => {
                const aVal = numeric(a.dataset[key]);
                const bVal = numeric(b.dataset[key]);
                if (Number.isNaN(aVal) || Number.isNaN(bVal)) return 0;
                return nextDir === 'asc' ? aVal - bVal : bVal - aVal;
            });

            if (baseline) tbody.appendChild(baseline);
            rows.forEach((row, index) => {
                row.children[0].textContent = (index + 2).toString();
                tbody.appendChild(row);
            });
        });
    });
}

function drawRadarChart(canvas, values, gtValues) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.33;
    const labels = ['Scale', 'Traj', 'Rigid'];
    const angles = [-Math.PI / 2, (Math.PI * 1) / 6, (Math.PI * 5) / 6];

    ctx.clearRect(0, 0, width, height);

    // grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 4; level += 1) {
        const r = (radius * level) / 4;
        ctx.beginPath();
        angles.forEach((angle, idx) => {
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#94a3b8';
    angles.forEach((angle) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();
    });

    // GT baseline polygon (gray)
    if (gtValues && gtValues.length === 3) {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.14)';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        gtValues.forEach((val, idx) => {
            const r = radius * Math.max(0, Math.min(1, val));
            const x = cx + Math.cos(angles[idx]) * r;
            const y = cy + Math.sin(angles[idx]) * r;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Selected model polygon (blue)
    ctx.fillStyle = 'rgba(37, 99, 235, 0.24)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((val, idx) => {
        const r = radius * Math.max(0, Math.min(1, val));
        const x = cx + Math.cos(angles[idx]) * r;
        const y = cy + Math.sin(angles[idx]) * r;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // points + labels
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px Inter, sans-serif';
    labels.forEach((label, idx) => {
        const lx = cx + Math.cos(angles[idx]) * (radius + 18);
        const ly = cy + Math.sin(angles[idx]) * (radius + 18);
        ctx.fillText(label, lx - 16, ly + 5);
    });

    // legend
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(18, 16, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('Selected Model', 36, 26);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(18, 36, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('GT Baseline', 36, 46);
}

function setupModelRadar() {
    const modal = document.getElementById('radarModal');
    const closeBtn = document.getElementById('closeRadarModal');
    const triggers = document.querySelectorAll('.model-open-btn');
    if (!modal || !closeBtn || triggers.length === 0) return;

    const title = document.getElementById('radarTitle');
    const subtitle = document.getElementById('radarSubtitle');
    const metricScale = document.getElementById('metricScale');
    const metricTraj = document.getElementById('metricTraj');
    const metricRigid = document.getElementById('metricRigid');
    const metricPdi = document.getElementById('metricPdi');
    const canvas = document.getElementById('radarCanvas');
    const rows = Array.from(document.querySelectorAll('#leaderboardBodyCompact tr'));

    // Enforce modal behavior even if stylesheet cache is stale.
    Object.assign(modal.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: '2000'
    });

    // Use fixed bounds from the 6 generated models for a unified scale.
    const generatedRows = rows.filter((row) => !row.classList.contains('baseline-row'));
    const maxScale = Math.max(...generatedRows.map((row) => parseFloat(row.dataset.scale || '0')));
    const maxTraj = Math.max(...generatedRows.map((row) => parseFloat(row.dataset.traj || '0')));
    const maxRigid = Math.max(...generatedRows.map((row) => parseFloat(row.dataset.rigid || '0')));

    const gtRow = rows.find((row) => row.classList.contains('baseline-row'));
    const gtScaleRaw = parseFloat(gtRow?.dataset.scale || '0');
    const gtTrajRaw = parseFloat(gtRow?.dataset.traj || '0');
    const gtRigidRaw = parseFloat(gtRow?.dataset.rigid || '0');
    const gtNormalized = [
        gtScaleRaw / maxScale,
        gtTrajRaw / maxTraj,
        gtRigidRaw / maxRigid
    ];

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const model = trigger.dataset.model;
            const org = trigger.dataset.org;
            const pdi = parseFloat(trigger.dataset.pdi);
            const scale = parseFloat(trigger.dataset.scale);
            const traj = parseFloat(trigger.dataset.traj);
            const rigid = parseFloat(trigger.dataset.rigid);

            title.textContent = `${model} Radar Profile`;
            subtitle.textContent = `${org} | Unified scale across all generated models, with GT as gray baseline.`;
            metricScale.textContent = scale.toFixed(4);
            metricTraj.textContent = traj.toFixed(4);
            metricRigid.textContent = rigid.toFixed(4);
            metricPdi.textContent = pdi.toFixed(4);

            const normalized = [
                scale / maxScale,
                traj / maxTraj,
                rigid / maxRigid
            ];
            drawRadarChart(canvas, normalized, gtNormalized);

            modal.classList.add('is-open');
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeBtn.click();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeBtn.click();
        }
    });
}

function setupLeaderboardCompare() {
    const compareBtn = document.getElementById('openCompareBtn');
    const modal = document.getElementById('compareModal');
    const closeBtn = document.getElementById('closeCompareModal');
    const checks = document.querySelectorAll('.compare-check');
    if (!compareBtn || !modal || !closeBtn || checks.length === 0) return;

    const modelA = document.getElementById('compareModelA');
    const modelB = document.getElementById('compareModelB');
    const videoA = document.getElementById('compareVideoA');
    const videoB = document.getElementById('compareVideoB');
    const deltaText = document.getElementById('compareDeltaText');

    checks.forEach((check) => {
        check.addEventListener('change', () => {
            const selected = Array.from(checks).filter((item) => item.checked);
            if (selected.length > 2) {
                check.checked = false;
                alert('Please select at most 2 models for comparison.');
            }
        });
    });

    compareBtn.addEventListener('click', () => {
        const selected = Array.from(checks).filter((item) => item.checked);
        if (selected.length !== 2) {
            alert('Select exactly 2 models to compare.');
            return;
        }

        const [a, b] = selected;
        modelA.textContent = a.dataset.model;
        modelB.textContent = b.dataset.model;
        videoA.src = a.dataset.video;
        videoB.src = b.dataset.video;
        videoA.load();
        videoB.load();

        const pdiA = parseFloat(a.dataset.pdi);
        const pdiB = parseFloat(b.dataset.pdi);
        const diff = (pdiB - pdiA).toFixed(4);
        const better = pdiA < pdiB ? a.dataset.model : b.dataset.model;
        deltaText.textContent = `PDI delta: ${diff} (${better} is better under lower-is-better criterion).`;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        videoA.pause();
        videoB.pause();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeBtn.click();
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
    setupLeaderboardTabs();
    setupSamplePreviews();
    setupLeaderboardSorting();
    setupModelRadar();

})
