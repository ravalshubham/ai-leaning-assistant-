// ✅ Ensure jsPDF is loaded
if (typeof window.jspdf === "undefined") {
    console.error("❌ jsPDF library not found!");
} else {
    console.log("✅ jsPDF loaded successfully.");
}

// ✅ Handle the "Download PDF" button click
document.getElementById("downloadBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "p", // Portrait mode
        unit: "mm",
        format: "a4"
    });

    // Get the study content and topic
    let studyText = document.getElementById("studyContent").innerText;
    let topic = document.getElementById("topicInput").value.trim();
    if (!topic) topic = "Study_Material"; // Default if no topic is entered

    let marginLeft = 10;
    let marginTop = 10;
    let maxWidth = 180;
    let lineHeight = 8;

    // Set title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Study Material: ${topic}`, marginLeft, marginTop);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Add multi-page text
    let splitText = doc.splitTextToSize(studyText, maxWidth);
    let y = marginTop + 10;

    splitText.forEach(line => {
        if (y + lineHeight > 280) { // Check if new page is needed
            doc.addPage();
            y = 10; // Reset y position
        }
        doc.text(line, marginLeft, y);
        y += lineHeight;
    });

    // Save PDF with topic name
    doc.save(`${topic}_Study_Material.pdf`);
});

// ✅ Ensure "Download PDF" button is visible only after response generation
const showDownloadButton = () => {
    document.getElementById("downloadBtn").style.display = "inline-block";
};

// ✅ Ensure Marked.js is loaded
if (typeof marked === "undefined") {
    console.error("❌ Marked.js not loaded properly!");
} else {
    console.log("✅ Marked.js loaded successfully.");
}

// ✅ Function to Call AI API
const callGeminiApi = async (topic) => {
    const apiKey = "AIzaSyBFocnFv0Sh7k7hNHBWnRAv2FWYlk0ijQw"; // Replace with your actual API key

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Generate detailed academic content for the topic: ${topic}.` }]
                    }]
                }),
            }
        );

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error fetching response.";
    } catch (error) {
        console.error("Gemini API error:", error);
        return "Error generating content.";
    }
};

// ✅ Handling UI Interactions
document.getElementById("generateBtn").addEventListener("click", async () => {
    const topic = document.getElementById("topicInput").value.trim();
    const outputSection = document.getElementById("outputSection");
    const studyContent = document.getElementById("studyContent");
    const loadingMessage = document.getElementById("loadingMessage");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    // Show loading message and hide previous output
    loadingMessage.style.display = "block";
    outputSection.style.display = "none";
    studyContent.innerHTML = "";
    downloadBtn.style.display = "none"; // Hide download button initially

    try {
        const generatedContent = await callGeminiApi(topic);
        formatAndDisplayContent(generatedContent);
    } catch (error) {
        console.error("Material generation error:", error);
        studyContent.innerHTML = "Error generating content.";
    } finally {
        loadingMessage.style.display = "none";
    }
});

// ✅ Function to Format and Display Content
const formatAndDisplayContent = (text) => {
    if (typeof marked !== "undefined") {
        let formattedText = marked.parse(text);

        // Insert formatted content
        const studyContent = document.getElementById("studyContent");
        studyContent.innerHTML = formattedText;

        // Render LaTeX Equations
        renderLaTeX();
        document.getElementById("outputSection").style.display = "block";

        // Show Download Button after response is generated
        showDownloadButton();
    } else {
        console.error("❌ Marked.js not loaded properly!");
    }
};

// ✅ Function to Render LaTeX Equations
const renderLaTeX = () => {
    document.querySelectorAll("#studyContent .katex").forEach((element) => {
        katex.render(element.textContent, element, { throwOnError: false });
    });
};
