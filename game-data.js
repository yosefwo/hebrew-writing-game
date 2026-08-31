const letters = [...'אבגדהוזחטיכלמנסעפצקרשת'];

const categories = {
  all: '🛒 הכול',
  fruits: '🍎 פירות',
  vegetables: '🥕 ירקות',
  dairy: '🥛 מוצרי חלב',
  sweets: '🍫 ממתקים',
  bakery: '🥖 מאפים'
};

const foods = [
  ['תפוח', '🍎', 'fruits'], ['בננה', '🍌', 'fruits'],
  ['תפוז', '🍊', 'fruits'], ['ענבים', '🍇', 'fruits'],
  ['גזר', '🥕', 'vegetables'], ['עגבנייה', '🍅', 'vegetables'],
  ['מלפפון', '🥒', 'vegetables'], ['תירס', '🌽', 'vegetables'],
  ['חלב', '🥛', 'dairy'], ['גבינה', '🧀', 'dairy'],
  ['יוגורט', '🥣', 'dairy'], ['חמאה', '🧈', 'dairy'],
  ['שוקולד', '🍫', 'sweets'], ['סוכרייה', '🍬', 'sweets'],
  ['עוגייה', '🍪', 'sweets'], ['לחם', '🍞', 'bakery'],
  ['פיתה', '🫓', 'bakery'], ['בייגלה', '🥨', 'bakery']
].map(([name, emoji, category]) => ({ name, emoji, category }));

const countItems = [
  ['🐶', 'כלבים'], ['🐱', 'חתולים'], ['🐰', 'ארנבים'],
  ['🍎', 'תפוחים'], ['🍌', 'בננות'], ['🍓', 'תותים']
];
