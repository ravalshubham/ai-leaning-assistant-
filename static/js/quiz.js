const apiKey = "AIzaSyDcMRFASGEIn--BVttQuzPVyOrQDWq3yCI"; // Replace with your actual API key

// Function to handle quiz generation
async function generateQuiz() {
    const topic = document.getElementById("quizTopic").value.trim();
    const numQuestions = parseInt(document.getElementById("numQuestions").value, 10); // Get user input for number of questions

    if (!topic) {
        alert("Enter a topic to generate a quiz!");
        return;
    }
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
        alert("Enter a valid number of questions (between 1 and 50)!");
        return;
    }

    document.getElementById("generateQuizBtn").disabled = true;
    document.getElementById("quizSection").style.display = "flex";
    document.getElementById("quizResult").style.display = "flex";
    document.getElementById("quizSection").innerHTML = "⏳ Generating quiz...";

    try {
        const geminiResponse = await callGeminiQuizApi(topic, numQuestions);
        console.log("🟢 API Response:", geminiResponse); // Debugging the API response

        const quizData = parseQuiz(geminiResponse);
        if (quizData.length === 0) {
            alert("⚠️ No valid questions found. API response may be formatted differently.");
            return;
        }

        displayQuiz(quizData);
    } catch (error) {
        alert(`Error generating quiz. Try again. ${error}`);
    } finally {
        document.getElementById("generateQuizBtn").disabled = false;
    }
}

// ✅ Event Listener for "Generate Quiz" Button
document.getElementById("generateQuizBtn").addEventListener("click", generateQuiz);

// ✅ Improved API Call Function
async function callGeminiQuizApi(inputText, numQuestions = 10) {
    const prompt = `
        Generate exactly ${numQuestions} multiple-choice questions (MCQs) on:
        "${inputText}"

        Each question should have:
        - A question number must be (e.g., "1.", "2.")
        - Four options labeled A, B, C, and D
        - The correct answer clearly mentioned

        **Format each question like this:**
        Q: [question text]
        A) [option 1]
        B) [option 2]
        C) [option 3]
        D) [option 4]
        Answer: [Correct option letter (A, B, C, or D)]
    `;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
    );

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error fetching quiz.";
}

// ✅ More Flexible Parsing Logic
function parseQuiz(responseText) {
    const questions = [];
    const questionBlocks = responseText.split(/\n\n+/); // Split by double newlines to separate questions

    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split("\n").filter(line => line); // Remove empty lines

        // Ensure the block has at least 6 lines (question, 4 options, and answer)
        if (lines.length < 6) return;

        // Extract question text (remove the "**Q1:**" or "**1.**" prefix)
        const question = lines[0].replace(/^\*\*(Q?\d+\.?)\*\*\s*/, "").trim();

        // Extract options (lines 1 to 4)
        const options = lines.slice(1, 5).map(line => line.replace(/^[A-D]\)\s*/, "").trim());

        // Extract correct answer (look for "Answer: X")
        const answerMatch = block.match(/Answer:\s*([A-D])/i);
        if (!answerMatch || options.length !== 4) return;

        const correctAnswer = options[["A", "B", "C", "D"].indexOf(answerMatch[1])];
        questions.push({ number: index + 1, question, options, answer: correctAnswer });
    });

    console.log("✅ Parsed Questions:", questions);
    return questions;
}

// ✅ Display Quiz on Page
function displayQuiz(quizData) {
    const quizContainer = document.getElementById("quizSection");
    quizContainer.innerHTML = "";
    quizContainer.style.display = "block";

    quizData.forEach((q, index) => {
        const questionBlock = document.createElement("div");
        questionBlock.classList.add("question-block");

        let optionsHTML = "";
        q.options.forEach((option, i) => {
            optionsHTML += `
                <label class="option-label">
                    <input type="radio" name="question-${index}" value="${option}">
                    ${option}
                </label>`;
        });

        questionBlock.innerHTML = `
            <h3>${q.question}</h3>
            ${optionsHTML}
        `;
        quizContainer.appendChild(questionBlock);
    });

    const submitBtn = document.createElement("button");
    submitBtn.classList.add("submit-btn");
    submitBtn.innerText = "Submit Quiz";
    submitBtn.addEventListener("click", () => handleSubmitQuiz(quizData));
    quizContainer.appendChild(submitBtn);
}

// ✅ Submit Quiz & Calculate Score
function handleSubmitQuiz(quizData) {
    let score = 0;
    quizData.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        if (selected && selected.value === q.answer) score++;
    });

    const resultBox = document.getElementById("quizResult");
    resultBox.innerHTML = `🎉 Your Score: ${score} / ${quizData.length}`;
    resultBox.style.display = "block";
    
    // Request the pie chart from the server
    generateResultChart(score, quizData.length);
}

// ✅ Generate and display the pie chart
async function generateResultChart(correct, total) {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('correct', correct);
        formData.append('total', total);
        
        // Get CSRF token (for Django)
        const csrfToken = getCsrfToken();
        
        // Send request to server
        const response = await fetch('/quiz_chart', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.chart_data) {
            // Display the chart
            const chartContainer = document.getElementById('chartContainer');
            const chartImage = document.getElementById('resultChart');
            
            chartImage.src = `data:image/png;base64,${data.chart_data}`;
            chartContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error generating chart:', error);
    }
}

// Helper function to get CSRF token
function getCsrfToken() {
    // Try to get from cookie
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    if (cookieValue) return cookieValue;
    
    // Try to get from a meta tag
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// ✅ Trigger "Generate Quiz" on Enter Key
function handleEnterKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents default form submission (if inside a form)
        generateQuiz(); // Calls the quiz generation function
    }
}

// ✅ Add Event Listeners for Enter Key
document.getElementById("quizTopic").addEventListener("keypress", handleEnterKeyPress);
document.getElementById("numQuestions").addEventListener("keypress", handleEnterKeyPress);
