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

// --- Данные для каждого уровня ---
const levelData = [
    // УРОВЕНЬ 1 (День 1)
    {
        dishes: [
            { name: "Сэндвич с омлетом, жареной колбаской, сыром и помидорами", desc: "Утренний шедевр, который задаст тон всему дню!" },
            { name: "Бургер почти как в Маке", desc: "Классика, которую так просто и приятно приготовить дома. Сочный и аппетитный!" }
        ],
        question: {
            text: "В каком классе я впервые приготовил тебе еду?",
            options: ["В 9 классе", "В 10 классе", "В 11 классе"],
            correctAnswer: "В 10 классе",
            inputType: 'radio' // Тип ввода: радио-кнопки
        }
    },
    // УРОВЕНЬ 2 (День 2) - С ВВОДОМ ТЕКСТА
    {
        dishes: [
            { name: "Пирог с курицей", desc: "Аппетитный домашний пирог с нежным куриным филе – идеально для обеда или ужина." },
            { name: "Пицца", desc: "Выбери любую начинку, и я сделаю её сам(а) для тебя! Классический вкус любимой пиццы." }
        ],
        question: {
            text: "Какой первый фильм мы смотрели впервые ?",
            correctAnswer: "аватар 3", // Точный ответ для сравнения
            inputType: 'text' // Тип ввода: текстовое поле
        }
    },
    // УРОВЕНЬ 3 (День 3) - С ВЫБОРОМ ИЗ ВАРИАНТОВ
    {
        dishes: [
            { name: "Паста Болоньезе (моя версия)", desc: "Классическая паста с насыщенным мясным соусом, как ты любишь!" },
            { name: "Паста Альфредо (постараюсь)", desc: "Нежная паста в сливочном соусе, которую я приготовлю специально для тебя!" }
        ],
        question: {
            text: "Когда впервые мы пошли на свидание?",
            options: ["6 января", "5 января", "31 декабря"],
            correctAnswer: "6 января",
            inputType: 'radio' // Тип ввода: радио-кнопки
        }
    },
    // ... и так далее до 30 уровней.
    // Автоматическое заполнение тестовыми данными, если реальных дней меньше 30.
];

// Чтобы массив содержал 30 элементов, добавим остальные тестовые, если их меньше 30.
// Убедитесь, что эта часть кода остается в конце, чтобы дополнять массив.
while (levelData.length < TOTAL_LEVELS) {
    let i = levelData.length;
    levelData.push({
        dishes: [
            { name: `Тестовое Блюдо ${i + 1}.1`, desc: `Описание тестового блюда ${i + 1}.1` },
            { name: `Тестовое Блюдо ${i + 1}.2`, desc: `Описание тестового блюда ${i + 1}.2` }
        ],
        question: {
            text: `Это тестовый вопрос для Дня ${i + 1}. Что-то из наших воспоминаний? (Правильный ответ: Вариант Б)`,
            options: ['Вариант А', 'Вариант Б', 'Вариант В'],
            correctAnswer: 'Вариант Б',
            inputType: 'radio' // По умолчанию для тестовых вопросов - радио-кнопки
        }
    });
}


// --- Функции для управления отображением секций ---
function showSection(sectionId) {
    document.querySelectorAll('.game-section').forEach(section => {
        section.style.display = 'none'; // Скрываем все секции
    });
    document.getElementById(sectionId).style.display = 'block'; // Показываем нужную

    // Показываем/скрываем кнопку "Главный Экран"
    // 'achievementsSection' добавлен сюда, если мы создадим такую секцию в index.html
    if (sectionId === 'mainMenu' || sectionId === 'rulesSection' || sectionId === 'prizesShopSection' || sectionId === 'achievementsSection') {
        document.getElementById('homeButton').style.display = 'none'; // Скрываем на главном меню и подразделах
    } else {
        document.getElementById('homeButton').style.display = 'block'; // Показываем на игровых секциях (календарь)
    }
    // Обновляем отображение очков (если нужно)
    updatePointsDisplay();
}

function updatePointsDisplay() {
    const pointsDisplay = document.getElementById('currentPointsDisplay');
    if (pointsDisplay) {
        pointsDisplay.textContent = gameData.totalPoints;
    }
    const shopPointsDisplay = document.getElementById('shopPointsDisplay');
    if (shopPointsDisplay) {
        shopPointsDisplay.textContent = gameData.totalPoints;
    }
}


// --- Логика для index.html (Главное меню и Календарь) ---
if (document.getElementById('mainMenu')) { // Проверяем, что мы на index.html
    document.addEventListener('DOMContentLoaded', () => {
        updatePointsDisplay(); // Обновляем очки при загрузке
        showSection('mainMenu'); // Показываем главное меню по умолчанию

        // Обработчики кнопок главного меню
        document.getElementById('startGameButton').addEventListener('click', () => {
            showSection('calendarSection');
            renderCalendar(); // Отрисовываем календарь при переходе
        });
        document.getElementById('rulesButton').addEventListener('click', () => {
            showSection('rulesSection');
        });
        document.getElementById('prizesShopButton').addEventListener('click', () => {
            showSection('prizesShopSection');
            updatePointsDisplay(); // Обновить очки в магазине
        });

        // Обработчики для кнопок "Назад в Меню"
        document.querySelectorAll('.backToMenuButton').forEach(button => {
            button.addEventListener('click', () => {
                showSection('mainMenu');
            });
        });
        // Обработчик для глобальной кнопки "Главный Экран"
        document.getElementById('homeButton').addEventListener('click', () => {
            showSection('mainMenu');
        });

        // Показываем кнопку подарка, если все уровни пройдены
        if (gameData.currentLevel > TOTAL_LEVELS) {
            document.getElementById('secretGiftButton').style.display = 'block';
        } else {
            document.getElementById('secretGiftButton').style.display = 'none';
        }

        document.getElementById('secretGiftButton').addEventListener('click', () => {
            alert(`Поздравляем! Ты набрала ${gameData.totalPoints} очков! Теперь ты можешь получить свой секретный подарок!`);
            // Здесь можно перенаправить на страницу с подарком или показать модальное окно
            // window.location.href = 'secret_gift.html';
        });

        // Обработчик для кнопки сброса прогресса
        document.getElementById('resetGameButton').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие необратимо!')) {
                localStorage.removeItem('gameProgress'); // Удаляем данные из локального хранилища
                gameData = loadGameData(); // Загружаем начальные данные
                updatePointsDisplay(); // Обновляем отображение очков
                renderCalendar(); // Перерисовываем календарь, если он открыт
                showSection('mainMenu'); // Возвращаемся в главное меню
                document.getElementById('secretGiftButton').style.display = 'none'; // Скрываем кнопку подарка
                alert('Прогресс игры сброшен!');
            }
        });
    }); // Конец DOMContentLoaded для index.html

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
                const completedDayData = gameData.completedDays && gameData.completedDays.find(d => d.level === i);
                if (completedDayData && completedDayData.correctAnswer) {
                    dayCard.classList.add('correct-answer');
                }
                // СДЕЛАТЬ ПРОЙДЕННЫЕ ДНИ КЛИКАБЕЛЬНЫМИ ДЛЯ ПРОСМОТРА
                dayCard.addEventListener('click', () => {
                    window.location.href = `level.html?day=${i}&mode=review`; // Передаем номер дня и режим "review"
                });
            } else if (i === gameData.currentLevel) {
                dayCard.classList.add('active');
                dayCard.addEventListener('click', () => {
                    // Сохраняем текущий уровень перед переходом, чтобы level.html знал, что брать
                    saveGameData(gameData); // Убедимся, что gameData актуальны
                    window.location.href = `level.html?day=${i}&mode=play`; // Передаем номер дня и режим "play"
                });
            } else {
                dayCard.classList.add('locked');
                dayCard.style.cursor = 'not-allowed'; // Уточняем, что не кликабельно
            }
            calendarGrid.appendChild(dayCard);
        }
    }
}

// --- Логика для level.html ---
if (document.getElementById('levelTitle')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Получаем параметры из URL (например, ?day=5&mode=review)
        const urlParams = new URLSearchParams(window.location.search);
        const requestedLevel = parseInt(urlParams.get('day'));
        const mode = urlParams.get('mode'); // 'play' или 'review'

        // Проверяем валидность запрошенного уровня
        if (isNaN(requestedLevel) || requestedLevel < 1 || requestedLevel > TOTAL_LEVELS) {
            window.location.href = 'index.html'; // Если некорректный день, возвращаем на главную
            return;
        }

        const currentLevelIndex = requestedLevel - 1; // Индекс в массиве levelData
        const currentLevelContent = levelData[currentLevelIndex];

        // Определяем, можно ли играть (play) или только просматривать (review)
        let isPlayMode = (mode === 'play' && requestedLevel === gameData.currentLevel);
        let isReviewMode = (mode === 'review' && requestedLevel < gameData.currentLevel);

        // Если режим не play и не review, или день не соответствует режиму, отправляем на главную
        if (!isPlayMode && !isReviewMode) {
            window.location.href = 'index.html';
            return;
        }

        // Обновляем отображение очков и кнопки "Главный Экран"
        updatePointsDisplay();
        document.getElementById('homeButton').style.display = 'block';
        document.getElementById('homeButton').addEventListener('click', () => {
            window.location.href = 'index.html'; // Просто возвращаемся на главную
        });

        document.getElementById('levelTitle').textContent = `День ${requestedLevel}: ${isPlayMode ? 'Выбери Блюдо' : 'Обзор Блюда'}`;

        const dishSelectionSection = document.querySelector('.dish-selection');
        const questionSection = document.querySelector('.question-section');
        const submitAnswerButton = document.getElementById('submitAnswer');
        const feedbackText = document.getElementById('feedbackText');
        const pointsPopup = document.getElementById('pointsPopup'); // Всплывающее окно очков

        if (isPlayMode) {
            // Режим игры (для текущего дня)
            dishSelectionSection.style.display = 'flex'; // Показываем выбор блюд
            questionSection.style.display = 'none'; // Пока скрываем вопрос
            submitAnswerButton.style.display = 'block'; // Показываем кнопку ответа

            // Заполняем информацию о блюдах для выбора
            document.querySelectorAll('.dish-card h3')[0].textContent = currentLevelContent.dishes[0].name;
            document.querySelectorAll('.dish-card p')[0].textContent = currentLevelContent.dishes[0].desc;
            document.querySelectorAll('.dish-card h3')[1].textContent = currentLevelContent.dishes[1].name;
            document.querySelectorAll('.dish-card p')[1].textContent = currentLevelContent.dishes[1].desc;

            // Сохраняем правильный ответ и выбранное блюдо временно
            gameData.currentQuestionAnswer = currentLevelContent.question.correctAnswer;
            gameData.currentQuestionType = currentLevelContent.question.inputType || 'radio'; // Сохраняем тип вопроса
            saveGameData(gameData);

            // Обработка выбора блюда
            document.querySelectorAll('.select-dish-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const selectedDishIndex = event.target.dataset.dish;
                    const selectedDishName = document.querySelectorAll('.dish-card h3')[selectedDishIndex - 1].textContent;

                    // Скрываем выбор блюд и показываем вопрос
                    dishSelectionSection.style.display = 'none';
                    questionSection.style.display = 'block';
                    
                    // Динамически создаем элементы для ввода ответа
                    renderQuestionInput(currentLevelContent.question);

                    gameData.selectedDishForCurrentDay = selectedDishName; // Сохраняем выбранное блюдо
                    saveGameData(gameData);
                });
            });

            // Обработка ответа на вопрос
            submitAnswerButton.addEventListener('click', () => {
                let userAnswer;
                let isCorrect = false;

                if (gameData.currentQuestionType === 'radio') {
                    const selectedOption = document.querySelector('input[name="answer"]:checked');
                    if (!selectedOption) {
                        feedbackText.textContent = "Пожалуйста, выбери вариант ответа.";
                        return;
                    }
                    userAnswer = selectedOption.value;
                } else if (gameData.currentQuestionType === 'text') {
                    const textInput = document.getElementById('textAnswerInput');
                    if (!textInput || textInput.value.trim() === '') {
                        feedbackText.textContent = "Пожалуйста, введи свой ответ.";
                        return;
                    }
                    userAnswer = textInput.value.trim();
                }

                // Сравнение ответа
                if (userAnswer.toLowerCase() === gameData.currentQuestionAnswer.toLowerCase()) { // Сравниваем без учета регистра
                    feedbackText.textContent = `Правильно! Ты получаешь ${POINTS_PER_CORRECT_ANSWER} очков!`;
                    gameData.totalPoints += POINTS_PER_CORRECT_ANSWER;
                    isCorrect = true;

                    if (pointsPopup) {
                        pointsPopup.textContent = `+${POINTS_PER_CORRECT_ANSWER} ОЧКОВ!`;
                        pointsPopup.style.opacity = '1';
                        pointsPopup.style.animation = 'none';
                        void pointsPopup.offsetWidth;
                        pointsPopup.style.animation = 'fadeOutUp 3s forwards';
                    }

                } else {
                    feedbackText.textContent = `Неверно. Правильный ответ был: "${gameData.currentQuestionAnswer}". Но блюдо всё равно будет приготовлено!`;
                    isCorrect = false;
                }

                feedbackText.style.display = 'block';
                submitAnswerButton.disabled = true;

                // Добавляем запись о пройденном дне в историю
                gameData.completedDays.push({
                    level: requestedLevel, // requestedLevel здесь - это тот, на который пришли (для истории)
                    dish: gameData.selectedDishForCurrentDay,
                    correctAnswer: isCorrect
                });

                // Очищаем временные данные
                gameData.currentQuestionAnswer = null;
                gameData.selectedDishForCurrentDay = null;
                gameData.currentQuestionType = null; // Очищаем тип вопроса
                saveGameData(gameData);

                // Автоматический переход на главную через 3 секунды
                setTimeout(() => {
                    // Увеличиваем currentLevel только если это был режим "play" для текущего уровня
                    if (requestedLevel === gameData.currentLevel) {
                         gameData.currentLevel++; // Переходим к следующему дню в глобальном прогрессе
                    }
                    saveGameData(gameData);
                    window.location.href = 'index.html'; // Всегда возвращаемся в календарь
                }, 3000);

            }); // Конец submitAnswerButton click listener

        } else if (isReviewMode) {
            // Режим просмотра (для пройденных дней)
            dishSelectionSection.style.display = 'none'; // Скрываем выбор блюд
            questionSection.style.display = 'block'; // Показываем секцию вопроса
            submitAnswerButton.style.display = 'none'; // Скрываем кнопку ответа

            const answerInputContainer = document.getElementById('answerInputContainer');
            answerInputContainer.innerHTML = ''; // Очищаем контейнер

            // Получаем данные о завершенном дне из completedDays
            const completedDayData = gameData.completedDays.find(d => d.level === requestedLevel);

            if (completedDayData) {
                // Показываем выбранное блюдо
                document.getElementById('questionText').innerHTML = `
                    Ты выбрал(а): <strong>${completedDayData.dish}</strong><br><br>
                    <strong>Вопрос:</strong> ${currentLevelContent.question.text}<br>
                    <strong>Твой ответ:</strong> ${completedDayData.correctAnswer ? 'Правильно!' : 'Неправильно.'}
                    ${!completedDayData.correctAnswer ? ` (Правильный ответ был: "${currentLevelContent.question.correctAnswer}")` : ''}
                `;
                feedbackText.style.display = 'none'; // Скрываем обычный фидбек

            } else {
                // Если по каким-то причинам данные не найдены (редко, но возможно при сбросе или ошибках)
                document.getElementById('questionText').textContent = `Данные для Дня ${requestedLevel} не найдены. Возможно, этот день был сброшен или ещё не пройден.`;
            }
        }
    });

    // Новая функция для динамического создания поля ввода ответа
    function renderQuestionInput(questionContent) {
        const answerInputContainer = document.getElementById('answerInputContainer');
        answerInputContainer.innerHTML = ''; // Очищаем старые элементы

        if (questionContent.inputType === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'textAnswerInput';
            input.placeholder = 'Введи свой ответ...';
            input.classList.add('text-input-answer'); // Добавим класс для стилей
            answerInputContainer.appendChild(input);
        } else { // По умолчанию или 'radio'
            questionContent.options.forEach((option, index) => {
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `option${String.fromCharCode(65 + index)}`; // optionA, optionB
                input.name = 'answer';
                input.value = option;

                const label = document.createElement('label');
                label.htmlFor = `option${String.fromCharCode(65 + index)}`;
                label.textContent = option;

                answerInputContainer.appendChild(input);
                answerInputContainer.appendChild(label);
                answerInputContainer.appendChild(document.createElement('br')); // Перенос строки
            });
        }
    }
}


// --- Логика для achievements.html ---
if (document.getElementById('achievementsLevelDisplay')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('achievementsLevelDisplay').textContent = Math.min(gameData.currentLevel -1, TOTAL_LEVELS);
        document.getElementById('achievementsPointsDisplay').textContent = gameData.totalPoints;

        // Также отображаем кнопку "Главный Экран" на странице достижений
        document.getElementById('homeButton').style.display = 'block';
        document.getElementById('homeButton').addEventListener('click', () => {
            window.location.href = 'index.html'; // Возвращаемся в главное меню
        });


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