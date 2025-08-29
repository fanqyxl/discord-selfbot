# Discord Self Bot

Selfbot for discord that adds a bunch of QoL features.

## Setup

1. Install Deps:
   ```bash
   pnpm install
   ```

2. Configure:
   - Copy the `.example.env` file and add your discord token
   - Set your command prefix (default is `!`)

3. Getting Token:
   - Open discord in the app / browser
   - Press `ctrl+shift+i` to open developer console
   - [go to the console tab and paste this code:](https://github.com/aiko-chan-ai/discord.js-selfbot-v13?tab=readme-ov-file#get-token-)
   ```javascript
   window.webpackChunkdiscord_app.push([
       [Symbol()],
       {},
       req => {
           if (!req.c) return;
           for (let m of Object.values(req.c)) {
               try {
                   if (!m.exports || m.exports === window) continue;
                   if (m.exports?.getToken) return copy(m.exports.getToken());
                   for (let ex in m.exports) {
                       if (m.exports?.[ex]?.getToken && m.exports[ex][Symbol.toStringTag] !== 'IntlMessagesProxy') return copy(m.exports[ex].getToken());
                   }
               } catch {}
           }
       },
   ]);
   
   window.webpackChunkdiscord_app.pop();
   console.log('%cWorked!', 'font-size: 50px');
   console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
   ```

4. Run:
   ```bash
   pnpm start
   ```

## Note

uhh selfbots something something against discord TOS