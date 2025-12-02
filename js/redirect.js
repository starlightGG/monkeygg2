        // --- Core Masking Logic ---
        
        // Key for localStorage
        const MASK_KEY = 'maskEnabled';

        // Get elements
        const maskCheckbox = document.getElementById('redirectCheckboxInput');

        /**
         * Updates the state of the mask (tab-cloaking) based on the checkbox value.
         * Saves the state to localStorage.
         * @param {boolean} isEnabled - The new state of the mask.
         */
        function updateMaskState(isEnabled) {
            // 1. Save state to localStorage
            localStorage.setItem(MASK_KEY, isEnabled.toString());
            
            // 2. Apply visual and functional updates
            if (isEnabled) {

                // --- MASK ACTIVATION LOGIC ---
                // Add event listener to handle page visibility change
                document.addEventListener('visibilitychange', handleVisibilityChange);
            } else {

                // --- MASK DEACTIVATION LOGIC ---
                // Remove the event listener if it exists
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        }

        /**
         * The function that executes the actual mask/redirect when visibility changes.
         */
        function handleVisibilityChange() {
            if (document.visibilityState === 'hidden') {
                // If the user tabs away, perform the redirect/mask
                // This is a common method for tab cloaking: redirecting to an innocent site.
                // Using window.top ensures the main browser tab is redirected, even if running in an iframe.
                window.top.location.replace("https://www.google.com/");
            }
        }

        /**
         * Initializes the script, reading the state from localStorage 
         * and setting up the initial UI and event listener.
         */
        function initializeMaskToggle() {
            // 1. Read the saved state from localStorage (default to 'false' if not found)
            const savedState = localStorage.getItem(MASK_KEY);
            const isEnabled = savedState === 'true'; 

            // 2. Set the initial state of the checkbox
            maskCheckbox.checked = isEnabled;

            // 3. Apply the initial state (runs updateMaskState)
            updateMaskState(isEnabled);

            // 4. Attach event listener to the checkbox for future toggles
            maskCheckbox.addEventListener('change', (event) => {
                const newState = event.target.checked;
                updateMaskState(newState);
            });
        }

        // Run initialization when the window loads
        window.onload = initializeMaskToggle;
