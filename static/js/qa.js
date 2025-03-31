const API_KEY = "AIzaSyDcMRFASGEIn--BVttQuzPVyOrQDWq3yCI"; // Replace with your Gemini API Key

const chatBox = document.getElementById("chatBox");
const inputContainer = document.getElementById("inputContainer");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");

// Function to add chat messages to the UI
function addChatMessage(content, role) {
    const message = document.createElement("div");
    message.classList.add("chat-message", role);
    message.innerHTML = content;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to fetch response from Gemini API
async function callGeminiApi(question) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Answer the following academic question clearly and concisely:\n\nQuestion: "${question}"`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error fetching response.";
    } catch (error) {
        console.error("Gemini API error:", error);
        return "Error generating answer. Please try again.";
    }
}

// Function to handle user question submission
async function handleAskQuestion() {
    const question = questionInput.value.trim();
    if (!question) {
        alert("Please enter a question!");
        return;
    }

    // Show Chatbox and move input down after first question
    if (chatBox.style.display === "none") {
        chatBox.style.display = "block";
        inputContainer.classList.add("move-input-bottom");
    }

    // Add user's question
    addChatMessage(`<strong>You:</strong> ${question}`, "user");
    questionInput.value = "";
    askButton.disabled = true;

    // Add thinking text
    const thinkingMessage = document.createElement("div");
    thinkingMessage.classList.add("chat-message", "bot");
    thinkingMessage.innerText = "⏳ Thinking...";
    chatBox.appendChild(thinkingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch the answer
    try {
        const answer = await callGeminiApi(question);
        thinkingMessage.remove();
        addChatMessage(`<strong>EduBuddy:</strong> ${answer}`, "bot");
    } catch (error) {
        thinkingMessage.remove();
        addChatMessage(`<strong>EduBuddy:</strong> Error generating answer. Please try again.`, "bot");
    }

    askButton.disabled = false;
}

// Event Listener for Ask Button Click
askButton.addEventListener("click", handleAskQuestion);

// Event Listener for Enter Key Press
questionInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {  // Prevents Enter + Shift from triggering submission
        event.preventDefault();  // Prevents new line in textarea
        handleAskQuestion();
    }
});


