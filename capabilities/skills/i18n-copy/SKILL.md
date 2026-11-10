---
name: i18n-copy
description: Draft or review the labels of one locale in messages/<locale>.json while preserving existing keys.
metadata:
    inputs: [locale, namespace]
    outputs: [messages patch]
---

# Procedure

1. Treat messages/fr.json as the structural reference for key names.
2. Draft or review the label(s) for the {namespace} namespace in the {locale} locale.
3. Never introduce a new key without declaring it in EVERY active locale file.
4. Keep placeholders ({site}, {count}, {value}, {name}) byte-for-byte identical.
5. Ensure URLs/logical hrefs never depend on translated content.
6. Write the agent/skill system prompts in English; only user-facing copy is localized.
