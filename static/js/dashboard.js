document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Dashboard script loaded successfully.");

    // Get references to elements
    let timerElement = document.getElementById("timer");
    let countdownDisplay = document.getElementById("minuteCountdown");
    let reminderDisplay = document.getElementById("countdown");
    let studyTimeout, breakTimeout, reminderInterval, countdownInterval;
    let exerciseIndex = 0;

    let studyDuration = 1; // Default study time in minutes
    let breakDuration = 1;  // Default break time in minutes

    let exercises = [
        { instruction: "👀 Look far away (20 feet) for 20 seconds.", gif: "https://www.lenstore.co.uk/research/eye-yoga/img/card3.gif" },
        { instruction: "🔄 Slowly roll your eyes in a circular motion (5 times each direction).", gif: "https://d2pmylrgugb0ux.cloudfront.net/uploads/2019/08/eye_roll_right.gif" },
        { instruction: "👁 Blink quickly for 10 seconds to refresh your eyes.", gif: "https://www.lenstore.co.uk/research/eye-yoga/img/card2.gif" },
        { instruction: "😌 Close your eyes and relax for 10 seconds.", gif: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1xyZjZiE0wRAU7dSzm-hD25ijOjqmnV_a-Q&s" }
    ];

    // ✅ Function 1: Start Study Timer
    function startStudyTimer() {
        if (!timerElement) return;
        timerElement.innerText = `⏳ Studying for ${studyDuration} minutes...`;

        clearTimeout(studyTimeout);
        clearTimeout(breakTimeout);

        studyTimeout = setTimeout(() => {
            takeBreakOrExercise();
        }, studyDuration * 60 * 1000);
    }

    // ✅ Function 2: Take Break or Do Eye Exercise
    function takeBreakOrExercise() {
        let choice = confirm("⏳ Time to take a break!\n\nDo you want to do an eye exercise? Click 'OK' for eye exercise or 'Cancel' to take a normal break.");
        if (choice) {
            startEyeExercise();
        } else {
            alert("🛑 Take a 5-minute break! Walk around, stretch, and relax.");
            startBreakTimer();
        }
    }

    // ✅ Function 3: Start Eye Exercise
    function startEyeExercise() {
        exerciseIndex = 0;
        document.getElementById("exercisePopup").style.display = "block";
        showExerciseStep();
    }

    function showExerciseStep() {
        if (exerciseIndex < exercises.length) {
            document.getElementById("exerciseInstruction").innerText = exercises[exerciseIndex].instruction;
            document.getElementById("exerciseGif").src = exercises[exerciseIndex].gif;
        } else {
            document.getElementById("exercisePopup").style.display = "none";
            alert("✅ Eye exercises completed! Now, take a short break.");
            startBreakTimer();
        }
    }

    function nextInstruction() {
        exerciseIndex++;
        showExerciseStep();
    }

    // ✅ Function 4: Start Break Timer
    function startBreakTimer() {
        if (!timerElement) return;
        timerElement.innerText = `🛑 Taking a break for ${breakDuration} minutes...`;

        breakTimeout = setTimeout(() => {
            alert("✅ Break over! Time to get back to studying!");
            startStudyTimer();
        }, breakDuration * 60 * 1000);
    }

    // ✅ Function 5: Set Reminder at a Specific Time
    function setReminderTime() {
        if (!reminderDisplay) return;
        clearInterval(reminderInterval);
        let timeValue = document.getElementById("timeInput").value;
        if (!timeValue) {
            reminderDisplay.innerText = "⛔ Please select a valid time!";
            return;
        }

        let selectedTime = new Date();
        let [hours, minutes] = timeValue.split(":");
        selectedTime.setHours(hours, minutes, 0, 0);
        let now = new Date();

        if (selectedTime < now) {
            reminderDisplay.innerText = "⛔ Time must be in the future!";
            return;
        }

        reminderDisplay.innerText = `⏰ Reminder set for ${timeValue}`;
        reminderInterval = setInterval(() => {
            let now = new Date();
            if (now >= selectedTime) {
                clearInterval(reminderInterval);
                reminderDisplay.innerText = "⏰ Time's up!";
                playAlarmSound();
                alert("🔔 Reminder Alert: Your time is up!");
            }
        }, 1000);
    }

    // ✅ Function 6: Start Countdown Timer
    function startCountdownTimer() {
        if (!countdownDisplay) return;
        clearInterval(countdownInterval);
        let minutes = document.getElementById("minutesInput").value;

        if (!minutes || minutes <= 0) {
            countdownDisplay.innerText = "⛔ Please enter a valid time!";
            return;
        }

        let targetTime = new Date().getTime() + minutes * 60000;
        countdownInterval = setInterval(() => {
            let now = new Date().getTime();
            let timeDiff = targetTime - now;

            if (timeDiff <= 0) {
                clearInterval(countdownInterval);
                countdownDisplay.innerText = "⏰ Time's up!";
                alert("⏳ Timer Finished! Your countdown is complete.");
                return;
            }

            let mins = Math.floor(timeDiff / (1000 * 60));
            let secs = Math.floor((timeDiff % (1000 * 60)) / 1000);
            countdownDisplay.innerText = `⏳ ${mins}m ${secs}s remaining`;
        }, 1000);
    }

    // ✅ Function 7: Add Task
    function addTask() {
        let taskInput = document.getElementById("taskInput").value.trim();
        if (taskInput === "") return;

        let li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" onclick="removeTask(this)">
            <span>${taskInput}</span>
            <button class="delete-btn" onclick="deleteTask(this)">X</button>
        `;

        document.getElementById("taskList").appendChild(li);
        document.getElementById("taskInput").value = "";
    }

    function deleteTask(button) {
        button.parentElement.remove();
    }

    function removeTask(checkbox) {
        let task = checkbox.parentElement;
        setTimeout(() => task.remove(), 300);
    }

    function playAlarmSound() {
        let alarmSound = document.getElementById("alarmSound");
        if (alarmSound) {
            alarmSound.play().catch(error => console.warn("⚠ Sound play failed:", error));
        }
    }

    // ✅ Make Functions Available in Global Scope
    window.startStudyTimer = startStudyTimer;
    window.nextInstruction = nextInstruction;
    window.setReminderTime = setReminderTime;
    window.startCountdownTimer = startCountdownTimer;
    window.addTask = addTask;
    window.deleteTask = deleteTask;
    window.removeTask = removeTask;
});
