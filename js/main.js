// ============================================
// Amy Phan West for Congress - Main JavaScript
// ============================================

// ============================================
// NAVIGATION
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Sticky navigation scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile navigation toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ============================================
// MAUTIC FORM HANDLING
// ============================================
// Form ID mapping - UPDATE THESE after creating forms in Mautic UI
// See MAUTIC_SETUP.md for instructions
const MAUTIC_FORM_IDS = {
    'homepage_inline': null,    // Inline Updates Signup - TODO: Add form ID from Mautic
    'footer': null,             // Footer Subscription - TODO: Add form ID from Mautic
    'exit_intent': null,        // Exit Intent Popup - TODO: Add form ID from Mautic
    'modal_signup': null,       // Homepage Hero Signup - TODO: Add form ID from Mautic
    'hero': null                // Hero CTA - TODO: Add form ID from Mautic
};

async function handleSignup(event, source) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const firstname = formData.get('firstname') || '';
    const zip = formData.get('zip') || '';

    // Send to Mautic
    try {
        // Track the signup event
        mt('send', 'event', 'signup', {
            email: email,
            source: source,
            tags: [`signup_${source}`, 'website_signup']
        });

        // Get form ID for this source
        const formId = MAUTIC_FORM_IDS[source];

        // If no form ID configured, show error
        if (!formId) {
            console.warn(`No Mautic form ID configured for source: ${source}`);
            showErrorMessage(form, 'Form not configured. Please contact support.');
            return;
        }

        // Create/update contact in Mautic
        const response = await fetch(`https://eblastem.com/form/submit?formId=${formId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'mauticform[email]': email,
                'mauticform[firstname]': firstname,
                'mauticform[zip]': zip,
                'mauticform[source]': source,
                'mauticform[formId]': formId,
                'mauticform[return]': '',
                'mauticform[messenger]': 1
            })
        });

        if (response.ok) {
            // Show success message
            showSuccessMessage(form, source);

            // Track conversion in Mautic
            mt('send', 'conversion', {
                email: email,
                action: 'signup_complete'
            });

            // Reset form
            form.reset();
        } else {
            showErrorMessage(form, 'Something went wrong. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showErrorMessage(form, 'Network error. Please try again.');
    }
}

function showSuccessMessage(form, source) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.style.cssText = `
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
    `;

    const messages = {
        'homepage_inline': 'Thanks for joining! Check your email for next steps.',
        'footer': 'Subscribed! You\'ll hear from us soon.',
        'exit_intent': 'Welcome to the movement! Watch your inbox.',
        'default': 'Success! Thanks for signing up.'
    };

    successDiv.textContent = messages[source] || messages['default'];

    form.parentElement.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showErrorMessage(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.style.cssText = `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
        font-weight: 600;
    `;
    errorDiv.textContent = message;

    form.parentElement.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================
function openSignupModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="signup-modal">
            <h2>Join the Movement to Flip CA-45</h2>
            <p>Get updates, event invitations, and ways to help defend the American Dream.</p>

            <form onsubmit="handleSignup(event, 'modal_signup')">
                <input type="email" name="email" class="form-input" placeholder="Email address" required>
                <input type="text" name="firstname" class="form-input" placeholder="First name" required>
                <input type="text" name="zip" class="form-input" placeholder="ZIP code" required>

                <div style="margin: 1rem 0;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                        <input type="checkbox" name="sms_opt_in">
                        <span>Send me text updates (msg & data rates may apply)</span>
                    </label>
                </div>

                <button type="submit" class="btn btn-primary btn-block">Join Now</button>
            </form>

            <p style="font-size: 0.85rem; color: #6b7280; margin-top: 1rem; text-align: center;">
                By signing up, you agree to receive emails from Amy Phan West for Congress.
                You can unsubscribe at any time.
            </p>
        </div>
    `;

    modal.style.display = 'flex';

    // Track modal open
    mt('send', 'event', 'modal_opened', {
        type: 'signup_modal'
    });
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function playStoryVideo() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="video-modal">
            <button class="modal-close-btn" onclick="closeModal()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 2rem; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">&times;</button>

            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                <iframe
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>

            <div style="padding: 1.5rem; text-align: center;">
                <h3>From Refugee to Fighter</h3>
                <p>After watching Amy's story, join the movement to defend the American Dream.</p>
                <button class="btn btn-primary" onclick="closeModal(); openSignupModal();">
                    Join the Movement
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Track video play
    mt('send', 'event', 'video_play', {
        video: 'amy_story_hero',
        location: 'homepage_hero'
    });
}

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================
const chatbotButton = document.getElementById('chatbotButton');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotMessages = document.getElementById('chatbotMessages');

function toggleChatbot() {
    const isOpen = chatbotWindow.style.display !== 'none';

    if (isOpen) {
        chatbotWindow.style.display = 'none';
    } else {
        chatbotWindow.style.display = 'flex';
        // Track chatbot open
        mt('send', 'event', 'chatbot_opened');
    }
}

async function sendChatMessage(event) {
    event.preventDefault();

    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addChatMessage(message, 'user');

    // Clear input
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Send to AI (Claude API via your backend)
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: 'amy_campaign'
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        // Add bot response
        addChatMessage(data.reply, 'bot');

        // Track conversation in Mautic
        mt('send', 'event', 'chatbot_interaction', {
            user_message: message,
            bot_response: data.reply
        });

        // If response includes a CTA, suggest signup
        if (data.suggestSignup) {
            setTimeout(() => {
                addChatMessage(
                    "Would you like to join our email list to stay updated on Amy's campaign?",
                    'bot',
                    true // Show signup button
                );
            }, 1000);
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addChatMessage(
            "I'm having trouble connecting right now. Please email info@amyphanwest.com for help.",
            'bot'
        );
    }
}

function addChatMessage(text, sender, showSignupButton = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;

    const textP = document.createElement('p');
    textP.textContent = text;
    messageDiv.appendChild(textP);

    if (showSignupButton) {
        const signupBtn = document.createElement('button');
        signupBtn.className = 'btn btn-sm btn-primary';
        signupBtn.textContent = 'Yes, sign me up!';
        signupBtn.style.marginTop = '0.5rem';
        signupBtn.onclick = () => {
            toggleChatbot();
            openSignupModal();
        };
        messageDiv.appendChild(signupBtn);
    }

    chatbotMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot-message typing-indicator';
    typingDiv.innerHTML = '<p>...</p>';
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = chatbotMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ============================================
// SOCIAL SHARING
// ============================================
function shareOnSocial() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("I'm supporting Amy Phan West for Congress CA-45. She fled communism and is fighting to defend the American Dream!");

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        email: `mailto:?subject=Support Amy Phan West for Congress&body=${text}%0A%0A${url}`
    };

    // Show share modal
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="share-modal" style="text-align: center;">
            <h2>Share Amy's Campaign</h2>
            <p>Help spread the word and flip CA-45!</p>

            <div style="display: flex; gap: 1rem; justify-content: center; margin: 2rem 0;">
                <a href="${shareLinks.facebook}" target="_blank" class="btn btn-primary" onclick="trackShare('facebook')">
                    Share on Facebook
                </a>
                <a href="${shareLinks.twitter}" target="_blank" class="btn btn-secondary" onclick="trackShare('twitter')">
                    Share on Twitter
                </a>
                <a href="${shareLinks.email}" class="btn btn-gold" onclick="trackShare('email')">
                    Share via Email
                </a>
            </div>

            <div style="margin-top: 2rem;">
                <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">Or copy link:</p>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" value="${window.location.href}" readonly class="form-input" id="shareUrl" style="flex: 1;">
                    <button class="btn btn-secondary" onclick="copyShareUrl()">Copy</button>
                </div>
            </div>

            <button class="text-link" onclick="closeModal()" style="margin-top: 1.5rem;">Close</button>
        </div>
    `;

    modal.style.display = 'flex';

    // Track share modal open
    mt('send', 'event', 'share_modal_opened');
}

function trackShare(platform) {
    mt('send', 'event', 'social_share', {
        platform: platform,
        page: window.location.pathname
    });
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    input.select();
    document.execCommand('copy');

    // Show copied feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = '#10b981';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);

    mt('send', 'event', 'share_link_copied');
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.value-card, .update-card, .cta-card').forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// PAGE TRACKING
// ============================================
// Track scroll depth
let maxScrollDepth = 0;
let scrollTracked = {
    '25': false,
    '50': false,
    '75': false,
    '100': false
};

window.addEventListener('scroll', () => {
    const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
    }

    // Track milestones
    ['25', '50', '75', '100'].forEach(milestone => {
        if (scrollPercentage >= parseInt(milestone) && !scrollTracked[milestone]) {
            scrollTracked[milestone] = true;
            mt('send', 'event', 'scroll_depth', {
                depth: milestone + '%',
                page: window.location.pathname
            });
        }
    });
});

// Track time on page
let timeOnPage = 0;
const timeTracked = {
    '30': false,
    '60': false,
    '120': false,
    '300': false
};

setInterval(() => {
    timeOnPage += 10;

    ['30', '60', '120', '300'].forEach(milestone => {
        if (timeOnPage >= parseInt(milestone) && !timeTracked[milestone]) {
            timeTracked[milestone] = true;
            mt('send', 'event', 'time_on_page', {
                seconds: milestone,
                page: window.location.pathname
            });
        }
    });
}, 10000); // Check every 10 seconds

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(Math.round(target));
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.round(current));
        }
    }, 16);
}

// Animate vote counter on homepage
document.addEventListener('DOMContentLoaded', () => {
    const voteCounter = document.getElementById('voteCounter');
    if (voteCounter) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(voteCounter, 613);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(voteCounter);
    }
});

// ============================================
// FORM VALIDATION
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateZip(zip) {
    const re = /^\d{5}(-\d{4})?$/;
    return re.test(zip);
}

function validatePhone(phone) {
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return re.test(phone);
}

// Add real-time validation to forms
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ef4444';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '';
                removeFieldError(this);
            }
        });
    });

    document.querySelectorAll('input[name="zip"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateZip(this.value)) {
                this.style.borderColor = '#ef4444';
                showFieldError(this, 'Please enter a valid ZIP code');
            } else {
                this.style.borderColor = '';
                removeFieldError(this);
            }
        });
    });
});

function showFieldError(input, message) {
    removeFieldError(input);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 0.25rem;';
    errorDiv.textContent = message;

    input.parentElement.appendChild(errorDiv);
}

function removeFieldError(input) {
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// ============================================
// CONSOLE MESSAGE (Easter Egg)
// ============================================
console.log(`
%c🇺🇸 AMY PHAN WEST FOR CONGRESS 🇺🇸
%cFrom fleeing communism to fighting for the American Dream.

Want to help build this campaign?
We're always looking for developers, designers, and volunteers.

Email: tech@amyphanwest.com

%c"I stood alone because somebody had to tell the truth." - Amy Phan West
`, 'font-size: 20px; font-weight: bold; color: #C8102E;', 'font-size: 14px; color: #3657A6;', 'font-size: 12px; font-style: italic; color: #666;');
