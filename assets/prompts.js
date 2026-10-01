/* The prompt library. Each entry: [category, use case, prompt, optional tip].
   [BRACKETS] = the part you fill in yourself. */
(function () {
  const RAW = [
    // ---------- Power moves (the big three first) ----------
    ["power", "Turn my idea into a plan another AI can build", "Create a markdown file about what I'm about to say, so the next bot will build it for me in one shot.", "Talk it out messy. Paste the file it gives you into a NEW chat and say “build this.”", true],
    ["power", "Get something clean I can copy", "Write this in a code block for me.", "Works on anything: an email, a letter, a resume. The box gets a copy button.", true],
    ["power", "Catch what I didn't think of", "What am I missing from this, and why is it important?", "Use it before you send, sign, submit or start anything.", true],
    ["power", "Get way better answers", "Before you answer, ask me any questions you need to give me the best answer."],
    ["power", "Pick up where I left off", "Summarize this whole chat as a markdown file I can paste into a new chat to pick up exactly where we left off. Put it in a code block."],
    ["power", "Get honest feedback", "Be honest, not nice. What's the weakest part of this, and how do I fix it?\n\n[PASTE YOUR WORK]"],
    ["power", "Fact-check the AI", "Double-check your last answer. What might be wrong or out of date? What should I verify with a real person?"],
    ["power", "Tell the AI who I am", "Here's some context about me. Use it for the rest of this chat:\n- Name: [YOUR NAME]\n- Where I'm at right now: [YOUR SITUATION]\n- What I'm working toward: [YOUR GOAL]\n- How I like answers: short and simple", "Save this in your phone's notes and paste it at the start of new chats."],
    ["power", "Make it think it through", "Think through this step by step before you answer. Then give me the answer in plain words.\n\n[YOUR QUESTION]"],
    ["power", "Get the expert's answer", "Answer this the way a [EXPERT, e.g. career coach / chef / mechanic] with 20 years of experience would, but explain it in simple words:\n\n[YOUR QUESTION]"],
    ["power", "Compare two choices", "Make a simple table comparing [OPTION A] and [OPTION B]: cost, pros, cons, and which one fits someone like me. My situation: [YOUR SITUATION]"],
    ["power", "Have AI write the prompt for me", "I want help with [YOUR GOAL]. First, write the best possible prompt to get that from you. Then answer that prompt."],
    ["power", "Stress-test my idea", "Argue against my idea as hard as you can. Then tell me which of your points actually matter.\n\nMy idea: [YOUR IDEA]"],
    ["power", "Turn anything into steps", "Turn this into a simple step-by-step checklist I can follow:\n\n[PASTE IT]"],

    // ---------- Start here ----------
    ["start", "Send my very first message", "Hi. I'm new to this. Explain what you can help me with in 5 short bullet points. Use simple words."],
    ["start", "I don't know how to ask", "Ask me questions one at a time until you understand what I need. Then help me with it.\n\nWhat I need help with: [A FEW WORDS]"],
    ["start", "Understand anything", "Explain [TOPIC] like I'm new to it. Use simple words and one real-life example."],
    ["start", "The answer was too long", "Say that again, but shorter and simpler. Use bullet points."],
    ["start", "Still confused", "Explain that like I'm 10 years old."],
    ["start", "Make a decision", "Give me 3 options for [WHAT YOU'RE DECIDING]. For each one, give me the good and the bad. Then tell me which one you'd pick and why."],
    ["start", "See what AI can do for me", "Here's what my day usually looks like: [DESCRIBE YOUR DAY]. Give me 5 ways you could make it easier, starting with the easiest."],
    ["start", "Talk instead of type", "I'm going to talk out loud and it might be messy. Clean up what I say into clear notes, then ask me what I want to do with them.", "Tap the microphone in the app and just talk."],

    // ---------- Emails & messages ----------
    ["write", "Write a professional email", "Write an email to [WHO] about [WHAT]. Make it sound professional, intelligent and respectful. Keep it under 150 words. Put it in a code block."],
    ["write", "Reply to an email", "Help me reply to this email. I want to say: [YOUR ANSWER IN A FEW WORDS]. Keep it polite and short. Put it in a code block.\n\nThe email: [PASTE IT]"],
    ["write", "Say no politely", "Help me say no to [THE REQUEST] politely, without over-explaining. Give me 2 versions: one friendly, one firm."],
    ["write", "Follow up when no one answers", "Write a short, polite follow-up email. I sent [WHAT] to [WHO] on [DATE] and haven't heard back. Put it in a code block."],
    ["write", "Calm down an angry message", "I'm upset and I wrote this message. Rewrite it so it's calm and clear, but still says what I need:\n\n[PASTE YOUR MESSAGE]"],
    ["write", "Fix my writing, keep my voice", "Fix the spelling and grammar in this, but keep my words and my voice. Don't make it sound fancy.\n\n[PASTE YOUR WRITING]"],
    ["write", "Turn messy notes into an email", "Turn these messy notes into a clear, short email. Put it in a code block.\n\n[PASTE YOUR NOTES]"],
    ["write", "Make it a text, not an essay", "Turn this into a short text message, under 40 words:\n\n[PASTE IT]"],
    ["write", "Write a real apology", "Help me write a real apology to [WHO] for [WHAT HAPPENED]. No excuses, no fancy words. Short."],
    ["write", "Say thank you", "Write a short thank-you note to [WHO] for [WHAT THEY DID]. Warm, not cheesy."],
    ["write", "Ask for something I need", "Help me ask [WHO] for [WHAT YOU NEED]. Explain why it matters in one or two sentences. Respectful, confident and short."],
    ["write", "Make a complaint that gets results", "Write a firm, respectful complaint to [COMPANY] about [THE PROBLEM]. Include what happened, when, and what I want them to do about it. Put it in a code block."],
    ["write", "Tell my story", "Help me tell my story. Ask me one question at a time about my life. When we're done, write it in my voice — plain and real, not fancy. Don't add anything I didn't say."],

    // ---------- Jobs & work ----------
    ["jobs", "Write a resume from scratch", "Help me write a resume. Ask me about my work history one question at a time. I have some gaps — help me explain them honestly and in a positive way. When you're done, give me the resume in a code block."],
    ["jobs", "Fix up my old resume", "Here's my resume. Update it for [KIND OF JOB] jobs. Use strong action words, keep it to one page, and don't add anything untrue. Put it in a code block.\n\n[PASTE YOUR RESUME]"],
    ["jobs", "Turn odd jobs into real skills", "I've done [ODD JOBS, SIDE WORK, CAREGIVING, VOLUNTEERING]. What real job skills does that show? Write them as resume bullet points."],
    ["jobs", "Find jobs that fit me", "I'm good at [SKILLS] and I like [THINGS YOU ENJOY]. I live in [CITY] and [I have / don't have] a car. Suggest 10 jobs I could realistically get soon, and roughly what each pays."],
    ["jobs", "Match myself to a job posting", "Here is a job posting:\n[PASTE IT]\n\nHere is my experience:\n[YOUR JOBS AND SKILLS]\n\nWhat are they really looking for? Which of my experiences match? What should I say in my application?"],
    ["jobs", "Write a cover letter", "Write a short cover letter (under 200 words) for [JOB TITLE] at [COMPANY]. About me: [2–3 THINGS ABOUT YOU]. Make it sound like a real person, not a robot. Put it in a code block."],
    ["jobs", "Practice an interview", "Pretend you're hiring for a [JOB TITLE] job. Interview me one question at a time and wait for my answer. After each answer, tell me one thing I did well and one thing to improve."],
    ["jobs", "Explain a gap in my work history", "I wasn't working from [WHEN] to [WHEN] because [THE REASON, or just “personal reasons”]. Give me a short, honest, positive way to explain it in an interview."],
    ["jobs", "Talk about a record", "I have a criminal record. Help me practice answering questions about it in a job interview. I want my answer to be honest, short, and focused on what I've done since. Ask me about my situation first."],
    ["jobs", "Thank them after the interview", "Write a short thank-you email to [NAME] after my interview for [JOB] today. Mention [ONE THING YOU TALKED ABOUT]. Put it in a code block."],
    ["jobs", "Get ready for my first day", "I start a new job as a [JOB] on [DAY]. What should I bring, wear and ask? What do people usually mess up in the first week?"],
    ["jobs", "Ask for a raise", "Help me ask my boss for a raise. I've been here [HOW LONG] and I've [WHAT YOU'VE DONE WELL]. Tell me what to say, word for word, and what to say if they say no."],
    ["jobs", "Write my LinkedIn profile", "Write a LinkedIn headline and a short “About” section for me. I [WHAT YOU DO OR WANT TO DO]. Make it sound human, not corporate."],

    // ---------- Money ----------
    ["money", "Make a simple budget", "I get about $[AMOUNT] a month. My bills are:\n[YOUR BILLS AND AMOUNTS]\n\nMake me a simple budget. Show me where my money goes and where I could save."],
    ["money", "Make a plan to pay off debt", "I owe:\n[EACH DEBT, AMOUNT AND INTEREST RATE]\n\nI can pay about $[AMOUNT] a month. Make me a plan to pay it off. Which should I pay first, and why?"],
    ["money", "Eat well on a tight budget", "I have $[AMOUNT] a week for food for [NUMBER] people. Make me a cheap, healthy meal plan for the week with a shopping list."],
    ["money", "Understand my credit score", "Explain credit scores in simple words. What hurts them, what helps them, and what are 3 things I can do this month to improve mine?"],
    ["money", "Check if something is a scam", "Is this a scam? Tell me the red flags and what I should do.\n\n[PASTE THE MESSAGE, EMAIL OR OFFER]", "Never send money or gift cards to someone because a message told you to."],
    ["money", "Find benefits I might qualify for", "I live in [STATE]. My situation: [INCOME, WHO LIVES WITH YOU, ANYTHING ELSE]. What government or nonprofit benefits might I qualify for? How do I apply and what should I bring?", "Rules change. Confirm with the office or call 211."],
    ["money", "Understand my paycheck", "Explain my pay stub in simple words. What are all these deductions?\n\n[PASTE IT, OR ATTACH A PHOTO]"],
    ["money", "Lower a bill", "Write me a short script to call [COMPANY] and ask to lower my bill or set up a payment plan. The bill is $[AMOUNT]. My situation: [A FEW WORDS]."],
    ["money", "Figure out taxes", "Explain in simple words whether I need to file taxes this year and how I can do it for free. My situation: [YOUR JOB / INCOME SITUATION]."],

    // ---------- Life admin ----------
    ["life", "Understand a confusing letter", "Explain this letter in plain English. What do they want from me, what's the deadline, and what should I do next?\n\n[PASTE THE LETTER, OR ATTACH A PHOTO]", "Most AI apps let you snap a photo of the page."],
    ["life", "Fill out a form", "I need to fill out this form. Go through it with me one question at a time and explain what each part is asking.\n\n[PASTE IT, OR ATTACH A PHOTO]"],
    ["life", "Message my landlord", "Write a message to my landlord about [THE PROBLEM]. Be calm and clear, include the date it started, and ask for it to be fixed by [DATE]. Put it in a code block.", "Send it in writing (text or email) so you have a record."],
    ["life", "Make a checklist for a task", "Make me a step-by-step checklist for [TASK, e.g. getting a state ID in Ohio]. What documents do I usually need? Keep it short.", "Double-check with the office — rules change."],
    ["life", "Find help near me", "What kinds of free help exist for [FOOD / HOUSING / LEGAL HELP / ETC.] in [YOUR CITY]? Tell me what to search for and who to call. Tell me which info might be out of date.", "Call before you go. In the US you can also dial 211."],
    ["life", "Get ready for an appointment", "I have an appointment with [CASEWORKER / COURT / LANDLORD / ETC.] about [WHAT]. What questions should I ask, and what should I bring?"],
    ["life", "Know my rights", "What are my basic rights as a [TENANT / WORKER / ETC.] in [STATE] when [YOUR SITUATION]? Explain it simply and tell me where to get free legal help.", "This isn't legal advice. Confirm with legal aid."],
    ["life", "Plan my week", "Here's everything I need to do this week:\n[YOUR LIST]\n\nMake me a simple day-by-day plan. Put the most important things first."],
    ["life", "Put dates in my calendar", "Pull every date, time and place out of this and list them so I can add them to my phone calendar:\n\n[PASTE THE TEXT]"],
    ["life", "Make a scary phone call easier", "I'm nervous about calling [WHO] about [WHAT]. Write me a short script of what to say, and what to say if they ask [A QUESTION YOU'RE WORRIED ABOUT]."],
    ["life", "Plan a move", "Make me a checklist for moving to a new place. Moving date: [DATE]. Things to know: [PETS, KIDS, NO CAR, ETC.]."],

    // ---------- Health & mind ----------
    ["health", "Get ready for a doctor visit", "I have a doctor's appointment about [WHAT'S GOING ON]. Help me write a short list of what to tell them and what to ask.", "AI isn't a doctor. Use it to prepare, not to diagnose."],
    ["health", "Understand a diagnosis", "My doctor said I have [CONDITION]. Explain it in simple words. What questions should I ask at my next visit?"],
    ["health", "Break a big goal into tiny steps", "I want to [BIG GOAL] but it feels overwhelming. Break it into tiny steps. The first one should take less than 5 minutes."],
    ["health", "Sort through a hard day", "I'm having a hard day. Help me sort through what's going on, then help me figure out one small thing I can do next.", "If you're in crisis in the US, call or text 988, any time."],
    ["health", "Plan a hard conversation", "I need to talk to [WHO] about [WHAT]. Help me plan what to say, how they might react, and how to stay calm."],
    ["health", "Build a simple routine", "Help me build a simple morning routine. I wake up at [TIME], I need to leave by [TIME], and I want to [GOAL]."],
    ["health", "Work out with no gym", "Make me a 15-minute workout I can do with no equipment, in a small space. I'm a beginner."],

    // ---------- Learn ----------
    ["learn", "Get quizzed", "Quiz me on [TOPIC]. One question at a time. Tell me if I'm right and explain the answer."],
    ["learn", "Learn a skill in a week", "Make me a 7-day plan to learn [SKILL] with 20 minutes a day. Only free resources. Make each day one small step."],
    ["learn", "Study for the GED", "Help me study for the GED [SUBJECT] test. Start by testing what I know with 5 questions, then teach me what I got wrong."],
    ["learn", "Learn computer basics", "Teach me basic computer skills one lesson at a time: files, folders, copy and paste, email attachments. Give me one small task per lesson."],
    ["learn", "Summarize something long", "Summarize this in 5 bullet points, then tell me the one thing I should remember:\n\n[PASTE IT]"],
    ["learn", "Understand the news", "Explain this news story in simple words. Why does it matter to regular people?\n\n[PASTE IT OR NAME THE TOPIC]"],
    ["learn", "Translate something", "Translate this into [LANGUAGE]. Keep it simple and natural, like a real person would say it:\n\n[PASTE IT]"],
    ["learn", "Practice English", "Help me practice English. Talk with me about [A TOPIC YOU LIKE]. After each of my messages, gently correct my mistakes."],
    ["learn", "Learn by doing", "I want to learn [SKILL]. Give me one small, real project I can finish this week to practice it."],
    ["learn", "Know a new word", "What does [WORD] mean? Use it in 2 example sentences."],

    // ---------- Build stuff ----------
    ["build", "Plan a website", "I want a simple website for [YOUR IDEA, e.g. my lawn care business]. Ask me questions one at a time. Then create a markdown file with everything a builder needs to make it in one shot."],
    ["build", "Build a website in one file", "Build this as a single HTML file I can save and open in my browser. Put the whole file in one code block.\n\n[PASTE YOUR MARKDOWN PLAN]", "Save the result as index.html and double-click it."],
    ["build", "Put my website online with my own domain", "I have a website file (index.html). Walk me through putting it online one step at a time: upload it to a free GitHub repository, connect GitHub to Vercel so it goes live, then connect a domain I buy (like mysite.com) to Vercel. Wait for me to say “done” before each next step.", "Full guide: the “Make a website” page on this site."],
    ["build", "Fix something that broke", "It's not working. Here's what I see:\n[PASTE THE ERROR, OR DESCRIBE WHAT HAPPENS]\n\nExplain what's wrong in simple words, then give me the fixed version in a code block."],
    ["build", "Plan an app idea", "I have an idea for an app that [WHAT IT DOES]. Ask me 5 questions, then write a markdown file describing it so another AI can build it."],
    ["build", "Make a tracker for my phone", "Make me a simple tracker as a single HTML file I can open on my phone, for tracking [HABITS / MONEY / JOB APPLICATIONS]. Save the data on my device. Put it in one code block."],
    ["build", "Make a printable flyer", "Make a simple flyer for [EVENT OR BUSINESS]: headline, details, and what to do next. Build it as a single HTML file I can print. Put it in a code block."],
    ["build", "Write a spreadsheet formula", "I have a spreadsheet with these columns: [DESCRIBE THEM]. Write me the formula to [WHAT YOU WANT]. Tell me exactly where to paste it."],
    ["build", "Understand some code", "Explain what this code does, line by line, like I've never coded before:\n\n[PASTE THE CODE]"],

    // ---------- Side hustle ----------
    ["biz", "Start a side hustle", "I have [SKILLS AND TOOLS] and about $[AMOUNT] to start. Give me 5 side hustle ideas I could start this month, how much each could make, and the first 3 steps for each."],
    ["biz", "Price my work", "I do [YOUR SERVICE] in [CITY]. How should I price it? Give me a simple price list and explain why."],
    ["biz", "Name my business", "Give me 10 name ideas and a short tagline for my [TYPE OF BUSINESS]. Simple and easy to remember."],
    ["biz", "Write social media posts", "Write 3 short social media posts for my [BUSINESS] about [WHAT'S NEW]. Friendly, with a clear next step for the reader."],
    ["biz", "Reply to a customer", "Help me reply to this customer professionally and kindly. Put it in a code block.\n\n[PASTE THEIR MESSAGE]"],
    ["biz", "Write a one-page business plan", "Write a one-page business plan for [YOUR IDEA] in plain English: who it's for, what I sell, my prices, my costs, and how I'll find customers."],

    // ---------- Family ----------
    ["family", "Help my kid with homework", "My kid is working on [SUBJECT OR PROBLEM]. Help me explain it to them without just giving them the answer."],
    ["family", "Make up a bedtime story", "Write a 3-minute bedtime story for a [AGE]-year-old who loves [THEIR FAVORITE THING]."],
    ["family", "Find free things to do", "What are free or cheap things to do with kids in [CITY] this weekend?", "Check hours before you go."],
    ["family", "Write a note to a teacher", "Write a short, polite note to my child's teacher about [WHAT'S GOING ON]. Put it in a code block."],
  ];

  const used = {};
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
  window.PROMPTS = RAW.map(([cat, title, text, tip, fame]) => {
    let id = slug(title);
    if (used[id]) id += "-" + ++used[id]; else used[id] = 1;
    return { id, cat, title, text, tip: tip || "", fame: !!fame };
  });

  window.PROMPT_CATS = [
    { id: "all", name: "All" },
    { id: "fame", name: "★ Top 3" },
    { id: "start", name: "Start here" },
    { id: "write", name: "Emails & messages" },
    { id: "jobs", name: "Jobs" },
    { id: "money", name: "Money" },
    { id: "life", name: "Life admin" },
    { id: "health", name: "Health & mind" },
    { id: "learn", name: "Learn" },
    { id: "build", name: "Build stuff" },
    { id: "biz", name: "Side hustle" },
    { id: "family", name: "Family" },
    { id: "power", name: "Power moves" },
  ];
})();
