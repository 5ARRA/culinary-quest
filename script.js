// --- Вспомогательные функции для работы с локальным хранилищем ---
function saveGameData(data) {
    localStorage.setItem('gameProgress', JSON.stringify(data));
}

function loadGameData() {
    const data = localStorage.getItem('gameProgress');
    return data ? JSON.parse(data) : {
        currentLevel: 1, // Начинаем с уровня 1, а не 0
        totalPoints: 0,
        completedDays: [], // [{level: 1, dish: "Блюдо 1", correct: true}]
        currentQuestionAnswer: null, // Для хранения правильного ответа текущего вопроса
        selectedDishForCurrentDay: null // Для сохранения выбранного блюда перед вопросом
    };
}

let gameData = loadGameData(); // Загружаем данные при старте скрипта

const TOTAL_LEVELS = 30;
const POINTS_PER_CORRECT_ANSWER = 100;

// --- Данные для каждого уровня (пока что тестовые) ---
// В реальном проекте, это был бы большой массив объектов с данными для каждого дня
// [{
//   dishes: [{name: "Овсянка", desc: "Легкий завтрак"}, {name: "Яичница", desc: "Сытный завтрак"}],
//   question: {text: "Наш любимый фильм?", options: ["А", "Б", "В"], correct: "Б"},
// }, ...]
const levelData = Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
    dishes: [
        { name: `Блюдо ${i + 1}.1 (День ${i + 1})`, desc: `Описание тестового блюда ${i + 1}.1` },
        { name: `Блюдо ${i + 1}.2 (День ${i + 1})`, desc: `Описание тестового блюда ${i + 1}.2` }
    ],
    question: {
        text: `Это тестовый вопрос для Дня ${i + 1}. Что-то из наших воспоминаний? (Правильный ответ: Вариант Б)`,
        options: ['Вариант А', 'Вариант Б', 'Вариант В'],
        correctAnswer: 'Вариант Б'
    }
}));


// --- Логика для index.html (Календарь) ---
if (document.getElementById('calendarGrid')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderCalendar();
        updateMainPageUI();

        document.getElementById('achievementsButton').addEventListener('click', () => {
            window.location.href = 'achievements.html';
        });

        document.getElementById('secretGiftButton').addEventListener('click', () => {
            alert(`Поздравляем! Ты набрала ${gameData.totalPoints} очков! Теперь ты можешь получить свой секретный подарок!`);
            // Здесь можно перенаправить на страницу с подарком или показать модальное окно
            // window.location.href = 'secret_gift.html';
        });

        // Показываем кнопку подарка, если все уровни пройдены
        if (gameData.currentLevel > TOTAL_LEVELS) {
            document.getElementById('secretGiftButton').style.display = 'block';
        }
    });

    function renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = ''; // Очищаем, чтобы перерисовать

        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const dayCard = document.createElement('div');
            dayCard.classList.add('calendar-day-card');
            dayCard.dataset.level = i;

            const dayNumber = document.createElement('span');
            dayNumber.textContent = `День ${i}`;
            dayCard.appendChild(dayNumber);

            // Определяем состояние дня
            if (i < gameData.currentLevel) {
                dayCard.classList.add('completed');
                // Проверяем, был ли ответ правильным для этого дня
                const completedDayData = gameData.completedDays.find(d => d.level === i);
                if (completedDayData && completedDayData.correctAnswer) {
                    dayCard.classList.add('correct-answer');
                }
            } else if (i === gameData.currentLevel) {
                dayCard.classList.add('active');
                dayCard.addEventListener('click', () => {
                    // Сохраняем текущий уровень перед переходом, чтобы level.html знал, что брать
                    saveGameData(gameData); // Убедимся, что gameData актуальны
                    window.location.href = 'level.html';
                });
            } else {
                dayCard.classList.add('locked');
                dayCard.style.cursor = 'not-allowed'; // Уточняем, что не кликабельно
            }
            calendarGrid.appendChild(dayCard);
        }
    }

    function updateMainPageUI() {
        document.getElementById('currentPointsDisplay').textContent = gameData.totalPoints;
        // Прогресс-бар здесь уже не нужен, так как есть календарь
    }
}

// --- Логика для level.html ---
if (document.getElementById('levelTitle')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Если мы на level.html, а currentLevel больше TOTAL_LEVELS (игра окончена)
        // или если currentLevel не установлен (попали сюда случайно), перенаправляем на главную.
        if (gameData.currentLevel > TOTAL_LEVELS || gameData.currentLevel === 0) {
            window.location.href = 'index.html';
            return;
        }

        const currentLevelIndex = gameData.currentLevel - 1; // Индекс в массиве levelData
        const currentLevelContent = levelData[currentLevelIndex];

        document.getElementById('levelTitle').textContent = `День ${gameData.currentLevel}: Выбери Блюдо`;

        // Заполняем информацию о блюдах
        document.querySelectorAll('.dish-card h3')[0].textContent = currentLevelContent.dishes[0].name;
        document.querySelectorAll('.dish-card p')[0].textContent = currentLevelContent.dishes[0].desc;
        document.querySelectorAll('.dish-card h3')[1].textContent = currentLevelContent.dishes[1].name;
        document.querySelectorAll('.dish-card p')[1].textContent = currentLevelContent.dishes[1].desc;

        // Заполняем вопрос и варианты ответов
        document.getElementById('questionText').textContent = currentLevelContent.question.text;
        document.getElementById('optionA').value = currentLevelContent.question.options[0];
        document.querySelector('label[for="optionA"]').textContent = currentLevelContent.question.options[0];
        document.getElementById('optionB').value = currentLevelContent.question.options[1];
        document.querySelector('label[for="optionB"]').textContent = currentLevelContent.question.options[1];
        document.getElementById('optionC').value = currentLevelContent.question.options[2];
        document.querySelector('label[for="optionC"]').textContent = currentLevelContent.question.options[2];

        // Сохраняем правильный ответ и выбранное блюдо временно
        gameData.currentQuestionAnswer = currentLevelContent.question.correctAnswer;
        saveGameData(gameData); // Обновляем gameData в localStorage

        // Обработка выбора блюда
        document.querySelectorAll('.select-dish-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const selectedDishIndex = event.target.dataset.dish;
                const selectedDishName = document.querySelectorAll('.dish-card h3')[selectedDishIndex - 1].textContent;

                // Скрываем выбор блюд и показываем вопрос
                document.querySelector('.dish-selection').style.display = 'none';
                document.querySelector('.question-section').style.display = 'block';

                gameData.selectedDishForCurrentDay = selectedDishName; // Сохраняем выбранное блюдо
                saveGameData(gameData);
            });
        });

        // Обработка ответа на вопрос
        document.getElementById('submitAnswer').addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            const feedbackText = document.getElementById('feedbackText');
            let isCorrect = false;

            if (selectedOption) {
                if (selectedOption.value === gameData.currentQuestionAnswer) {
                    feedbackText.textContent = `Правильно! Ты получаешь ${POINTS_PER_CORRECT_ANSWER} очков!`;
                    gameData.totalPoints += POINTS_PER_CORRECT_ANSWER;
                    isCorrect = true;
                } else {
                    feedbackText.textContent = `Неверно. Правильный ответ был: "${gameData.currentQuestionAnswer}". Но блюдо всё равно будет приготовлено!`;
                    isCorrect = false;
                }
            } else {
                feedbackText.textContent = "Пожалуйста, выбери вариант ответа.";
                return; // Не продолжаем, пока не выбран ответ
            }

            feedbackText.style.display = 'block';
            document.getElementById('submitAnswer').disabled = true; // Отключаем кнопку, чтобы не нажимали повторно

            // Добавляем запись о пройденном дне в историю
            gameData.completedDays.push({
                level: gameData.currentLevel,
                dish: gameData.selectedDishForCurrentDay,
                correctAnswer: isCorrect
            });

            // Очищаем временные данные
            gameData.currentQuestionAnswer = null;
            gameData.selectedDishForCurrentDay = null;

            saveGameData(gameData);

            // Переход к следующему уровню или на главную страницу через 3 секунды
            setTimeout(() => {
                gameData.currentLevel++; // Переходим к следующему дню
                saveGameData(gameData);
                window.location.href = 'index.html'; // Всегда возвращаемся в календарь
            }, 3000); // Задержка в 3 секунды
        });
    });
}


// --- Логика для achievements.html ---
if (document.getElementById('achievementsLevelDisplay')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Уровень отображаем как пройденные дни
        document.getElementById('achievementsLevelDisplay').textContent = Math.min(gameData.currentLevel -1, TOTAL_LEVELS);
        document.getElementById('achievementsPointsDisplay').textContent = gameData.totalPoints;

        const list = document.getElementById('completedDishesList');
        if (gameData.completedDays.length === 0) {
            list.innerHTML = '<li>Пока что нет пройденных дней.</li>';
        } else {
            list.innerHTML = ''; // Очищаем список перед заполнением
            gameData.completedDays.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `День ${item.level}: ${item.dish} (Ответ: ${item.correctAnswer ? 'Правильно, +100 очков' : 'Неправильно'})`;
                list.appendChild(li);
            });
        }
    });
}