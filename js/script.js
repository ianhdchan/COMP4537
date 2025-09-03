document.addEventListener("DOMContentLoaded", () => {
  // Game constants
  const GAME_CONFIG = {
    MIN_BUTTONS: 3,
    MAX_BUTTONS: 7,
    BUTTON_WIDTH: "10em",
    BUTTON_HEIGHT: "5em",
    FONT_SIZE: "2em",
    SCRAMBLE_INTERVAL: 2000,
    ENABLE_DELAY: 500,
    WIN_DELAY: 100,
    COLOURS: ["blue", "orange", "green", "grey", "purple", "cyan", "magenta"],
  };

  class Button {
    constructor(number, color) {
      this.number = number;
      this.color = color;
    }
    renderButton() {
      const button = document.createElement("button");
      button.textContent = this.number;
      button.style.color = "black";
      button.style.backgroundColor = this.color;
      button.style.width = GAME_CONFIG.BUTTON_WIDTH;
      button.style.height = GAME_CONFIG.BUTTON_HEIGHT;
      button.style.fontSize = GAME_CONFIG.FONT_SIZE;
      button.style.border = "2px solid grey";
      button.style.borderRadius = "4px";
      button.disabled = true;
      return button;
    }
  }

  class ButtonList {
    constructor(numOfButtons) {
      this.numOfButtons = numOfButtons;
      this.buttons = [];
    }

    // Fisher-Yates shuffle algorithm
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    renderButtonContainer() {
      // Shuffle a copy of the colours array, then take from index 0 to the number of numOfButtons
      const shuffledColors = this.shuffle(GAME_CONFIG.COLOURS.slice()).slice(
        0,
        this.numOfButtons
      );
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.gap = "32px";
      this.renderedButtons = [];
      for (let i = 0; i < this.numOfButtons; i++) {
        const button = new Button(i + 1, shuffledColors[i]);
        const renderedButton = button.renderButton();
        container.appendChild(renderedButton);
        this.renderedButtons.push(renderedButton);
      }
      return container;
    }

    scramblePosition(screenSize, inputContainer) {
      const inputHeight = inputContainer.offsetHeight;
      this.renderedButtons.forEach((button) => {
        // button offsetWidth is the width of the button, and offsetHeight is the height of the button
        // maxLeft calculates the maximum left position the button can have without going off screen
        // maxTop calculates the maximum top position the button can have without going off screen
        const maxLeft = screenSize.getWidth() - button.offsetWidth;
        const maxTop = screenSize.getHeight() - button.offsetHeight;
        const left = Math.random() * maxLeft;
        const top = Math.random() * (maxTop - inputHeight);
        button.style.position = "absolute";
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
      });
    }
  }

  class ScreenSize {
    constructor() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    // Pass a callback function to onChange, it will be called whenever the window size changes
    onChange(callback) {
      const handleResize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        callback();
      };
      window.addEventListener("resize", handleResize);
    }
  }

  class MemoryGame {
    constructor() {
      this.buttonListContainer = document.createElement("div");
      this.gameState = {
        currentStep: 0,
        numOfButtons: 0,
      };
      this.timers = {
        gameTimeout: null,
        scrambleInterval: null,
        enableButtonsTimeout: null,
      };
    }

    resetGame() {
      this.gameState.currentStep = 0;

      // Clear any existing timers
      Object.keys(this.timers).forEach((timerKey) => {
        if (this.timers[timerKey]) {
          if (timerKey.includes("Interval")) {
            clearInterval(this.timers[timerKey]);
          } else {
            clearTimeout(this.timers[timerKey]);
          }
          this.timers[timerKey] = null;
        }
      });

      // If buttonListContainer exists and has a parent node, remove it (the child - button list) from the DOM
      if (this.buttonListContainer && this.buttonListContainer.parentNode) {
        this.buttonListContainer.parentNode.removeChild(
          this.buttonListContainer
        );
      }
      this.buttonListContainer = null;
      this.buttonList = null;
    }

    winGame() {
      // Add a small delay so the button text can be populated before reset
      setTimeout(() => {
        alert(messages.excellentMemory);
        this.resetGame();
      }, GAME_CONFIG.WIN_DELAY);
    }

    startGame(numOfButtons, container, screen, inputContainer) {
      // Create and render button list
      this.buttonList = new ButtonList(numOfButtons);
      this.buttonListContainer = this.buttonList.renderButtonContainer();
      container.appendChild(this.buttonListContainer);

      // Wait for numOfButtons * 1000 ms, then scramble numOfButtons times
      this.timers.gameTimeout = setTimeout(() => {
        let scrambleCount = 0;
        this.timers.scrambleInterval = setInterval(() => {
          this.buttonList.scramblePosition(screen, inputContainer);
          scrambleCount++;

          // Once scrambleCount reaches the same as the numOfButtons, stop the interval
          if (scrambleCount >= numOfButtons) {
            clearInterval(this.timers.scrambleInterval);
            this.timers.scrambleInterval = null;

            // After scrambling is complete, enable buttons and clear text after 0.5 seconds
            this.timers.enableButtonsTimeout = setTimeout(() => {
              this.buttonList.renderedButtons.forEach((button) => {
                button.disabled = false;
                button.textContent = "";
              });
              this.timers.enableButtonsTimeout = null;
            }, GAME_CONFIG.ENABLE_DELAY);
          }
        }, GAME_CONFIG.SCRAMBLE_INTERVAL);
      }, numOfButtons * 1000);

      // Setup button click handlers for gameplay
      this.setupGameplayHandlers(numOfButtons);
    }

    setupGameplayHandlers(numOfButtons) {
      this.buttonList.renderedButtons.forEach((button, id) => {
        button.addEventListener("click", () => {
          this.gameState.currentStep++;
          if (id + 1 === this.gameState.currentStep && id + 1 < numOfButtons) {
            button.textContent = id + 1;
            button.disabled = true;
          } else if (
            id + 1 === numOfButtons &&
            id + 1 === this.gameState.currentStep
          ) {
            button.textContent = id + 1;
            button.disabled = true;
            this.winGame();
          } else {
            this.buttonList.renderedButtons.forEach((button, id) => {
              button.textContent = id + 1;
              button.disabled = true;
            });
            setTimeout(() => {
              alert(messages.wrongOrder);
              this.resetGame();
            }, GAME_CONFIG.WIN_DELAY);
          }
        });
      });
    }

    renderGame() {
      // Create new screen
      const screen = new ScreenSize();

      // Main container for the game
      const container = document.createElement("div");

      // Input container for button creation
      const inputContainer = document.createElement("div");
      const inputText = document.createElement("p");
      inputText.textContent = messages.buttonPrompt;
      const inputContent = document.createElement("div");
      inputContainer.appendChild(inputText);
      const inputField = document.createElement("input");
      inputField.style.width = "150px";
      inputField.type = "number";
      inputField.min = "3";
      inputField.max = "7";
      inputField.placeholder = messages.inputPlaceholder;

      // Input button (Go!)
      const inputButton = document.createElement("button");
      inputButton.textContent = messages.goButton;
      inputButton.addEventListener("click", () => {
        const numOfButtons = parseInt(inputField.value);

        // Reset the game whenever Go button is clicked
        this.resetGame();

        // Validate input
        if (
          numOfButtons >= GAME_CONFIG.MIN_BUTTONS &&
          numOfButtons <= GAME_CONFIG.MAX_BUTTONS
        ) {
          this.startGame(numOfButtons, container, screen, inputContainer);
        } else {
          alert(messages.invalidRange);
        }
      });

      inputContent.appendChild(inputField);
      inputContent.appendChild(inputButton);
      inputContainer.appendChild(inputContent);

      // Add child containers to main container
      container.appendChild(inputContainer);
      return container;
    }
  }

  // Initialize the game
  const game = new MemoryGame();
  document.body.appendChild(game.renderGame());
});
