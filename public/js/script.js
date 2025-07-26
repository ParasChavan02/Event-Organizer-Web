// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = '/api'; // UPDATED: Relative URL for unified deployment

    // --- DOM Elements ---
    const authSection = document.getElementById('auth-section');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const authEmailInput = document.getElementById('authEmail');
    const authPasswordInput = document.getElementById('authPassword');
    const passwordGroup = document.getElementById('passwordGroup');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authMessage = document.getElementById('authMessage');
    const toggleToRegisterLink = document.getElementById('toggleToRegister');
    const toggleToLoginLink = document.getElementById('toggleToLogin');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const authLinks = document.getElementById('authLinks');
    const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    const createEventSection = document.getElementById('create-event');
    const myEventsSection = document.getElementById('my-events');
    const createEventNavLink = document.getElementById('createEventNavLink');
    const myEventsNavLink = document.getElementById('myEventsNavLink');
    const contactNavLink = document.getElementById('contactNavLink'); // Reference to Contact nav link
    const contactSection = document.getElementById('contact'); // Reference to Contact section

    const eventForm = document.getElementById('event-form');
    const eventNameInput = document.getElementById('eventName');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventLocationInput = document.getElementById('eventLocation');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventCategorySelect = document.getElementById('eventCategory');
    const eventFormMessage = document.getElementById('eventFormMessage');

    const eventListDiv = document.getElementById('event-list');
    const eventListMessage = document.getElementById('eventListMessage');

    const getStartedBtn = document.getElementById('getStartedBtn');

    // Contact form elements
    const contactForm = document.getElementById('contact-form');
    const contactNameInput = document.getElementById('contactName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactMessageInput = document.getElementById('contactMessage');
    const contactMessageStatus = document.getElementById('contactMessageStatus');


    let currentAuthMode = 'login'; // 'login' or 'register'

    // --- Helper Functions ---

    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message-box ${type}`; // Add type class (success/error)
        element.style.opacity = '1';
        setTimeout(() => {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.display = 'none';
            }, 300); // Wait for fade out
        }, 5000); // Message disappears after 5 seconds
        element.style.display = 'block';
    }

    function hideAllSections() {
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });
    }

    function showSection(sectionElement) {
        hideAllSections();
        sectionElement.style.display = 'block';
    }

    function updateNavLinks(isLoggedIn) {
        if (isLoggedIn) {
            authLinks.style.display = 'none';
            loggedInUserDisplay.style.display = 'block';
            createEventNavLink.style.display = 'block';
            myEventsNavLink.style.display = 'block';
            contactNavLink.style.display = 'block'; // Ensure contact link is visible if logged in
        } else {
            authLinks.style.display = 'block';
            loggedInUserDisplay.style.display = 'none';
            createEventNavLink.style.display = 'none';
            myEventsNavLink.style.display = 'none';
            contactNavLink.style.display = 'block'; // Contact link can be visible even if not logged in
        }
    }

    function setAuthMode(mode) {
        currentAuthMode = mode;
        if (mode === 'login') {
            authTitle.textContent = 'Login';
            authSubmitBtn.textContent = 'Login';
            toggleToRegisterLink.style.display = 'inline';
            toggleToLoginLink.style.display = 'none';
            passwordGroup.style.display = 'block'; // Always show password for local login
        } else { // register
            authTitle.textContent = 'Register';
            authSubmitBtn.textContent = 'Register';
            toggleToRegisterLink.style.display = 'none';
            toggleToLoginLink.style.display = 'inline';
            passwordGroup.style.display = 'block';
        }
        authForm.reset();
        authMessage.style.display = 'none'; // Hide previous messages
        showSection(authSection);
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function setToken(token) {
        localStorage.setItem('token', token);
    }

    function removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail'); // Also remove email
    }

    function setUserEmail(email) {
        localStorage.setItem('userEmail', email);
        userEmailDisplay.textContent = email;
    }

    function getUserEmail() {
        return localStorage.getItem('userEmail');
    }

    // --- Authentication Logic ---

    async function checkAuthStatus() {
        const token = getToken();
        const userEmail = getUserEmail();

        // Handle Google OAuth callback token
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const googleToken = params.get('token');
        const googleEmail = params.get('email');

        if (googleToken && googleEmail) {
            setToken(googleToken);
            setUserEmail(googleEmail);
            window.location.hash = ''; // Clear hash from URL
            updateNavLinks(true);
            showSection(myEventsSection); // Redirect to events after Google login
            fetchEvents();
            return;
        }

        if (token && userEmail) {
            // Validate token with backend if necessary, or assume valid for simplicity
            // In a real app, you might have a /api/auth/verify-token endpoint
            try {
                const response = await fetch(`${API_BASE_URL}/auth/user`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserEmail(data.email);
                    updateNavLinks(true);
                    showSection(myEventsSection); // Show events if logged in
                    fetchEvents();
                } else {
                    console.error('Token validation failed:', response.statusText);
                    removeToken();
                    updateNavLinks(false);
                    showSection(authSection); // Show login if token invalid
                    setAuthMode('login');
                }
            } catch (error) {
                console.error('Error validating token:', error);
                removeToken();
                updateNavLinks(false);
                showSection(authSection);
                setAuthMode('login');
            }
        } else {
            updateNavLinks(false);
            showSection(authSection); // Show login/register by default
            setAuthMode('login');
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        let url = '';
        let method = 'POST';
        let body = { email, password };

        if (currentAuthMode === 'login') {
            url = `${API_BASE_URL}/auth/login`;
        } else { // register
            url = `${API_BASE_URL}/auth/register`;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUserEmail(data.user.email);
                showMessage(authMessage, data.message, 'success');
                setTimeout(() => {
                    updateNavLinks(true);
                    showSection(myEventsSection); // Redirect to events section
                    fetchEvents(); // Fetch events after successful login/register
                }, 1000); // Give time for message to display
            } else {
                showMessage(authMessage, data.message || 'Authentication failed', 'error');
            }
        } catch (error) {
            console.error('Auth request failed:', error);
            showMessage(authMessage, 'Network error. Please try again.', 'error');
        }
    });

    googleLoginBtn.addEventListener('click', () => {
        // Redirect to your backend's Google OAuth initiation endpoint
        window.location.href = `${API_BASE_URL}/auth/google`;
    });

    logoutBtn.addEventListener('click', () => {
        removeToken();
        updateNavLinks(false);
        showSection(authSection); // Go back to login/register
        setAuthMode('login');
        eventListDiv.innerHTML = '<p>No events created yet. Start by creating one above!</p>'; // Clear events
    });

    // --- Event Management Logic ---

    async function fetchEvents() {
        eventListMessage.style.display = 'none';
        eventListDiv.innerHTML = '<p>Loading events...</p>'; // Show loading state

        const token = getToken();
        if (!token) {
            eventListDiv.innerHTML = '<p>Please log in to view your events.</p>';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const events = await response.json();
                renderEvents(events);
            } else {
                const errorData = await response.json();
                showMessage(eventListMessage, errorData.message || 'Failed to fetch events.', 'error');
                eventListDiv.innerHTML = '<p>Error loading events. Please try again.</p>';
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showMessage(eventListMessage, 'Network error fetching events.', 'error');
            eventListDiv.innerHTML = '<p>Network error. Could not load events.</p>';
        }
    }

    function renderEvents(events) {
        eventListDiv.innerHTML = ''; // Clear existing events

        if (events.length === 0) {
            eventListDiv.innerHTML = '<p>No events created yet. Start by creating one above!</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event-card');
            eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Category:</strong> ${event.category}</p>
                <p><strong>Description:</strong> ${event.description || 'No description provided.'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm edit-btn" data-id="${event._id}">Edit</button>
                    <button class="btn btn-sm delete-btn" data-id="${event._id}">Delete</button>
                </div>
            `;
            eventListDiv.appendChild(eventCard);
        });

        // Add event listeners for delete and edit buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                deleteEvent(eventId);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const eventId = e.target.dataset.id;
                editEvent(eventId);
            });
        });
    }

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = {
            name: eventNameInput.value,
            date: eventDateInput.value,
            time: eventTimeInput.value,
            location: eventLocationInput.value,
            description: eventDescriptionInput.value,
            category: eventCategorySelect.value
        };

        const token = getToken();
        if (!token) {
            showMessage(eventFormMessage, 'Please log in to create or update events.', 'error');
            return;
        }

        const editingId = eventForm.dataset.editingId;
        let url = `${API_BASE_URL}/events`;
        let method = 'POST';
        let successMessage = 'Event created successfully!';

        if (editingId) {
            url = `${API_BASE_URL}/events/${editingId}`;
            method = 'PUT';
            successMessage = 'Event updated successfully!';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(eventFormMessage, successMessage, 'success');
                eventForm.reset();
                delete eventForm.dataset.editingId; // Clear editing state
                fetchEvents(); // Refresh event list
                // Optionally, scroll to my events section
                setTimeout(() => showSection(myEventsSection), 1000);
            } else {
                showMessage(eventFormMessage, data.message || 'Failed to save event.', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showMessage(eventFormMessage, 'Network error. Could not save event.', 'error');
        }
    });

    async function deleteEvent(eventId) {
        // Using a custom modal or confirmation dialog is better than `confirm()`
        // For this example, we'll keep `confirm()` as it was, but note the best practice.
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        const token = getToken();
        if (!token) {
            showMessage(eventListMessage, 'Please log in to delete events.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(eventListMessage, data.message, 'success');
                fetchEvents(); // Refresh event list
            } else {
                showMessage(eventListMessage, data.message || 'Failed to delete event.', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showMessage(eventListMessage, 'Network error. Could not delete event.', 'error');
        }
    }

    async function editEvent(eventId) {
        const token = getToken();
        if (!token) {
            showMessage(eventFormMessage, 'Please log in to edit events.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const event = await response.json();
                eventNameInput.value = event.name;
                eventDateInput.value = new Date(event.date).toISOString().split('T')[0]; // Format for date input
                eventTimeInput.value = event.time;
                eventLocationInput.value = event.location;
                eventDescriptionInput.value = event.description;
                eventCategorySelect.value = event.category;

                eventForm.dataset.editingId = event._id; // Store ID for update

                showSection(createEventSection); // Go to create event form
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
            } else {
                const errorData = await response.json();
                showMessage(eventFormMessage, errorData.message || 'Failed to fetch event for editing.', 'error');
            }
        } catch (error) {
            console.error('Error fetching event for edit:', error);
            showMessage(eventFormMessage, 'Network error. Could not fetch event for editing.', 'error');
        }
    }

    // --- Contact Form Logic ---
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = contactNameInput.value;
            const email = contactEmailInput.value;
            const message = contactMessageInput.value;

            // In a real application, you would send this data to a backend endpoint
            // For now, we'll simulate a success message and log to console.
            // A backend endpoint for contact forms would typically not require authentication.

            console.log('Contact form submitted:', { name, email, message });
            showMessage(contactMessageStatus, 'Your message has been sent successfully! We will get back to you soon.', 'success');
            contactForm.reset(); // Clear the form

            /*
            // Example of what a real fetch to a backend contact endpoint might look like:
            try {
                const response = await fetch(`${API_BASE_URL}/contact`, { // You'd need to create this endpoint in your backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                const data = await response.json();
                if (response.ok) {
                    showMessage(contactMessageStatus, data.message || 'Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showMessage(contactMessageStatus, data.message || 'Failed to send message.', 'error');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                showMessage(contactMessageStatus, 'Network error. Please try again later.', 'error');
            }
            */
        });
    }


    // --- Event Listeners for UI Navigation ---
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('login');
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('register');
    });

    toggleToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('register');
    });

    toggleToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('login');
    });

    document.querySelector('a[href="#home"]').addEventListener('click', (e) => {
        e.preventDefault();
        showSection(document.getElementById('home'));
    });

    createEventNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(createEventSection);
        eventForm.reset(); // Clear form when navigating to create
        delete eventForm.dataset.editingId; // Ensure no editing state
    });

    myEventsNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(myEventsSection);
        fetchEvents(); // Fetch latest events when navigating to My Events
    });

    contactNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(contactSection); // Show the actual contact section
        contactForm.reset(); // Clear contact form on navigation
        contactMessageStatus.style.display = 'none'; // Hide any previous status messages
    });


    getStartedBtn.addEventListener('click', () => {
        if (getToken()) {
            showSection(createEventSection);
        } else {
            showSection(authSection);
            setAuthMode('register'); // Encourage registration
        }
    });

    // Initial check on page load
    checkAuthStatus();
});
