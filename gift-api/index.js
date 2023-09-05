const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Modify the conversation based on user responses
// const getConversation = (userMessage) => {
//   const conversation = [];

//   if (!userMessage) {
//     // Initial prompt
//     conversation.push({
//       role: "assistant",
//       content: "What is the occasion for the gift?",
//     });
//   } else {
//     // User response handling based on previous questions
//     conversation.push({ role: "user", content: userMessage });

//     // Add logic here to determine the next question based on user's response
//     // For example, based on the response to the occasion, you can decide the next question.
//     // Here's a basic example:
//     if (userMessage.includes("birthday")) {
//       conversation.push({
//         role: "assistant",
//         content: "Great! Who is the recipient of the gift?",
//       });
//     } else if (userMessage.includes("anniversary")) {
//       conversation.push({
//         role: "assistant",
//         content: "Lovely! Who is the gift for?",
//       });
//     } else {
//       // Default follow-up question
//       conversation.push({
//         role: "assistant",
//         content: "Please provide more details or preferences for the gift.",
//       });
//     }
//   }

//   return conversation;
// };

app.post("/more-questions", async (req, res) => {
  const { message } = req.body;

  // Create a starting message.
  let startingMessage = null;

  if (message[6].answer.includes("No") && message[4].answer.includes("Yes")) {
    // If the user does not know of any problem, ask for hobbies or interests.
    startingMessage =
      "Based on the questions that are answered by the user, provide another set of questions relating to hobies or interests that can help improve the accuracy when suggesting a suitable gift for the described person.\n Provide a response in the following format: 1. [question]\n\n User Response:\n";
  } else if (
    message[6].answer.includes("Yes") &&
    message[4].answer.includes("No")
  ) {
    // If the user knows of a problem, ask for more details about the problem.
    startingMessage =
      "Based on the questions that are answered by the user, provide another set of questions relating to the problem faced by the user that can help improve the accuracy when suggesting a suitable gift for the described person.\n Provide a response in the following format: 1. [question] newline\n\n User Response:\n";
  } else {
    startingMessage =
      "Based on the questions that are answered by the user, provide another set of questions that can help improve the accuracy when suggesting a suitable gift for the described person.\n Provide a response in the following format: 1. [question] newline\n\n User Response:\n";
  }

  // Format the question-response pairs into a single string.
  const formattedMessages = message.map((item, index) => {
    return `Question ${index + 1}: ${item.question}\nAnswer: ${item.answer}\n`;
  });

  const formattedMessageString = startingMessage + formattedMessages.join("\n");

  // Send the conversation to OpenAI's GPT-3.5-turbo model.
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: formattedMessageString }],
  });

  // Extract the response message from the model's reply.
  const responseMessage = completion.choices[0].message.content;

  // Format the response into an array of strings.
  const responseArray = responseMessage.split("\n");

  console.log(responseArray);

  // Send the response message to the client.
  res.json({ improvedQuestions: responseArray });
});

// Define a new route for generating improved questions.
app.post("/suggest-gift", async (req, res) => {
  const { generalQuestions, additionalQuestions } = req.body;

  // Create a message to request top 10 product suggestions and specify the format.
  const startingMessage =
    "Based on the answers of the user on the given general and additonal questions, give the top 3 specific gift suggestions in the following format:\n1. [Gift Suggestion 1] - [explanation]\n2. [Gift Suggestion 2] - [explanation]\n3. [Gift Suggestion 3] - [explanation]\n\nUser Response for General Questions:\n";

  // Format the general questions into a single string.
  const formattedGeneralQuestions = generalQuestions.map((item, index) => {
    return `Question ${index + 1}: ${item.question}\nAnswer: ${item.answer}\n`;
  });

  const addtionalHeading = "\nUser Response for Additional Questions:\n";

  // Format the additional questions into a single string.
  const formattedAdditionalQuestions = additionalQuestions.map(
    (item, index) => {
      return `Question ${index + 1}: ${item.question}\nAnswer: ${
        item.answer
      }\n`;
    }
  );

  // Combine the general and additional questions into a single string.
  const formattedMessageString =
    startingMessage +
    formattedGeneralQuestions.join("\n") +
    addtionalHeading +
    formattedAdditionalQuestions.join("\n");

  // Send the conversation to OpenAI's GPT-3.5-turbo model to generate improved questions.
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: formattedMessageString }],
  });

  // Extract the response message from the model's reply.
  const responseMessage = completion.choices[0].message.content;

  // Format the response into an array of strings.
  const responseArray = responseMessage.split("\n");

  console.log(responseMessage);
  console.log(responseArray);

  // Send the improved questions to the client.
  res.json({ suggestions: responseArray });
});

const port = 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
