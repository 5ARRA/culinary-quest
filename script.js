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
            { name: "Пицца", desc: "Выбери любую начинку, и я сделаю её сам(а) для тебя! Классический вкус любимой пиццы.", customFillingPrompt: "Какую начинку ты хочешь для своей пиццы?" }
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
        const fillingSelectionSection = document.querySelector('.filling-selection-section'); // Новая секция для начинки
        const questionSection = document.querySelector('.question-section');
        const submitAnswerButton = document.getElementById('submitAnswer');
        const feedbackText = document.getElementById('feedbackText');
        const pointsPopup = document.getElementById('pointsPopup'); // Всплывающее окно очков

        if (isPlayMode) {
            // Режим игры (для текущего дня)
            dishSelectionSection.style.display = 'flex'; // Показываем выбор блюд
            fillingSelectionSection.style.display = 'none'; // Скрываем выбор начинки
            questionSection.style.display = 'none'; // Пока скрываем вопрос
            submitAnswerButton.style.display = 'block'; // Показываем кнопку ответа

            // Заполняем информацию о блюдах для выбора
            document.querySelectorAll('.dish-card h3')[0].textContent = currentLevelContent.dishes[0].name;
            document.querySelectorAll('.dish-card p')[0].textContent = currentLevelContent.dishes[0].desc;
            document.querySelectorAll('.dish-card h3')[1].textContent = currentLevelContent.dishes[1].name;
            document.querySelectorAll('.dish-card p')[1].textContent = currentLevelContent.dishes[1].desc;

            // Обработка выбора блюда
            document.querySelectorAll('.select-dish-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const selectedDishIndex = parseInt(event.target.dataset.dish);
                    const selectedDishObject = currentLevelContent.dishes[selectedDishIndex - 1]; // Получаем весь объект блюда

                    gameData.selectedDishForCurrentDay = selectedDishObject.name; // Сохраняем имя блюда
                    saveGameData(gameData);

                    // Проверяем, есть ли у выбранного блюда запрос на кастомную начинку
                    if (selectedDishObject.customFillingPrompt) {
                        dishSelectionSection.style.display = 'none';
                        fillingSelectionSection.style.display = 'block';
                        document.getElementById('fillingPromptText').textContent = selectedDishObject.customFillingPrompt;
                        // Скрываем кнопку SubmitAnswer, пока не подтверждена начинка
                        submitAnswerButton.style.display = 'none';
                    } else {
                        // Если начинка не нужна, сразу переходим к вопросу
                        dishSelectionSection.style.display = 'none';
                        questionSection.style.display = 'block';
                        renderQuestionInput(currentLevelContent.question);
                        submitAnswerButton.style.display = 'block';
                    }
                });
            });

            // Обработка подтверждения начинки
            document.getElementById('confirmFillingButton').addEventListener('click', () => {
                const fillingInput = document.getElementById('fillingInput');
                const filling = fillingInput.value.trim();

                if (filling === '') {
                    alert('Пожалуйста, введи начинку!');
                    return;
                }

                gameData.selectedDishFilling = filling; // Сохраняем выбранную начинку
                saveGameData(gameData);

                fillingSelectionSection.style.display = 'none';
                questionSection.style.display = 'block';
                renderQuestionInput(currentLevelContent.question); // Отрисовываем основной вопрос
                submitAnswerButton.style.display = 'block'; // Показываем кнопку ответа
            });

            // Обработка ответа на вопрос
            submitAnswerButton.addEventListener('click', () => {
                let userAnswer;
                let isCorrect = false;

                if (gameData.currentQuestionType === 'radio') {
                    const selectedOption = document.querySelector('input[name="answer"]:checked');
                    if (!selectedOption) { // <--- Эта проверка здесь, чтобы избежать ошибки
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

                // Защитное исправление: проверяем, что значения определены перед toLowerCase()
                if (
                    userAnswer !== undefined && userAnswer !== null &&
                    gameData.currentQuestionAnswer !== undefined && gameData.currentQuestionAnswer !== null &&
                    String(userAnswer).toLowerCase() === String(gameData.currentQuestionAnswer).toLowerCase()
                ) {
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
                    // Если сюда попали, значит, либо неправильный ответ, либо userAnswer или gameData.currentQuestionAnswer были undefined/null
                    feedbackText.textContent = `Неверно. Правильный ответ был: "${gameData.currentQuestionAnswer}". Но блюдо всё равно будет приготовлено!`;
                    isCorrect = false;
                }

                feedbackText.style.display = 'block';
                submitAnswerButton.disabled = true;

                // Добавляем запись о пройденном дне в историю, включая начинку
                gameData.completedDays.push({
                    level: requestedLevel,
                    dish: gameData.selectedDishForCurrentDay,
                    filling: gameData.selectedDishFilling || null, // Сохраняем начинку, если есть
                    correctAnswer: isCorrect
                });

                // Очищаем временные данные
                gameData.currentQuestionAnswer = null;
                gameData.selectedDishForCurrentDay = null;
                gameData.selectedDishFilling = null; // Очищаем начинку
                gameData.currentQuestionType = null;
                saveGameData(gameData);

                // --- НОВЫЙ БЛОК ДЛЯ ОТПРАВКИ НА ПОЧТУ ---
                sendProgressEmail(
                    requestedLevel,
                    gameData.completedDays[gameData.completedDays.length - 1].dish, // Последнее выбранное блюдо
                    gameData.completedDays[gameData.completedDays.length - 1].filling, // Начинка
                    currentLevelContent.question.text, // Текст вопроса
                    userAnswer, // Ответ пользователя
                    currentLevelContent.question.correctAnswer, // Правильный ответ
                    isCorrect, // Был ли ответ правильным
                    gameData.totalPoints // Текущие очки
                );
                // --- КОНЕЦ НОВОГО БЛОКА ---

                setTimeout(() => {
                    if (requestedLevel === gameData.currentLevel) {
                         gameData.currentLevel++;
                    }
                    saveGameData(gameData);
                    window.location.href = 'index.html';
                }, 3000);

            }); // Конец submitAnswerButton click listener

        } else if (isReviewMode) {
            // Режим просмотра
            dishSelectionSection.style.display = 'none';
            fillingSelectionSection.style.display = 'none'; // Скрываем секцию начинки в обзоре
            questionSection.style.display = 'block';
            submitAnswerButton.style.display = 'none';
            
            const answerInputContainer = document.getElementById('answerInputContainer');
            answerInputContainer.innerHTML = ''; // Очищаем контейнер

            // Получаем данные о завершенном дне из completedDays
            const completedDayData = gameData.completedDays.find(d => d.level === requestedLevel);

            if (completedDayData) {
                let dishInfo = `Ты выбрал(а): <strong>${completedDayData.dish}</strong>`;
                if (completedDayData.filling) { // Если есть данные о начинке
                    dishInfo += `<br>Начинка: <strong>${completedDayData.filling}</strong>`;
                }
                
                document.getElementById('questionText').innerHTML = `
                    ${dishInfo}<br><br>
                    <strong>Вопрос:</strong> ${currentLevelContent.question.text}<br>
                    <strong>Твой ответ:</strong> ${completedDayData.correctAnswer ? 'Правильно!' : 'Неправильно.'}
                    ${!completedDayData.correctAnswer ? ` (Правильный ответ был: "${currentLevelContent.question.correctAnswer}")` : ''}
                `;
                feedbackText.style.display = 'none';

            } else {
                // Если по каким-то причинам данные не найдены (редко, но возможно при сбросе или ошибках)
                document.getElementById('questionText').textContent = `Данные для Дня ${requestedLevel} не найдены. Возможно, этот день был сброшен или ещё не пройден.`;
            }
        }
    });

    // Функция для динамического создания поля ввода ответа (без изменений)
    function renderQuestionInput(questionContent) {
        const answerInputContainer = document.getElementById('answerInputContainer');
        answerInputContainer.innerHTML = ''; // Очищаем старые элементы

        if (questionContent.inputType === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'textAnswerInput';
            input.placeholder = 'Введи свой ответ...';
            input.classList.add('text-input-answer');
            answerInputContainer.appendChild(input);
        } else { // По умолчанию или 'radio'
            questionContent.options.forEach((option, index) => {
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `option${String.fromCharCode(65 + index)}`;
                input.name = 'answer';
                input.value = option;

                const label = document.createElement('label');
                label.htmlFor = `option${String.fromCharCode(65 + index)}`;
                label.textContent = option;

                answerInputContainer.appendChild(input);
                answerInputContainer.appendChild(label);
                answerInputContainer.appendChild(document.createElement('br'));
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
                let itemText = `День ${item.level}: ${item.dish}`;
                if (item.filling) {
                    itemText += ` (Начинка: ${item.filling})`;
                }
                itemText += ` (Ответ: ${item.correctAnswer ? 'Правильно, +100 очков' : 'Неправильно'})`;
                li.textContent = itemText;
                list.appendChild(li);
            });
        }
    });
}


// --- Функция для отправки прогресса на email через Web3Forms ---
// ВАЖНО: ЗАМЕНЕНО НА ВАШ КЛЮЧ
const WEB3FORMS_ACCESS_KEY = '86af6a8b-2fc2-4b67-89a2-0cdd928c6746';

async function sendProgressEmail(
    level,
    dish,
    filling,
    questionText,
    userAnswer,
    correctAnswer,
    isCorrect,
    totalPoints
) {
    const data = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Прогресс в Кулинарном Квесте: День ${level} завершен!`,
        from_name: "Кулинарный Квест", // Имя отправителя, которое увидишь в почте
        "Уровень": level,
        "Выбранное Блюдо": dish,
        "Начинка": filling || "Не выбрана", // Если начинки нет, так и пишем
        "Вопрос Дня": questionText,
        "Ответ Пользователя": userAnswer,
        "Правильный Ответ": correctAnswer,
        "Результат Ответа": isCorrect ? "Правильно!" : "Неправильно",
        "Всего Очков": totalPoints,
        // Можно добавить другие данные, например, дату, время
        // "Время Завершения": new Date().toLocaleString()
    };

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            console.log("Email отправлен успешно!", result);
        } else {
            console.error("Ошибка при отправке email:", result);
        }
    } catch (error) {
        console.error("Ошибка сети при отправке email:", error);
    }
}