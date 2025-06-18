// --- Вспомогательные функции для работы с локальным хранилищем ---
function saveGameData(data) {
    localStorage.setItem('gameProgress', JSON.stringify(data));
}

function loadGameData() {
    const data = localStorage.getItem('gameProgress');
    return data ? JSON.parse(data) : {
        currentLevel: 0,
        totalPoints: 0,
        completedDishes: [], // [{level: 1, dish: "Блюдо 1", correct: true}]
        currentQuestionAnswer: null // Для хранения правильного ответа текущего вопроса
    };
}

let gameData = loadGameData(); // Загружаем данные при старте скрипта

// --- Логика для index.html ---
if (document.getElementById('startButton')) {
    document.addEventListener('DOMContentLoaded', () => {
        updateMainPageUI(); // Обновляем данные при загрузке главной страницы

        document.getElementById('startButton').addEventListener('click', () => {
            // Если игра только начинается или уже завершена, начинаем с 1 уровня
            if (gameData.currentLevel === 0 || gameData.currentLevel >= 30) {
                gameData.currentLevel = 0; // Сбрасываем для нового прохождения
                gameData.totalPoints = 0;
                gameData.completedDishes = [];
            }
            gameData.currentLevel++; // Переходим к следующему уровню
            saveGameData(gameData);
            window.location.href = 'level.html'; // Перенаправляем на страницу уровня
        });

        document.getElementById('achievementsButton').addEventListener('click', () => {
            window.location.href = 'achievements.html';
        });

        // Показываем кнопку достижений, если уже есть какой-то прогресс
        if (gameData.currentLevel > 0 || gameData.totalPoints > 0) {
            document.getElementById('achievementsButton').style.display = 'block';
        }
    });

    function updateMainPageUI() {
        document.getElementById('currentLevelDisplay').textContent = gameData.currentLevel;
        document.getElementById('currentPointsDisplay').textContent = gameData.totalPoints;
        document.getElementById('progressBar').style.width = (gameData.currentLevel / 30) * 100 + '%';
    }
}

// --- Логика для level.html ---
if (document.getElementById('levelTitle')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Проверяем, на каком мы уровне
        if (gameData.currentLevel === 0) {
            // Если каким-то образом попали на level.html без начала игры
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('levelTitle').textContent = `Уровень ${gameData.currentLevel}: Выбери Блюдо`;

        // Временно: генерируем тестовые блюда и вопрос
        const dishes = [
            `Тестовое Блюдо ${gameData.currentLevel}.1`,
            `Тестовое Блюдо ${gameData.currentLevel}.2`
        ];
        document.querySelectorAll('.dish-card h3')[0].textContent = dishes[0];
        document.querySelectorAll('.dish-card h3')[1].textContent = dishes[1];

        // Генерируем тестовый вопрос и правильный ответ (потом будем брать из массива)
        const currentQuestion = {
            text: `Это вопрос для Уровня ${gameData.currentLevel}. Какой любимый цвет?`,
            options: ['Красный', 'Синий', 'Зеленый'],
            correctAnswer: 'Синий' // Правильный ответ для примера
        };
        document.getElementById('questionText').textContent = currentQuestion.text;
        document.getElementById('optionA').value = currentQuestion.options[0];
        document.querySelector('label[for="optionA"]').textContent = currentQuestion.options[0];
        document.getElementById('optionB').value = currentQuestion.options[1];
        document.querySelector('label[for="optionB"]').textContent = currentQuestion.options[1];
        document.getElementById('optionC').value = currentQuestion.options[2];
        document.querySelector('label[for="optionC"]').textContent = currentQuestion.options[2];

        // Сохраняем правильный ответ в gameData для проверки
        gameData.currentQuestionAnswer = currentQuestion.correctAnswer;
        saveGameData(gameData);

        // Обработка выбора блюда
        document.querySelectorAll('.select-dish-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const selectedDishIndex = event.target.dataset.dish;
                const selectedDishName = document.querySelectorAll('.dish-card h3')[selectedDishIndex - 1].textContent;
                
                // Скрываем выбор блюд и показываем вопрос
                document.querySelector('.dish-selection').style.display = 'none';
                document.querySelector('.question-section').style.display = 'block';
                
                // Сохраняем выбранное блюдо, чтобы потом добавить в историю
                gameData.tempSelectedDish = selectedDishName;
                saveGameData(gameData);
            });
        });

        // Обработка ответа на вопрос
        document.getElementById('submitAnswer').addEventListener('click', () => {
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            const feedbackText = document.getElementById('feedbackText');
            let pointsEarned = 0;
            let isCorrect = false;

            if (selectedOption) {
                if (selectedOption.value === gameData.currentQuestionAnswer) {
                    feedbackText.textContent = "Правильно! Ты получаешь 100 очков!";
                    gameData.totalPoints += 100;
                    pointsEarned = 100;
                    isCorrect = true;
                } else {
                    feedbackText.textContent = `Неверно. Правильный ответ был: ${gameData.currentQuestionAnswer}. Но блюдо всё равно будет приготовлено!`;
                    isCorrect = false;
                }
            } else {
                feedbackText.textContent = "Пожалуйста, выбери вариант ответа.";
                return; // Не продолжаем, пока не выбран ответ
            }

            feedbackText.style.display = 'block';

            // Добавляем запись о пройденном блюде в историю
            gameData.completedDishes.push({
                level: gameData.currentLevel,
                dish: gameData.tempSelectedDish,
                correctAnswer: isCorrect
            });

            gameData.currentQuestionAnswer = null; // Сбрасываем
            gameData.tempSelectedDish = null; // Сбрасываем

            saveGameData(gameData);

            // Переход к следующему уровню или на главную страницу через 3 секунды
            setTimeout(() => {
                if (gameData.currentLevel < 30) {
                    gameData.currentLevel++;
                    saveGameData(gameData);
                    window.location.href = 'level.html'; // Следующий уровень
                } else {
                    alert("Поздравляем! Ты прошла все 30 уровней! Теперь проверь свои достижения!");
                    window.location.href = 'index.html'; // На главную после всех уровней
                }
            }, 3000);
        });
    });
}

// --- Логика для achievements.html ---
if (document.getElementById('achievementsLevelDisplay')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('achievementsLevelDisplay').textContent = gameData.currentLevel;
        document.getElementById('achievementsPointsDisplay').textContent = gameData.totalPoints;

        const list = document.getElementById('completedDishesList');
        if (gameData.completedDishes.length === 0) {
            list.innerHTML = '<li>Пока что нет пройденных блюд.</li>';
        } else {
            list.innerHTML = ''; // Очищаем список перед заполнением
            gameData.completedDishes.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `Уровень ${item.level}: ${item.dish} (Ответ: ${item.correctAnswer ? 'Правильно' : 'Неправильно'})`;
                list.appendChild(li);
            });
        }
    });
}