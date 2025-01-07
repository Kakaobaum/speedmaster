# speedmaster
9. Audio Game - Software Engineering Project

---

# **SpeedMaster - A Rhythm Game for the Visually Impaired**

SpeedMaster is a rhythm-based game designed to provide an engaging and accessible experience for visually impaired players. The game replaces traditional visual cues with audio feedback, allowing players to rely entirely on sound and keyboard controls.

---

## **Features**

### **Core Gameplay**
- Audio cues for rhythm-based gameplay.
- Keyboard controls to match notes (`A`, `S`, `D`, `F`, `G`) with audio cues.
- Scoring system based on timing accuracy ().

### **Accessibility**
- Audio-guided menu navigation with keyboard controls.
- Customizable key mappings for ease of use.
- Clear and distinct audio feedback for game events (correct/incorrect notes, game start/end).

### **Sound Design**
- High-quality instrument sounds for each note.

### **User Interface**
- Fully keyboard navigable.

### **Deployment**
- Live and accessible via web browsers.
- Deployed on Netlify for seamless access.

---

## **How to Play**

1. **Start the Game**:
   - Navigate the menu using arrow keys and select with `Enter`.
   - Press `Space` to start a new game or `T` to enter the tutorial.

2. **During Gameplay**:
   - Listen for audio cues indicating notes (`A`, `S`, `D`, `F`, `G`).
   - Press the corresponding key in time with the sound.
   - Earn points based on timing accuracy and build combo streaks.

3. **End of Game**:
   - View your total score, accuracy percentage, and highest streak.
   - Replay the game or return to the main menu.

---

## **Getting Started**

### **Requirements**
- Node.js and npm installed on your machine.
- A web browser for testing or playing the game.(Brave Browser is a little buggy)

### **Installation**
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/speedmaster.git
   ```
2. Navigate to the project directory:
   ```bash
   cd speedmaster
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### **Running the Game Locally**
1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## **Deployment**

The game is deployed on **Netlify**. Visit the live version here:  
[Live Game URL](https://deluxe-palmier-ccec2f.netlify.app)

To deploy your own version:
1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to Netlify using their drag-and-drop interface or CLI.

---

## **Project Structure**

```
speedmaster-game
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── components
│   │   ├── GameOver.tsx
│   │   ├── MainMenu.tsx
│   │   └── Tutorial.tsx
│   ├── hooks
│   │   └── useAudio.ts
│   ├── App.tsx
│   ├── constants.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── .gitignore
```

---

## **Contributing**

We welcome contributions! If you'd like to enhance SpeedMaster:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.

---

## **Acknowledgments**

- **React**: For the foundation of the game.
- **Netlify**: For providing an easy deployment platform.
- **github copilot**
- **Dominic Dolezal**: For supervisiong us

---
