// Bot Messages
export const BOT_MESSAGES = {
  WELCOME: `Welcome to Delicious Bites Restaurant! 🍽️

I'm here to help you place your order. Please select an option:`,

  MAIN_OPTIONS: `
Select 1 to Place an order
Select 99 to Checkout order
Select 98 to See order history
Select 97 to See current order
Select 0 to Cancel order`,

  MENU_HEADER: `Here's our menu. Select an item number to add it to your order:`,

  ITEM_ADDED: (itemName: string, quantity: number) =>
    `Added ${quantity}x ${itemName} to your order.

Select another item number to add more, or:
Select 99 to Checkout
Select 97 to See current order
Select 0 to Cancel order`,

  NO_CURRENT_ORDER: `You don't have any items in your current order.

Select 1 to Place an order`,

  CURRENT_ORDER: (items: string, total: number) =>
    `Your current order:
${items}

Total: ₦${total.toLocaleString()}

Select 1 to Add more items
Select 99 to Checkout
Select 0 to Cancel order`,

  CHECKOUT_SUCCESS: (total: number) =>
    `Order placed successfully! 🎉

Total Amount: ₦${total.toLocaleString()}

Please proceed to pay for your order.`,

  NO_ORDER_TO_PLACE: `No order to place. Your cart is empty.

Select 1 to Place an order`,

  ORDER_CANCELLED: `Your order has been cancelled.

Select 1 to Place a new order`,

  NO_ORDER_TO_CANCEL: `You don't have any order to cancel.

Select 1 to Place an order`,

  ORDER_HISTORY_HEADER: `Your order history:`,

  NO_ORDER_HISTORY: `You haven't placed any orders yet.

Select 1 to Place an order`,

  PAYMENT_SUCCESS: `Payment successful! 🎉 Thank you for your order.

Your order is being prepared.

Select 1 to Place a new order`,

  PAYMENT_FAILED: `Payment could not be verified. Please try again or contact support.

Select 99 to Try checkout again
Select 1 to Place a new order`,

  INVALID_OPTION: `Invalid option. Please select a valid option from the menu.`,

  INVALID_MENU_ITEM: `Invalid item number. Please select a valid item from the menu.`,

  SCHEDULING_PROMPT: `Would you like to schedule this order for later?

Select 1 for Yes, schedule for later
Select 2 for No, prepare now`,

  SCHEDULE_TIME_PROMPT: `Please enter the date and time for your order (e.g., "2024-12-25 14:30" or "tomorrow 2pm"):`,

  ORDER_SCHEDULED: (date: string) =>
    `Your order has been scheduled for ${date}.

Select 1 to Place another order`,

  ERROR: `Something went wrong. Please try again.

Select 1 to Place an order`,
};

// Menu Categories
export const MENU_CATEGORIES = {
  MAIN_COURSE: 'Main Course',
  SIDES: 'Sides',
  DRINKS: 'Drinks',
  DESSERTS: 'Desserts',
};

// Main Menu Options
export const MAIN_MENU_OPTIONS = {
  PLACE_ORDER: '1',
  CHECKOUT: '99',
  ORDER_HISTORY: '98',
  CURRENT_ORDER: '97',
  CANCEL_ORDER: '0',
};

// Ordering State Options
export const ORDERING_OPTIONS = {
  CHECKOUT: '99',
  CURRENT_ORDER: '97',
  CANCEL: '0',
};

// Scheduling Options
export const SCHEDULING_OPTIONS = {
  YES: '1',
  NO: '2',
};
