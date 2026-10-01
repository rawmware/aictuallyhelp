/* The prompt library. [BRACKETS] = the part you fill in yourself. */
window.PROMPTS = [
  // ---------- Hall of fame ----------
  {
    id: "handoff", cat: "power", fame: true,
    title: "The one-shot handoff",
    text: "Create a markdown file about what I'm about to say, so the next bot will build it for me in one shot.",
    when: "You have a big messy idea. Talk it out, get a clean plan file, then paste that file into a fresh chat and it builds the whole thing.",
  },
  {
    id: "codeblock", cat: "power", fame: true,
    title: "Put it in a box",
    text: "Write this in a code block for me.",
    when: "You need to copy something exactly — an email, a letter, a prompt, a file. The code block gets a copy button and keeps the formatting clean.",
  },
  {
    id: "missing", cat: "power", fame: true,
    title: "The blind-spot check",
    text: "What am I missing from this, and why is it important?",
    when: "Before you send, submit, sign or start anything. It catches what you didn't think of — and tells you why it matters.",
  },

  // ---------- Start here ----------
  {
    id: "hello", cat: "start",
    title: "Your very first message",
    text: "Hi. I'm new to this. Explain what you can help me with in 5 short bullet points. Use simple words.",
    when: "The first time you open ChatGPT, Claude or Gemini.",
  },
  {
    id: "askme", cat: "start",
    title: "Let it interview you",
    text: "Ask me questions one at a time until you understand what I need. Then help me with it.\n\nWhat I need help with: [DESCRIBE IT IN A FEW WORDS]",
    when: "You're not sure how to explain what you want. Let the AI ask.",
  },
  {
    id: "explain", cat: "start",
    title: "Explain it simply",
    text: "Explain [TOPIC] like I'm new to it. Use simple words and one real-life example.",
    when: "Anything that confuses you — credit scores, leases, how a job application works.",
  },
  {
    id: "simpler", cat: "start",
    title: "Too long? Too complicated?",
    text: "Say that again, but shorter and simpler. Use bullet points.",
    when: "The answer was a wall of text. This works on any answer, any time.",
  },
  {
    id: "options", cat: "start",
    title: "Give me options",
    text: "Give me 3 options for [WHAT YOU'RE DECIDING]. For each one, give me the good and the bad. Then tell me which one you'd pick and why.",
    when: "You're stuck on a decision.",
  },

  // ---------- Jobs ----------
  {
    id: "resume", cat: "jobs",
    title: "Resume from scratch",
    text: "Help me write a resume. Ask me about my work history one question at a time. I have some gaps in my history — help me explain them honestly and in a positive way. When you're done, give me the resume in a code block.",
    when: "You don't have a resume, or yours is old. Odd jobs, side work and caregiving all count.",
  },
  {
    id: "match", cat: "jobs",
    title: "Match me to this job",
    text: "Here is a job posting:\n[PASTE THE JOB POSTING]\n\nHere is my experience:\n[LIST YOUR JOBS AND SKILLS]\n\nWhat are they really looking for? Which of my experiences match? What should I say in my application?",
    when: "Before you apply to anything.",
  },
  {
    id: "interview", cat: "jobs",
    title: "Practice interview",
    text: "Pretend you are hiring for a [JOB TITLE] job. Interview me one question at a time. Wait for my answer. After each answer, tell me one thing I did well and one thing to improve.",
    when: "The night before an interview. Do it out loud if you can.",
  },
  {
    id: "record", cat: "jobs",
    title: "Talking about a record",
    text: "I have a criminal record. Help me practice answering questions about it in a job interview. I want my answer to be honest, short, and focused on what I've done since and what I can do now. Ask me about my situation first.",
    when: "You're re-entering the workforce and want to feel ready for the hard question.",
  },
  {
    id: "cover", cat: "jobs",
    title: "Short cover letter",
    text: "Write a short cover letter (under 200 words) for this job: [JOB TITLE AND COMPANY]. About me: [2–3 THINGS ABOUT YOU]. Make it sound like a real person, not a robot. Put it in a code block.",
    when: "The application asks for a cover letter.",
  },

  // ---------- Life admin ----------
  {
    id: "letter", cat: "life",
    title: "What does this letter mean?",
    text: "Explain this letter in plain English. What do they want from me, what's the deadline, and what should I do next?\n\n[PASTE THE LETTER — OR TAKE A PHOTO AND ATTACH IT]",
    when: "Court papers, benefits letters, bills, anything official. Tip: most AI apps let you snap a photo of the page.",
  },
  {
    id: "message", cat: "life",
    title: "Write a polite message",
    text: "Help me write a short, polite message to [WHO — e.g. my landlord, caseworker, boss] about [THE PROBLEM]. I want to sound calm and clear. Give me the message in a code block.",
    when: "You're frustrated but need to stay professional.",
  },
  {
    id: "budget", cat: "life",
    title: "Simple budget",
    text: "I get about $[AMOUNT] a month. My bills are:\n[LIST YOUR BILLS AND AMOUNTS]\n\nMake me a simple budget. Show me where my money goes and where I could save. Keep it simple.",
    when: "Money is tight and you want a clear picture.",
  },
  {
    id: "checklist", cat: "life",
    title: "Make me a checklist",
    text: "Make me a step-by-step checklist for [TASK — e.g. getting a state ID in Ohio]. What documents do I usually need? What should I bring? Keep it short.",
    when: "IDs, benefits, housing applications. Always double-check with the office — rules change.",
  },
  {
    id: "resources", cat: "life",
    title: "Find help near me",
    text: "What kinds of free help exist for [WHAT YOU NEED — e.g. food, housing, legal help] in [YOUR CITY]? Tell me what to search for and who to call. Tell me which info might be out of date.",
    when: "You need resources. Call before you go — AI can be out of date. You can also dial 211 in the US.",
  },

  // ---------- Writing & story ----------
  {
    id: "story", cat: "write",
    title: "Tell my story",
    text: "Help me tell my story. Ask me one question at a time about my life. When we're done, write it in my voice — plain and real, not fancy. Don't add anything I didn't say.",
    when: "Personal statements, applications, or just for you.",
  },
  {
    id: "fixgrammar", cat: "write",
    title: "Fix it, keep my voice",
    text: "Fix the spelling and grammar in this, but keep my words and my voice. Don't make it sound fancy.\n\n[PASTE YOUR WRITING]",
    when: "You wrote something and want it clean before you send it.",
  },
  {
    id: "notes2email", cat: "write",
    title: "Notes → email",
    text: "Turn these messy notes into a clear, short email:\n[PASTE YOUR NOTES]\n\nPut the final email in a code block.",
    when: "You know what to say, but not how to say it.",
  },

  // ---------- Learn ----------
  {
    id: "quiz", cat: "learn",
    title: "Quiz me",
    text: "Quiz me on [TOPIC — e.g. the driver's permit test in my state]. One question at a time. Tell me if I'm right and explain the answer.",
    when: "Studying for a test, a permit, a certification.",
  },
  {
    id: "plan7", cat: "learn",
    title: "7-day learning plan",
    text: "Make me a 7-day plan to learn [SKILL] with 20 minutes a day. Only free resources. Make each day one small step.",
    when: "You want to learn something new without getting overwhelmed.",
  },
  {
    id: "translate", cat: "learn",
    title: "Translate simply",
    text: "Translate this into [LANGUAGE]. Keep it simple and natural, like a real person would say it:\n\n[PASTE TEXT]",
    when: "Talking to someone in another language, or reading a form.",
  },

  // ---------- Build ----------
  {
    id: "website", cat: "build",
    title: "Plan a website",
    text: "I want a simple website for [YOUR IDEA — e.g. my lawn care side business]. Ask me questions one at a time. Then create a markdown file with everything a builder needs to make it in one shot.",
    when: "Step one of building anything. Then paste that file into a new chat.",
  },
  {
    id: "onefile", cat: "build",
    title: "Build it in one file",
    text: "Build this as a single HTML file I can save and open in my browser. Put the whole file in one code block.\n\n[PASTE YOUR MARKDOWN PLAN]",
    when: "Step two. Save the result as index.html and double-click it.",
  },
  {
    id: "broken", cat: "build",
    title: "It's not working",
    text: "It's not working. Here's what I see:\n[PASTE THE ERROR OR DESCRIBE WHAT HAPPENS]\n\nExplain what's wrong in simple words, then give me the fixed version in a code block.",
    when: "Something broke. Don't panic — paste it in.",
  },

  // ---------- Power moves ----------
  {
    id: "askfirst", cat: "power",
    title: "Ask before you answer",
    text: "Before you answer, ask me any questions you need to give me the best answer.",
    when: "Add this to the end of any prompt. Answers get way better.",
  },
  {
    id: "savechat", cat: "power",
    title: "Save this chat",
    text: "Summarize this whole chat as a markdown file I can paste into a new chat to pick up exactly where we left off. Put it in a code block.",
    when: "The chat is getting long, or you want to come back to it tomorrow.",
  },
  {
    id: "honest", cat: "power",
    title: "Be honest, not nice",
    text: "Be honest, not nice. What's the weakest part of this, and how do I fix it?\n\n[PASTE YOUR WORK]",
    when: "You want real feedback, not compliments.",
  },
  {
    id: "doublecheck", cat: "power",
    title: "Double-check yourself",
    text: "Double-check your last answer. What might be wrong or out of date? What should I verify with a real person?",
    when: "Anything about law, health, money or deadlines.",
  },
  {
    id: "aboutme", cat: "power",
    title: "Here's who I am",
    text: "Here's some context about me. Use it for the rest of this chat:\n- Name: [YOUR NAME]\n- Where I'm at right now: [YOUR SITUATION]\n- What I'm working toward: [YOUR GOAL]\n- How I like answers: short and simple",
    when: "Start of a new chat. Keep this in a note on your phone and paste it in.",
  },
];

window.PROMPT_CATS = [
  { id: "all", name: "All" },
  { id: "fame", name: "★ Top 3" },
  { id: "start", name: "Start here" },
  { id: "jobs", name: "Jobs" },
  { id: "life", name: "Life admin" },
  { id: "write", name: "Writing & story" },
  { id: "learn", name: "Learn" },
  { id: "build", name: "Build stuff" },
  { id: "power", name: "Power moves" },
];
