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
    const tbody = document.getElementById('leaderboardBody');
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
    setupLeaderboardCompare();

})
