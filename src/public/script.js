// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const paymentSection = document.getElementById('paymentSection');
const payBtn = document.getElementById('payBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeModal = document.getElementById('closeModal');
const quickOptions = document.getElementById('quickOptions');
const toast = document.getElementById('toast');

// State
let isLoading = false;
let paystackPublicKey = '';

// Initialize chat
async function initChat() {
  showLoading();

  try {
    // Fetch Paystack public key
    const keyResponse = await fetch('/api/payment/public-key');
    const keyData = await keyResponse.json();
    if (keyData.success) {
      paystackPublicKey = keyData.data.publicKey;
    }

    // Initialize chat session
    const response = await fetch('/api/chat/init');
    const data = await response.json();

    if (data.success) {
      addMessage(data.data.message, 'bot');
    } else {
      addMessage('Failed to initialize chat. Please refresh the page.', 'bot');
    }
  } catch (error) {
    console.error('Init error:', error);
    addMessage('Connection error. Please check your internet and refresh.', 'bot');
  } finally {
    hideLoading();
  }

  // Check for payment callback
  checkPaymentCallback();
}

// Check URL for payment callback status
function checkPaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  if (paymentStatus === 'success') {
    showToast('Payment successful! Your order has been confirmed.', 'success');
    // Clean URL
    window.history.replaceState({}, document.title, '/');
    // Refresh chat to show updated state
    setTimeout(() => {
      sendMessage('1'); // Show menu for new order
    }, 1500);
  } else if (paymentStatus === 'failed') {
    showToast('Payment failed. Please try again.', 'error');
    window.history.replaceState({}, document.title, '/');
  } else if (paymentStatus === 'error') {
    showToast('Payment error occurred. Please contact support.', 'error');
    window.history.replaceState({}, document.title, '/');
  }
}

// Send message to server
async function sendMessage(message) {
  if (isLoading || !message.trim()) return;

  // Add user message to chat
  addMessage(message, 'user');
  messageInput.value = '';

  showLoading();

  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
    });

    const data = await response.json();

    if (data.success) {
      addMessage(data.data.message, 'bot');

      // Show/hide payment button based on response
      if (data.data.showPayButton) {
        showPaymentButton();
      } else {
        hidePaymentButton();
      }
    } else {
      addMessage(data.error || 'Something went wrong. Please try again.', 'bot');
    }
  } catch (error) {
    console.error('Send error:', error);
    addMessage('Connection error. Please check your internet connection.', 'bot');
  } finally {
    hideLoading();
  }
}

// Add message to chat
function addMessage(content, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = formatTime(new Date());

  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);

  // Insert before loading indicator
  chatMessages.insertBefore(messageDiv, loadingIndicator);

  // Scroll to bottom
  scrollToBottom();
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loading indicator
function showLoading() {
  isLoading = true;
  loadingIndicator.classList.add('visible');
  sendBtn.disabled = true;
  scrollToBottom();
}

// Hide loading indicator
function hideLoading() {
  isLoading = false;
  loadingIndicator.classList.remove('visible');
  sendBtn.disabled = false;
  messageInput.focus();
}

// Show payment button
function showPaymentButton() {
  paymentSection.classList.remove('hidden');
}

// Hide payment button
function hidePaymentButton() {
  paymentSection.classList.add('hidden');
}

// Initialize Paystack payment
async function initializePayment() {
  showLoading();

  try {
    const response = await fetch('/api/payment/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (data.success && data.data.paymentUrl) {
      // Redirect to Paystack
      window.location.href = data.data.paymentUrl;
    } else {
      showToast(data.error || 'Failed to initialize payment', 'error');
      addMessage(data.error || 'Failed to initialize payment. Please try again.', 'bot');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showToast('Payment error occurred', 'error');
    addMessage('Payment error. Please try again.', 'bot');
  } finally {
    hideLoading();
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast visible ${type}`;

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

// Event Listeners
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    sendMessage(message);
  }
});

// Quick option buttons
quickOptions.addEventListener('click', (e) => {
  if (e.target.classList.contains('quick-btn')) {
    const value = e.target.dataset.value;
    if (value) {
      sendMessage(value);
    }
  }
});

// Pay button
payBtn.addEventListener('click', () => {
  initializePayment();
});

// Help modal
helpBtn.addEventListener('click', () => {
  helpModal.classList.add('visible');
});

closeModal.addEventListener('click', () => {
  helpModal.classList.remove('visible');
});

helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.classList.remove('visible');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && helpModal.classList.contains('visible')) {
    helpModal.classList.remove('visible');
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initChat);
