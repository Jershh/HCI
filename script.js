// script.js

const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input button');
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = "your_openai_api_key"; // OpenAI Free APIKey

const userMessages = [
  ["hi", "hey", "hello"],
  ["sure", "yes", "no"],
  ["how can I book a room", "book a room", "make a booking", "reserve a room", "details room"],
  ["tell me about single room", "what is a single room", "describe single room"],
  ["tell me about double room", "what is a double room", "describe double room"],
  ["tell me about junior suite", "what is a junior suite", "describe junior suite"],
  ["tell me about suite", "what is a suite", "describe suite"],
  ["contact details", "how can I contact you", "contact information", "get in touch"]
];

const botReplies = [
  ["Hello! How can I assist you today?", "Hi there! How can I help you?", "Hey! What can I do for you today?"],
  ["Sure thing!", "Absolutely!", "Of course!"],
  ["You can book a room by visiting our website or by calling our reservation desk at 123-456-7890. How else can I assist you?"],
  ["A single room typically has one bed for one person or a couple. These rooms are ideal for solo travelers or business trips and are often more compact. The price is $50 per night. Would you like to know more about our rooms or book one?"],
  ["A double room features two double beds and can accommodate up to four people. It's perfect for friends, business partners, or families with young children. The price is $150 per night. Can I help you with anything else?"],
  ["A junior suite is a smaller suite with a layout that separates the sitting and sleeping areas without completely dividing them into separate rooms. The price is $200 per night. Would you like to hear about other room types or make a reservation?"],
  ["A suite offers spacious accommodations with a kitchenette, dining area, sofa bed, TV, and separate bathrooms. It's ideal for groups who value personal space. The price is $300 per night. Do you need more information or want to book a room?"],
  ["You can contact us at 123-456-7890 or email us at contact@hotel.com. Is there anything else you would like to know?"]
];

const alternativeReplies = [
  "Can I help you with something else?",
  "Is there anything else you need assistance with?",
  "Would you like more information about our accommodations?",
  "Feel free to ask me anything else you need."
];

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  const chatContent = `<p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

const matchUserMessage = (message) => {
  message = message.toLowerCase().replace(/[^\w\s\d]/gi, "").trim();
  for (let i = 0; i < userMessages.length; i++) {
    for (let j = 0; j < userMessages[i].length; j++) {
      if (message.includes(userMessages[i][j])) {
        const replies = botReplies[i];
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
  }
  return alternativeReplies[Math.floor(Math.random() * alternativeReplies.length)];
};

const synth = window.speechSynthesis;

const voiceControl = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  synth.speak(utterance);
};

const generateResponse = (incomingChatLi) => {
  const messageElement = incomingChatLi.querySelector("p");
  const matchedResponse = matchUserMessage(userMessage);

  if (matchedResponse) {
    messageElement.textContent = matchedResponse;
    voiceControl(matchedResponse);
    chatbox.scrollTo(0, chatbox.scrollHeight);
  } else {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    };

    fetch(API_URL, requestOptions)
      .then(res => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then(data => {
        const botReply = data.choices[0].message.content;
        messageElement.textContent = botReply;
        voiceControl(botReply);
      })
      .catch((error) => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again!";
        voiceControl("Oops! Something went wrong. Please try again!");
      })
      .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) {
    return;
  }
  chatbox.appendChild(createChatLi(userMessage, "chat-outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "chat-incoming")
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});

function cancel() {
  let chatbotcomplete = document.querySelector(".chatBot");
  if (chatbotcomplete.style.display !== 'none') {
    chatbotcomplete.style.display = "none";
    let lastMsg = document.createElement("p");
    lastMsg.textContent = 'Thanks for using our Chatbot!';
    lastMsg.classList.add('lastMessage');
    document.body.appendChild(lastMsg);
  }
}
