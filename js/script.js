document.addEventListener('DOMContentLoaded', () => {
    class Button {
        constructor(number, color) {
            this.number = number;
            this.color = color;
        }
        render() {
            const button = document.createElement("button");
            button.textContent = this.number;
            button.style.color = "black";
            button.style.backgroundColor = this.color;
            button.style.width = "10em";
            button.style.height = "5em";
            button.style.fontSize = "2em";
            button.style.border = "2px solid #888";
            button.style.borderRadius = "4px";
            button.disabled = true;
            return button;
        }

        buttonClicked() {
            console.log("Button clicked:", this.number);
        }
    }

    class ButtonList {
        constructor(numOfButtons) {
            this.numOfButtons = numOfButtons;
            this.buttons = [];
        }

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        renderButtonContainer() {
            const colourList = ["blue", "orange", "green", "pink", "purple", "cyan", "magenta"];
            const shuffledColors = this.shuffle(colourList.slice()).slice(0, this.numOfButtons);
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.gap = "32px";
            this.renderedButtons = [];
            for (let i = 0; i < this.numOfButtons; i++) {
                const button = new Button(i + 1, shuffledColors[i]);
                const renderedButton = button.render();
                renderedButton.addEventListener("click", () => {
                    button.buttonClicked();
                })
                container.appendChild(renderedButton);
                this.renderedButtons.push(renderedButton);
            }
            return container;
        }

        scramblePosition(screenSize, inputContainer) {
            const inputHeight = inputContainer.offsetHeight;
            this.renderedButtons.forEach(button => {
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
            }
            window.addEventListener('resize', handleResize);
        }
    }

    class MemoryGame {
        constructor() {
            this.buttonListContainer = null;
        }

        renderGame() {
            // Create new screen
            const screen = new ScreenSize();

            // Main container for the game
            const container = document.createElement("div");

            // Input container for button creation
            const inputContainer = document.createElement("div");
            const inputText = document.createElement("p");
            inputText.textContent = "How many buttons to create?";
            const inputContent = document.createElement("div");
            inputContainer.appendChild(inputText);
            const inputField = document.createElement("input");
            inputField.style.width = "150px";
            inputField.type = "number";
            inputField.min = "3";
            inputField.max = "7";
            inputField.placeholder = "Enter a number (3-7)";

            // Input button (Go!)
            const inputButton = document.createElement("button");
            inputButton.textContent = "Go!";
            inputButton.addEventListener("click", () => {
                const numOfButtons = parseInt(inputField.value);
                if (numOfButtons >= 3 && numOfButtons <= 7) {
                    // Remove previous button list
                    if (this.buttonListContainer) {
                        container.removeChild(this.buttonListContainer);
                    }
                    this.buttonList = new ButtonList(numOfButtons);
                    this.buttonListContainer = this.buttonList.renderButtonContainer();
                    container.appendChild(this.buttonListContainer);

                } else {
                    alert("Please enter a number between 3 and 7.");
                }
                setTimeout(() => {
                    let count = 0;
                    const scrambleInterval = setInterval(() => {
                        this.buttonList.scramblePosition(screen, inputContainer);
                        count++;
                        if (count >= this.numOfButtons) {
                            clearInterval(scrambleInterval)
                        }
                    }, 2000);
                }, this.numOfButtons * 1000);
            });

            inputContent.appendChild(inputField);
            inputContent.appendChild(inputButton);
            inputContainer.appendChild(inputContent);

            // Add child containers to main container
            container.appendChild(inputContainer);
            return container;
        }
    }

    const game = new MemoryGame();
    document.body.appendChild(game.renderGame());
    
    const screen = new ScreenSize();
    screen.onChange(() => {
        console.log("Screen size changed:");
        console.log("Height: " + screen.getHeight() + ", Width: " + screen.getWidth());
    });

});