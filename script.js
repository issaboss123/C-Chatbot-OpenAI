const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "PLACE YOUR API KEY HERE"
const initialHeight = chatInput.scrollHeight;

const default_String = "Pretend that you are a professor in Computer science and your an expert in C language topics. \nYou are helpful, creative and very friendly. \nYou will give the general description of what is asked through a paragraph.\n";

// const max_context_questions = 3;
// let context_list = [];
// const subset = context_list.slice(-max_context_questions);
// let context_string = ``;

const answer_Sequence = `\nA: `;
const question_Sequence = `\nQ: `;

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode"

    const defaultText = `<div class="default-text">
                            <h1>Chatbot powered by OpenAI</h1>
                            <p>Start a conversation and explore the power of AI. <br> Your chat history will be displayed here.</p>
                            <br><p>Note: This Chatbot was made specifically for C language Inquiries<br> As such try to keep the inquiries within the range of the topic</p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;

    stored_Context_List = localStorage.getItem('Stored-Context');
    context_list = JSON.parse(stored_Context_List);

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDataFromLocalStorage();

const createElement = (html, className) => { 
    // Create and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions"
    const pElement = document.createElement("p");

    //Get context from the previous prompts
    // for({answer,question} of subset){
    //     context_string += question_Sequence + question + answer_Sequence + answer;
    // }
    context_string = question_Sequence + userText + answer_Sequence;
    promptText = default_String + context_string;
    console.log(promptText);


    // Define the properties and the data for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "curie:ft-personal-2023-06-05-12-37-36", //"text-curie-001", 
            prompt: promptText,
            temperature: 0.6,
            max_tokens: 250,
            top_p: 0.3,
            frequency_penalty: 0.3,
            presence_penalty: 0.6,
            n: 1,
            stop: 'Q: '
        })
    }

    // Send POST request to API, get response and set the response as paragraph element
    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
        console.log(pElement.textContent);
    } catch(error) {
        pElement.classList.add("Error");
        pElement.textContent = "Oops!, Something went wrong while retrieving a response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chat
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);

    // context_list.push(userText,pElement.textContent);
    // console.log(context_list);
    // Stored_context = JSON.stringify(context_list);
    // localStorage.setItem('Stored-Context', Stored_context);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000)
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/bot.jpg" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;

    // Create an incoming chat div with typing animation and append it to the chat container
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const outgoingChatFilter = (userInput) => {

    const action_Keywords = ['Generate', 'generate', 'Give', 'give', 'Provide', 'provide', 'Produce', 'produce', 'Make', 'make', 'Write', 'write', 'Create', 'create', 'Implement', 'implement', 'Need', 'need', 'Looking', 'looking', 'Identify', 'identify', 'Review', 'review', 'Analyze', 'analyze'];
    const generation_Keywords = ['Code', 'code', 'Program', 'program', 'Snippet', 'snippet', 'Script', 'script', 'Source code', 'source code', 'Algorithm', 'algorithm', 'Command', 'command', 'Instructions', 'instructions', 'Logic', 'logic', 'Syntax', 'syntax', 'Implementation', 'implementation', 'Function', 'function', 'Statement', 'statement'];   
    const coding_Keywords = ['for loop', 'while loop', 'do while loop', 'printf', 'errors', 'bugs', 'issues', 'binary', 'declaration', '{', '#', '<', ';', ':'];
        
    const actionPattern = '(' + action_Keywords.join('|') + ')';
    const generationPattern = '\\b(' + generation_Keywords.join('|') + ')\\b';
    const coding_Filter = '(' + coding_Keywords.join('|') + ')';
        
    const action_Generation_Pattern = new RegExp(actionPattern + '.*' + generationPattern, 'i');
    const action_Coding_Pattern = new RegExp(actionPattern + '.*' + coding_Filter, 'i');
    const generate_Coding_Pattern = new RegExp(generationPattern + '.*' + coding_Filter, 'i');
        
    generation_Filter_Checker = 0;
    code_Filter_Checker = 0;
    flag = 0;
        
    if(action_Generation_Pattern.test(userInput)) {
        generation_Filter_Checker = 1;
    }
        
    if(action_Coding_Pattern.test(userInput)){
        code_Filter_Checker = 1;
    }
        
    if(generate_Coding_Pattern.test(userInput)){
        generation_Filter_Checker = 1;
        code_Filter_Checker = 1;   
    }
        
    if(generation_Filter_Checker == 1 && code_Filter_Checker == 0){
        console.log('Code generation attempt detected! (action_Generation_Pattern Error!)');
        flag = 1;
    }
        
    if(code_Filter_Checker == 1 && generation_Filter_Checker == 0){
        console.log('Code in the prompt detected! (action_Coding_Pattern Error!)');
        flag = 2;
    }
        
    if(generation_Filter_Checker == 1 && code_Filter_Checker == 1){
        console.log('Code generation attempt detected (generate_Coding_Pattern Error!)');
        flag = 3;
    }
    return flag;
}


const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // get chatInput value and remove extra spaces
    if(outgoingChatFilter(userText) != 0){
        userText = ``;
    }
    if(!userText) return; // if chatInput is empty return from here

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.png" alt="user-img">
                        <p></p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container            
    const outgoingChatDiv = createElement(html, "outgoing");  
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv); 
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);   
}

themeButton.addEventListener("click", () => {
    // Toggle body class for theme mode and save the updated theme to local storage
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode"
})

deleteButton.addEventListener("click", () => {
    // Removes the chat from local storage and call loadDataFromStorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
})

chatInput.addEventListener("input", () =>{
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
})

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without shift and the window is larger than 800 pixels, handle the outgoing chat
    if(e.key === "Enter" && !e.shiftkey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
})

sendButton.addEventListener("click", handleOutgoingChat);