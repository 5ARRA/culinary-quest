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
const levelData = Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
    dishes: [
        { name: `Тестовое Блюдо ${i + 1}.1`, desc: `Описание тестового блюда ${i + 1}.1` },
        { name: `Тестовое Блюдо ${i + 1}.2`, desc: `Описание тестового блюда ${i + 1}.2` }
    ],
    question: {
        text: `Это тестовый вопрос для Дня ${i + 1}. Что-то из наших воспоминаний? (Правильный ответ: Вариант Б)`,
        options: ['Вариант А', 'Вариант Б', 'Вариант В'],
        correctAnswer: 'Вариант Б'
    }
}));


// --- Функции для управления отображением секций ---
function showSection(sectionId) {
    document.querySelectorAll('.game-section').forEach(section => {
        section.style.display = 'none'; // Скрываем все секции
    });
    document.getElementById(sectionId).style.display = 'block'; // Показываем нужную

    // Показываем/скрываем кнопку "Главный Экран"
    if (sectionId === 'mainMenu' || sectionId === 'rulesSection' || sectionId === 'prizesShopSection') {
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

        // Обновляем отображение очков на этой странице
        const pointsDisplay = document.getElementById('currentPointsDisplay');
        if (pointsDisplay) {
            pointsDisplay.textContent = gameData.totalPoints;
        }
        document.getElementById('homeButton').style.display = 'block'; // Показываем кнопку "Главный Экран"

        // Привязываем кнопку "Главный Экран"
        document.getElementById('homeButton').addEventListener('click', () => {
             window.location.href = 'index.html'; // Просто возвращаемся на главную
        });


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

                    // --- КОД ДЛЯ ПОКАЗА АНИМАЦИИ ОЧКОВ ---
                    const pointsPopup = document.getElementById('pointsPopup');
                    if (pointsPopup) { // Проверяем, существует ли элемент
                        pointsPopup.textContent = `+${POINTS_PER_CORRECT_ANSWER} ОЧКОВ!`;
                        pointsPopup.style.opacity = '1';
                        pointsPopup.style.animation = 'none';
                        void pointsPopup.offsetWidth;
                        pointsPopup.style.animation = 'fadeOutUp 3s forwards';
                    }
                    // --- КОНЕЦ АНИМАЦИИ ОЧКОВ ---

                } else {
                    feedbackText.textContent = `Неверно. Правильный ответ был: "${gameData.currentQuestionAnswer}". Но блюдо всё равно будет приготовлено!`;
                    isCorrect = false;
                }
            } else {
                feedbackText.textContent = "Пожалуйста, выбери вариант ответа.";
                return; // Не продолжаем, пока не выбран ответ
            }

            feedbackText.style.display = 'block';
            document.getElementById('submitAnswer').disabled = true; // Отключаем кнопку

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

            // Автоматический переход на главную через 3 секунды
            setTimeout(() => {
                gameData.currentLevel++; // Переходим к следующему дню
                saveGameData(gameData);
                window.location.href = 'index.html'; // Всегда возвращаемся в календарь
            }, 3000); // Задержка в 3 секуды
        });
    });
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