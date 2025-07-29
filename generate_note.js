const fs = require('fs');
const path = require('path');

// Получение текущей даты
//const now = new Date();
const now = new Date("2025-08-01");
const year = now.getFullYear();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const currentDate = new Date(year, now.getMonth(), now.getDate());

// Генерация имени файла
const filename = `${year}_${month}.md`;
const filePath = path.join(__dirname, filename);

// Загрузка событий
const eventsPath = path.join(__dirname, 'events.json');
let events = { monthly: [], yearly: [], daily: [] };

if (fs.existsSync(eventsPath)) {
  try {
    events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  } catch (e) {
    console.error('Ошибка чтения events.json:', e.message);
  }
}

// Получение дней в месяце
const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

// Генерация содержимого
let content = "";

// Массив сокращений дней недели (0:Вс, 1:Пн, ... 6:Сб)
const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Функция для форматирования напоминания
const formatReminder = (event, dateStr) => {
  if (!event.reminder) return "";
  
  // Если указана полная дата-время
  if (event.reminder.includes(' ')) {
    return ` (@${event.reminder})`;
  }
  
  // Если указано только время
  return ` (@${dateStr} ${event.reminder})`;
};

for (let day = 1; day <= daysInMonth; day++) {
  const formattedDay = day.toString().padStart(2, '0');
  const dateStr = `${year}-${month}-${formattedDay}`;
  const dateObj = new Date(dateStr);

  const dayOfWeek = dateObj.getDay(); // Возвращает 0-6 (воскресенье-суббота)
  
  content += `#### ${formattedDay}.${month}.${year} (${weekDays[dayOfWeek]})\n`;
  
  // Добавление событий
  const dayEvents = [];
  
  // Ежедневные события
  events.daily.forEach(event => {
    const reminder = formatReminder(event, dateStr);
    dayEvents.push(`- [ ] ${event.title}${reminder}`);
  });
  
  // Ежемесячные события
  events.monthly.forEach(event => {
    if (event.day === day) {
      const eventDate = `${year}-${month}-${event.day.toString().padStart(2, '0')}`;
      const reminder = formatReminder(event, eventDate);
      dayEvents.push(`- [ ] ${event.title}${reminder}`);
    }
  });
  
  // Годовые события
  events.yearly.forEach(event => {
    if (event.date === dateStr) {
      const reminder = formatReminder(event, event.date);
      dayEvents.push(`- [ ] ${event.title}${reminder}`);
    }
  });
  
  // Добавление в контент
  if (dayEvents.length > 0) {
    content += dayEvents.join('\n') + '\n\n***\n';
  }
  
}

// Создание файла
fs.writeFile(filePath, content, (err) => {
  if (err) {
    console.error('Ошибка создания файла:', err);
    return;
  }
});