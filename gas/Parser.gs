/**
 * Parser - 自然語言記帳訊息解析服務
 *
 * 支援格式：
 * - "午餐 200" → 自動猜測分類
 * - "咖啡 80 飲料" → 指定小分類
 * - "捷運 30 交通" → 指定大分類
 */
const Parser = {

  /**
   * 解析記帳訊息
   * @param {string} text - 使用者輸入的文字
   * @returns {Object} 解析結果（包含金額、分類、備註等）
   */
  parse(text) {
    // 移除多餘空白
    text = text.trim();

    // 正則表達式：[項目名稱] [金額] [可選分類]
    const pattern = /^(.+?)\s+(\d+)(?:\s+(.+))?$/;
    const match = text.match(pattern);

    if (!match) {
      return {
        error: '格式錯誤，請使用：項目 金額 [分類]\n例如：午餐 200 或 捷運 30 交通'
      };
    }

    const [, itemName, amount, categoryHint] = match;

    // 取得配置（分類對照表）
    const config = SheetService.getConfig();

    // 智能分類匹配
    let category = '其他';
    let subcategory = itemName;

    if (categoryHint) {
      // 使用者提供了分類提示
      const matched = this.matchCategory(categoryHint, config.categories);

      if (matched) {
        category = matched.category;
        subcategory = matched.subcategory || itemName;
      }
    } else {
      // 根據項目名稱猜測分類
      const guessed = this.guessCategory(itemName, config.categories);

      if (guessed) {
        category = guessed.category;
        subcategory = guessed.subcategory || itemName;
      }
    }

    return {
      amount: parseInt(amount),
      category,
      subcategory,
      note: itemName,
      currency: 'TWD'
    };
  },


  /**
   * 中文別名對照表（讓使用者可以用中文輸入分類）
   */
  categoryAliases: {
    '食物': 'Food-Dining',
    '飲食': 'Food-Dining',
    '交通': 'Transport',
    '娛樂': 'Wellness',
    '健康': 'Wellness',
    '生活': 'Household',
    '家用': 'Household',
    '購物': 'Shopping',
    '房租': 'Housing-Utils',
    '水電': 'Housing-Utils',
    '酒': 'Alcohol',
    '旅遊': 'Travel',
    '其他': 'Other'
  },

  /**
   * 匹配分類（精確比對，支援中英文）
   * @param {string} hint - 分類提示
   * @param {Object} categories - 分類對照表
   * @returns {Object|null} 匹配結果
   */
  matchCategory(hint, categories) {
    // 先檢查是否為中文別名，如果是則轉換為英文
    const normalizedHint = this.categoryAliases[hint] || hint;

    // 完全匹配大分類
    if (categories[normalizedHint]) {
      return {
        category: normalizedHint,
        subcategory: null
      };
    }

    // 匹配小分類
    for (const [cat, subs] of Object.entries(categories)) {
      if (subs.includes(normalizedHint)) {
        return {
          category: cat,
          subcategory: normalizedHint
        };
      }
    }

    return null;
  },


  /**
   * 猜測分類（關鍵字比對）
   * @param {string} itemName - 項目名稱
   * @param {Object} categories - 分類對照表
   * @returns {Object|null} 猜測結果
   */
  guessCategory(itemName, categories) {
    // 關鍵字對照表（使用 Config 分頁的英文分類名稱）
    const keywords = {
      'Food-Dining': ['餐', '飯', '麵', '麵包', '咖啡', '茶', '飲料', '便當', '小吃', '早餐', '午餐', '晚餐', '吃', '食'],
      'Transport': ['捷運', '公車', '油', '停車', '計程車', 'Uber', '高鐵', '台鐵', '加油', '交通'],
      'Wellness': ['電影', '遊戲', 'KTV', '唱歌', '健身', '運動', '娛樂'],
      'Household': ['日用品', '清潔', '水電', '房租', '生活', '家用'],
      'Shopping': ['衣服', '鞋子', '書', '購物'],
      'Housing-Utils': ['租金', '水費', '電費', '瓦斯', '網路'],
      'Alcohol': ['酒', '啤酒', '紅酒', '威士忌'],
      'Travel': ['旅遊', '機票', '住宿', '飯店'],
      'Other': ['其他']
    };

    for (const [cat, words] of Object.entries(keywords)) {
      // 檢查是否包含關鍵字
      if (words.some(w => itemName.includes(w))) {
        // 找到匹配的大分類，嘗試匹配小分類
        const subs = categories[cat] || [];
        const matchedSub = subs.find(s => itemName.includes(s));

        return {
          category: cat,
          subcategory: matchedSub || null
        };
      }
    }

    return null;
  }
};