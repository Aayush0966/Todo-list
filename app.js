let buttons = document.querySelectorAll("button");
let calcScreen = document.querySelector(".calculator-screen")
let equalsButton = document.querySelector(".equal-sign");
let hisBtn = document.querySelector(".history");
let history = [];

buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        if (button.value !== "all-clear" && button.value !== "="){
        calcScreen.value += button.value;
        }
        else if(button.value == "all-clear") {
            calcScreen.value = "";
        }
        else if (button.value == "=") {
            
            let expression = calcScreen.value;
            if (expression !== "") { 
            let result = eval(expression.replace('×', '*').replace('÷', '/'));
            history.push({ expression, result });
            calcScreen.value = result;
           }
           
        }
            
    })
})


document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        equalsButton.click(); 
    }
});

hisBtn.addEventListener("click", () => {
    calcScreen.value = history.map(entry => `${entry.expression} = ${entry.result}`);
});