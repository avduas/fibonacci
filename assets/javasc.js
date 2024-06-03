document.addEventListener("DOMContentLoaded", async function () {
  let fibonacciResults = [];
  const resultListSpinner = document.getElementById("resultListSpinner");

  async function callFibonacciServer(number, saveCalculation) {
    const url = `http://localhost:5050/fibonacci/${number}?saveCalculation=${saveCalculation}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Server Error: ${errorMessage}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      throw error;
    }
  }

  const calculateBtn = document.getElementById("calculateButton");
  const inputNumber = document.getElementById("numberInput");
  const result = document.getElementById("result");
  const loader = document.getElementById("loader");
  const alertContainer = document.getElementById("alert-container");
  const resultList = document.getElementById("resultList");
  let alertExists = false;

  function negativeInteger() {
    result.textContent = "Please enter a non-negative integer.";
    clearAlerts();
  }

  function errorCust(error) {
    result.textContent = error.message;
    result.style.color = "red";
    result.classList.remove("fw-bold");
    result.classList.remove("text-decoration-underline");
    loader.classList.add("d-none");
    clearAlerts();
  }

  function moreFifty(message) {
    if (!alertExists) {
      const row = document.createElement("div");
      row.className = "row";
      alertContainer.appendChild(row);

      const colMd = document.createElement("div");
      colMd.className = "col-md-auto";
      row.appendChild(colMd);

      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-danger";
      alertDiv.textContent = message;
      colMd.appendChild(alertDiv);
      alertExists = true;
    } else {
      clearAlerts();
    }
  }

  async function handleBtnClick() {
    const inputValue = parseInt(inputNumber.value);
    const saveCalculationCheckbox = document.getElementById(
      "saveCalculationCheckbox"
    );

    if (isNaN(inputValue) || inputValue < 0) {
      negativeInteger();
    } else if (inputValue > 50) {
      moreFifty("Can't be larger than 50");
    } else {
      try {
        if (saveCalculationCheckbox.checked) {
          await calculateAndSaveOnServer(inputValue);
        } else {
          const fibonacciValue = calculateFibonacciLocally(inputValue);
          displayResultLocally(fibonacciValue);
        }
      } catch (error) {
        errorCust(error);
      }
    }
  }

  inputNumber.addEventListener("input", function () {
    result.textContent = "";
  });

  function clearAlerts() {
    while (alertContainer.firstChild) {
      alertContainer.removeChild(alertContainer.firstChild);
    }
    alertExists = false;
  }

  function resetErrorStyles() {
    result.style.color = "";
    result.classList.add("fw-bold");
    result.classList.add("text-decoration-underline");
  }

  function createFibonacciListItem(item) {
    const number = item.number;
    const result = item.result;
    const createdDate = new Date(item.createdDate).toString();
    return `The Fibonacci Of ${number} is ${result}. Calculated at: ${createdDate}`;
  }

  async function getFibonacciResults() {
    const url = "http://localhost:5050/getFibonacciResults";
    resultListSpinner.classList.remove("d-none");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      resultListSpinner.classList.add("d-none");
    }
  }

  getFibonacciResults();

  calculateBtn.addEventListener("click", handleBtnClick);

  async function calculateAndSaveOnServer(inputValue) {
    loader.classList.remove("d-none");

    try {
      const saveCalculationCheckbox = document.getElementById(
        "saveCalculationCheckbox"
      );
      const saveCalculation = saveCalculationCheckbox.checked;

      const fibonacciValue = await callFibonacciServer(
        inputValue,
        saveCalculation
      );
      resetErrorStyles();
      result.textContent = `${fibonacciValue}`;
      clearAlerts();
      getFibonacciResults();
    } catch (error) {
      errorCust(error);
    } finally {
      loader.classList.add("d-none");
    }
  }

  function calculateFibonacciLocally(n) {
    if (n <= 1) {
      return n;
    }
    return calculateFibonacciLocally(n - 1) + calculateFibonacciLocally(n - 2);
  }

  async function displayResultLocally(fibonacciValue) {
    loader.classList.remove("d-none");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      resetErrorStyles();
      result.textContent = `${fibonacciValue}`;
      clearAlerts();
    } catch (error) {
      errorCust(error);
    } finally {
      loader.classList.add("d-none");
    }
  }

  function updateListDisplay() {
    resultList.innerHTML = "";
    resultList.style.listStyle = "none";
  
    const maxResults = 6; 
    let resultsDisplayed = 0;
  
    for (const result of fibonacciResults) {
      if (resultsDisplayed >= maxResults) {
        break; 
      }
  
      const listItem = document.createElement("li");
      const listItemText = `The Fibonacci Of ${result.number} is ${result.result}. Calculated at: ${new Date(
        result.createdDate
      ).toString()}`;
      listItem.textContent = listItemText;
      listItem.style.padding = "10px";
      listItem.style.borderBottom = "1px solid #ccc";
      resultList.appendChild(listItem);
      resultsDisplayed++;
    }
  }

  document.getElementById("sortSelect").addEventListener("change", () => {
    const sortOption = document.getElementById("sortSelect").value;
    sortAndDisplayList(sortOption);
  });
  

  function sortAndDisplayList(sortOption) {
    if (sortOption === "dateAsc") {
      fibonacciResults.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    } else if (sortOption === "dateDesc") {
      fibonacciResults.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (sortOption === "numberAsc") {
      fibonacciResults.sort((a, b) => a.number - b.number);
    } else if (sortOption === "numberDesc") {
      fibonacciResults.sort((a, b) => b.number - a.number);
    }
  
    updateListDisplay();
  }

  const results = await getFibonacciResults();
  fibonacciResults = results;
  updateListDisplay();
});
