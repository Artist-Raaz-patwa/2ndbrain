
import { GoogleGenAI, FunctionDeclaration, Type, Tool, GenerateContentResponse } from "@google/genai";

// --- CREATE Tools ---

const addNoteTool: FunctionDeclaration = {
  name: "addNote",
  description: "Create a new note.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Note title" },
      content: { type: Type.STRING, description: "Note content" },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "content"],
  },
};

const addEventTool: FunctionDeclaration = {
  name: "addEvent",
  description: "Schedule a calendar event.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      date: { type: Type.STRING, description: "YYYY-MM-DD" },
      startTime: { type: Type.STRING, description: "HH:mm" },
      durationMinutes: { type: Type.NUMBER },
      description: { type: Type.STRING },
    },
    required: ["title", "date", "startTime"],
  },
};

const addHabitTool: FunctionDeclaration = {
    name: "addHabit",
    description: "Add a new daily habit.",
    parameters: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING } },
        required: ["title"]
    }
};

const addTransactionTool: FunctionDeclaration = {
  name: "addTransaction",
  description: "Record an expense or income.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER },
      type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
      category: { type: Type.STRING },
      description: { type: Type.STRING },
    },
    required: ["amount", "type", "category"],
  },
};

const addBankAccountTool: FunctionDeclaration = {
    name: "addBankAccount",
    description: "Add a new bank account or credit card to the wallet.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            bankName: { type: Type.STRING, description: "Bank name e.g. Chase, Amex" },
            accountName: { type: Type.STRING, description: "Nickname e.g. Sapphire Reserve" },
            type: { type: Type.STRING, enum: ["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT", "CASH"] },
            balance: { type: Type.NUMBER },
            last4: { type: Type.STRING, description: "Last 4 digits of account number" }
        },
        required: ["bankName", "type", "balance"]
    }
};

const addContactTool: FunctionDeclaration = {
  name: "addContact",
  description: "Add a new CRM contact.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      email: { type: Type.STRING },
      company: { type: Type.STRING },
      status: { type: Type.STRING, enum: ["LEAD", "CLIENT", "PARTNER", "INACTIVE"] },
    },
    required: ["name"],
  },
};

const addProjectTool: FunctionDeclaration = {
    name: "addProject",
    description: "Create a new project.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            clientName: { type: Type.STRING },
            budget: { type: Type.NUMBER },
            deadline: { type: Type.STRING },
            description: { type: Type.STRING }
        },
        required: ["title"]
    }
};

const addTaskToProjectTool: FunctionDeclaration = {
    name: "addTaskToProject",
    description: "Add a task to a project.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            projectTitle: { type: Type.STRING },
            taskTitle: { type: Type.STRING },
            amount: { type: Type.NUMBER }
        },
        required: ["projectTitle", "taskTitle"]
    }
};

// --- UPDATE & DELETE Tools ---

const updateNoteTool: FunctionDeclaration = {
    name: "updateNote",
    description: "Update an existing note. Finds note by title.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            currentTitle: { type: Type.STRING, description: "The title of the note to search for." },
            newTitle: { type: Type.STRING, description: "Optional new title." },
            appendContent: { type: Type.STRING, description: "Text to append to the existing content." },
            replaceContent: { type: Type.STRING, description: "Text to replace the entire content." }
        },
        required: ["currentTitle"]
    }
};

const deleteNoteTool: FunctionDeclaration = {
    name: "deleteNote",
    description: "Delete a note by title.",
    parameters: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING } },
        required: ["title"]
    }
};

const updateTaskTool: FunctionDeclaration = {
    name: "updateTask",
    description: "Update a task's status or details. Finds task by title.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskTitle: { type: Type.STRING, description: "The exact task title to find." },
            newStatus: { type: Type.STRING, enum: ["TODO", "IN_PROGRESS", "DONE"] },
            markCompleted: { type: Type.BOOLEAN },
            newTitle: { type: Type.STRING }
        },
        required: ["taskTitle"]
    }
};

const deleteTaskTool: FunctionDeclaration = {
    name: "deleteTask",
    description: "Delete a task by title.",
    parameters: {
        type: Type.OBJECT,
        properties: { taskTitle: { type: Type.STRING } },
        required: ["taskTitle"]
    }
};

const updateEventTool: FunctionDeclaration = {
    name: "updateEvent",
    description: "Reschedule or rename an event.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            currentTitle: { type: Type.STRING },
            newDate: { type: Type.STRING, description: "YYYY-MM-DD" },
            newTime: { type: Type.STRING, description: "HH:mm" },
            newTitle: { type: Type.STRING }
        },
        required: ["currentTitle"]
    }
};

const deleteEventTool: FunctionDeclaration = {
    name: "deleteEvent",
    description: "Cancel/Delete an event by title.",
    parameters: {
        type: Type.OBJECT,
        properties: { title: { type: Type.STRING } },
        required: ["title"]
    }
};

const updateFileTool: FunctionDeclaration = {
    name: "updateFile",
    description: "Modify a file's content.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileName: { type: Type.STRING },
            content: { type: Type.STRING },
            operation: { type: Type.STRING, enum: ["APPEND", "OVERWRITE"], description: "Defaults to APPEND" }
        },
        required: ["fileName", "content"]
    }
};

const deleteFileTool: FunctionDeclaration = {
    name: "deleteFile",
    description: "Delete a file or folder.",
    parameters: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING } },
        required: ["name"]
    }
};

const tools: Tool[] = [{
  functionDeclarations: [
      addNoteTool, updateNoteTool, deleteNoteTool,
      addEventTool, updateEventTool, deleteEventTool,
      addTransactionTool, addBankAccountTool,
      addContactTool,
      addHabitTool,
      addProjectTool, addTaskToProjectTool, updateTaskTool, deleteTaskTool,
      updateFileTool, deleteFileTool
  ]
}];

// --- Service ---

export class GeminiService {
  private primaryModelId = "gemini-2.5-flash";
  
  async sendMessage(
    history: { role: 'user' | 'model', text: string }[], 
    newMessage: string,
    onToolCall: (name: string, args: any) => Promise<any>,
    fileContext: string = "",
    userName: string = "User",
    currency: string = "$",
    bankContext: string = "" // New context for bank info
  ): Promise<string> {
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found.");

    // Clean history
    let validHistory: { role: 'user' | 'model', parts: [{ text: string }] }[] = [];
    let expectingRole: 'user' | 'model' = 'user';
    let startIndex = 0;
    while (startIndex < history.length && history[startIndex].role !== 'user') startIndex++;

    for (let i = startIndex; i < history.length; i++) {
        const msg = history[i];
        if (msg.role === expectingRole) {
            validHistory.push({
                role: msg.role,
                parts: [{ text: msg.text || "" }]
            });
            expectingRole = expectingRole === 'user' ? 'model' : 'user';
        }
    }
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') validHistory.pop();

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
        model: this.primaryModelId,
        config: {
            systemInstruction: `You are 2ndBrain, a powerful AI OS for ${userName}.
            
            CAPABILITIES:
            - You can CREATE, UPDATE, and DELETE Notes, Events, Tasks, Projects, and Files.
            - You can manage finances including Transactions and Bank Accounts.
            - If the user asks to "change", "modify", or "reschedule", use the Update tools.
            - If the user asks to "remove" or "cancel", use the Delete tools.
            - The user's preferred currency is ${currency}.
            
            CONTEXT:
            ${fileContext ? `\nUSER FILES:\n${fileContext}` : ''}
            ${bankContext ? `\nBANK ACCOUNTS:\n${bankContext}` : ''}
            
            The current date is ${new Date().toISOString().split('T')[0]}.
            
            When updating items, you need to identify them by their Title/Name. If you are unsure which item to update, ask the user for clarification.`,
            tools: tools
        },
        history: validHistory
    });

    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
        const calls = result.functionCalls;
        
        if (calls && calls.length > 0) {
            const functionResponses = [];
            for (const call of calls) {
                const { name, args, id } = call;
                console.log(`🤖 Tool: ${name}`, args);
                
                let toolResult;
                try {
                    toolResult = await onToolCall(name, args);
                } catch (e: any) {
                    console.error("Tool error", e);
                    toolResult = { error: e.message || "Failed to execute" };
                }
                
                functionResponses.push({
                    name: name,
                    response: { result: toolResult },
                    id: id
                });
            }

            const nextResponse = await chat.sendMessage({
                 message: functionResponses.map(fr => ({ functionResponse: fr }))
            });
            return nextResponse.text || "Done.";
        }

        return result.text || "Processed.";

    } catch (error: any) {
        console.error("Gemini Error:", error);
        return "I encountered a connection error. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();
