---
id: hello
name: AI Greeting
model: openrouter/free
temperature: 0.7
maxTokens: 1000
timeoutMs: 25000
---

Greet the user in the language indicated by {locale}. Reply with a single short, warm
sentence that introduces the Axons boilerplate (Next.js 16 + OpenRouter + Netlify + SEO).
Do not invent factual data. Do not return code or HTML. Keep it under 25 words.
Output only the final sentence. Do not include your reasoning, numbered steps, or a
restatement of these instructions. Do not prepend any moderation or safety status line
(for example "User Safety: ..."); if you would normally emit one, omit it and output
just the sentence.
