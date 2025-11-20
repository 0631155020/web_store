document.addEventListener('DOMContentLoaded', function() {
    const currentLang = document.querySelector('.current-lang');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = langDropdown.querySelectorAll('.lang-option');
    const activeLangDisplay = document.getElementById('activeLang');

    // 1. Toggle the dropdown menu on click
    currentLang.addEventListener('click', function() {
        langDropdown.classList.toggle('show');
    });

    // 2. Add event listeners to each language option
    langOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove 'active' class from all options
            langOptions.forEach(opt => opt.classList.remove('active'));

            // Set 'active' class on the clicked option
            this.classList.add('active');

            // Update the display text to the new active language
            activeLangDisplay.textContent = this.getAttribute('data-lang').toUpperCase();

            // Hide the dropdown after selection
            langDropdown.classList.remove('show');

            // *** IMPORTANT: Add your language switching logic here ***
            // e.g., redirect to a new URL, or call an AJAX function
            console.log('Switching language to: ' + this.getAttribute('data-lang'));
        });
    });

    // 3. Close the dropdown if the user clicks outside of it
    window.addEventListener('click', function(e) {
        if (!e.target.closest('.language-switcher-container')) {
            if (langDropdown.classList.contains('show')) {
                langDropdown.classList.remove('show');
            }
        }
    });
});