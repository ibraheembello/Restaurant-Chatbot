import { MenuItem } from '../models';
import { IMenuItem } from '../types';
import { MENU_CATEGORIES } from '../utils/constants';

export class MenuService {
  /**
   * Get all available menu items
   */
  async getAllItems(): Promise<IMenuItem[]> {
    return MenuItem.find({ available: true }).sort({ category: 1, itemNumber: 1 });
  }

  /**
   * Get menu item by item number
   */
  async getItemByNumber(itemNumber: number): Promise<IMenuItem | null> {
    return MenuItem.findOne({ itemNumber, available: true });
  }

  /**
   * Format menu for display
   */
  async getFormattedMenu(): Promise<string> {
    const items = await this.getAllItems();

    if (items.length === 0) {
      return 'Sorry, no items are available at the moment.';
    }

    // Group items by category
    const groupedItems: { [key: string]: IMenuItem[] } = {};

    items.forEach((item) => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    // Format the menu
    let menuText = '';

    // Define category order
    const categoryOrder = [
      MENU_CATEGORIES.MAIN_COURSE,
      MENU_CATEGORIES.SIDES,
      MENU_CATEGORIES.DRINKS,
      MENU_CATEGORIES.DESSERTS,
    ];

    categoryOrder.forEach((category) => {
      if (groupedItems[category] && groupedItems[category].length > 0) {
        menuText += `\n📌 ${category.toUpperCase()}\n`;
        menuText += '─'.repeat(25) + '\n';

        groupedItems[category].forEach((item) => {
          menuText += `${item.itemNumber}. ${item.name} - ₦${item.price.toLocaleString()}\n`;
          menuText += `   ${item.description}\n\n`;
        });
      }
    });

    return menuText;
  }

  /**
   * Check if item number is valid
   */
  async isValidItemNumber(itemNumber: number): Promise<boolean> {
    const item = await MenuItem.findOne({ itemNumber, available: true });
    return item !== null;
  }

  /**
   * Get item count
   */
  async getItemCount(): Promise<number> {
    return MenuItem.countDocuments({ available: true });
  }
}

export const menuService = new MenuService();
