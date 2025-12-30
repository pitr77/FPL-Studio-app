# Collaboration rules
 
## How we work together
 
- Always specify the **exact file path** for every change (e.g. `App.tsx`, `app/login/page.tsx`).
- When suggesting an edit, provide **copy/paste-ready blocks** with **surrounding context**.
- Prefer instructions in the form: **“Find this exact block → replace with this exact block”**.
- Avoid `...` placeholders in code snippets. If a match might be ambiguous (e.g. multiple `<h1>`), include **unique nearby lines** so the block is easy to find.
- Avoid vague placement words (“at the start”, “somewhere above”). Use concrete anchors (exact lines to find).
- Explain briefly **why** we are doing the change (1–3 sentences).
- If a change is big/risky, the assistant can do it; otherwise provide step-by-step instructions for the user to apply.
 
## Definition of done (for small steps)
 
- The page compiles (no Next/TS errors).
- The changed flow is tested manually (e.g. login, logout, locked section behavior).