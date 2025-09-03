document.addEventListener("DOMContentLoaded", () => {
  // Game constants
  const GAME_CONFIG = {
    // Button range
    MIN_BUTTONS: 3,
    MAX_BUTTONS: 7,

    // Button styling
    BUTTON_WIDTH: "10em",
    BUTTON_HEIGHT: "5em",
    FONT_SIZE: "2em",
    BUTTON_TEXT_COLOR: "black",
    BUTTON_BORDER: "2px solid grey",
    BUTTON_BORDER_RADIUS: "4px",

    // Timing
    SCRAMBLE_INTERVAL: 2000,
    ENABLE_DELAY: 500,
    WIN_DELAY: 100,
    DELAY_MULTIPLIER: 1000,

    // Layout
    CONTAINER_DISPLAY: "flex",
    CONTAINER_GAP: "32px",

    // Input field styling
    INPUT_WIDTH: "150px",
    INPUT_TYPE: "number",

    // Button positioning
    POSITION_ABSOLUTE: "absolute",

    // DOM elements
    ELEMENT_BUTTON: "button",
    ELEMENT_DIV: "div",
    ELEMENT_P: "p",
    ELEMENT_INPUT: "input",

    // Game state
    INITIAL_STEP: 0,
    BUTTON_NUMBER_ONE: 1,

    // Timer identification
    INTERVAL_IDENTIFIER: "Interval",

    // Colours
    COLOURS: ["blue", "orange", "green", "grey", "purple", "cyan", "magenta"],
  };

  class Button {
    constructor(number, color) {
      this.number = number;
      this.color = color;
    }
    renderButton() {
      const button = document.createElement(GAME_CONFIG.ELEMENT_BUTTON);
      button.textContent = this.number;
      button.style.color = GAME_CONFIG.BUTTON_TEXT_COLOR;
      button.style.backgroundColor = this.color;
      button.style.width = GAME_CONFIG.BUTTON_WIDTH;
      button.style.height = GAME_CONFIG.BUTTON_HEIGHT;
      button.style.fontSize = GAME_CONFIG.FONT_SIZE;
      button.style.border = GAME_CONFIG.BUTTON_BORDER;
      button.style.borderRadius = GAME_CONFIG.BUTTON_BORDER_RADIUS;
      button.disabled = true;
      return button;
    }
  }

  class ButtonList {
    constructor(numOfButtons) {
      this.numOfButtons = numOfButtons;
      this.buttons = [];
    }

    // Fisher-Yates shuffle algorithm - used ChatGPT to find a shuffling algorithm
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    renderButtonContainer() {
      // Make a copy of the colours array, shuffle, then take colours from index 0 to the number of numOfButtons
      const shuffledColors = this.shuffle(GAME_CONFIG.COLOURS.slice()).slice(
        0,
        this.numOfButtons
      );
      const container = document.createElement(GAME_CONFIG.ELEMENT_DIV);
      container.style.display = GAME_CONFIG.CONTAINER_DISPLAY;
      container.style.gap = GAME_CONFIG.CONTAINER_GAP;
      this.renderedButtons = [];
      for (let i = 0; i < this.numOfButtons; i++) {
        const button = new Button(
          i + GAME_CONFIG.BUTTON_NUMBER_ONE,
          shuffledColors[i]
        );
        const renderedButton = button.renderButton();
        container.appendChild(renderedButton);
        this.renderedButtons.push(renderedButton);
      }
      return container;
    }

    scramblePosition(screenSize, inputContainer) {
      const inputHeight = inputContainer.offsetHeight;
      this.renderedButtons.forEach((button) => {
        // offsetWidth is the width of the button (includes padding, borders, etc.)
        const maxLeft = screenSize.getWidth() - button.offsetWidth;
        const maxTop = screenSize.getHeight() - button.offsetHeight;
        const left = Math.random() * maxLeft;
        const top = Math.random() * (maxTop - inputHeight);
        button.style.position = GAME_CONFIG.POSITION_ABSOLUTE;
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
      });
    }
  }

  class ScreenSize {

    getWidth() {
      return window.innerWidth;
    }

    getHeight() {
      return window.innerHeight;
    }
  }

  class MemoryGame {
    constructor() {
      this.buttonListContainer = document.createElement(
        GAME_CONFIG.ELEMENT_DIV
      );
      this.gameState = {
        currentStep: GAME_CONFIG.INITIAL_STEP,
        numOfButtons: GAME_CONFIG.INITIAL_STEP,
      };
      this.timers = {
        gameTimeout: null,
        scrambleInterval: null,
        enableButtonsTimeout: null,
      };
    }

    resetGame() {
      this.gameState.currentStep = GAME_CONFIG.INITIAL_STEP;

      // Clear any existing timers
      Object.keys(this.timers).forEach((timerKey) => {
        if (this.timers[timerKey]) {
          if (timerKey.includes(GAME_CONFIG.INTERVAL_IDENTIFIER)) {
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
      }, numOfButtons * GAME_CONFIG.DELAY_MULTIPLIER);

      // Setup button click handlers for gameplay
      this.setupGameplayHandlers(numOfButtons);
    }

    setupGameplayHandlers(numOfButtons) {
      this.buttonList.renderedButtons.forEach((button, id) => {
        button.addEventListener("click", () => {
          this.gameState.currentStep++;
          if (
            id + GAME_CONFIG.BUTTON_NUMBER_ONE === this.gameState.currentStep &&
            id + GAME_CONFIG.BUTTON_NUMBER_ONE < numOfButtons
          ) {
            button.textContent = id + GAME_CONFIG.BUTTON_NUMBER_ONE;
            button.disabled = true;
          } else if (
            id + GAME_CONFIG.BUTTON_NUMBER_ONE === numOfButtons &&
            id + GAME_CONFIG.BUTTON_NUMBER_ONE === this.gameState.currentStep
          ) {
            button.textContent = id + GAME_CONFIG.BUTTON_NUMBER_ONE;
            button.disabled = true;
            this.winGame();
          } else {
            this.buttonList.renderedButtons.forEach((button, id) => {
              button.textContent = id + GAME_CONFIG.BUTTON_NUMBER_ONE;
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
      const container = document.createElement(GAME_CONFIG.ELEMENT_DIV);

      // Input container for button creation
      const inputContainer = document.createElement(GAME_CONFIG.ELEMENT_DIV);
      const inputText = document.createElement(GAME_CONFIG.ELEMENT_P);
      inputText.textContent = messages.buttonPrompt;
      const inputContent = document.createElement(GAME_CONFIG.ELEMENT_DIV);
      inputContainer.appendChild(inputText);
      const inputField = document.createElement(GAME_CONFIG.ELEMENT_INPUT);
      inputField.style.width = GAME_CONFIG.INPUT_WIDTH;
      inputField.type = GAME_CONFIG.INPUT_TYPE;
      inputField.min = GAME_CONFIG.MIN_BUTTONS.toString();
      inputField.max = GAME_CONFIG.MAX_BUTTONS.toString();
      inputField.placeholder = messages.inputPlaceholder;

      // Input button (Go!)
      const inputButton = document.createElement(GAME_CONFIG.ELEMENT_BUTTON);
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
