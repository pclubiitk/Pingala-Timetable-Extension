function addTT() {
  chrome.storage.local.get(["timetable"], function (result) {
    let storedData = result.timetable;
    let tableHTML = '<table style="border-collapse: collapse; width: 100%;">';
    tableHTML +=
      '<tr><th></th><th style="border: 1px solid black; padding: 8px;">Day</th><th style="border: 1px solid black; padding: 8px;">Time</th><th style="border: 1px solid black; padding: 8px;">Title</th><th style="border: 1px solid black; padding: 8px;">Lecture Hall</th></tr>';
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let i = 0;
    days.forEach((day) => {
      i = i + 1;
      const dataArray = storedData[day];
      dataArray.forEach((data) => {
        const time = data.time;
        const title = data.title;
        let inpStr = `<td class="${title}" style="border: 1px solid black; padding: 8px;"><input type="text" name="${title}" class="${
          title + "Inp"
        }"><button class="${title + "Btn"}">+</button></td>`;
        const lectureHall = data.lectureHall;
        let lecStr = `<td style="border: 1px solid black; padding: 8px;">${lectureHall}</td>`;
        let str = "";
        if (lectureHall === "") {
          str = inpStr;
        } else {
          str = lecStr;
        }
        tableHTML += `<tr><td style="padding: 8px;"><span class="minus-sign">-</span></td><td style="border: 1px solid black; padding: 8px;">${day}</td><td style="border: 1px solid black; padding: 8px;">${time}</td><td style="border: 1px solid black; padding: 8px;">${title}</td>${str}</tr>`;
      });
      if (i !== days.length) {
        tableHTML +=
          '<tr><td colspan="3" style="border: none; height: 10px;"></td></tr>';
      }
    });
    tableHTML += "</table>";

    document.getElementById("timetableGrid").innerHTML = tableHTML;
  });
}

document
  .getElementById("updateBtn")
  .addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.runtime.sendMessage({ action: "GetTT", tabId: tab.id });
  });

document
  .getElementById("timetableBtn")
  .addEventListener("click", async function () {
    let closeButton = document.createElement("button");
    closeButton.innerHTML = "Close";
    closeButton.id = "closeButton";
    document.getElementById("closeBtn").appendChild(closeButton);

    document.getElementById("closeButton").addEventListener("click", () => {
      document.getElementById("closeBtn").innerHTML = "";
      document.getElementById("timetableBtns").innerHTML = "";
      document.getElementById("timetableGrid").innerHTML = "";
    });

    addTT();

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete row";
    deleteButton.id = "deleteButton";
    document.getElementById("timetableBtns").appendChild(deleteButton);

    document.getElementById("deleteButton").addEventListener("click", () => {
      let minusSigns = document.getElementsByClassName("minus-sign");

      Array.from(minusSigns).forEach(function (minusSign) {
        minusSign.style.visibility = "visible";
        minusSign.addEventListener("click", function () {
          let row = this.parentNode.parentNode;
          let tdElements = row.getElementsByTagName("td");
          let day = tdElements[1].textContent;
          let time = tdElements[2].textContent;
          let title = tdElements[3].textContent;

          chrome.storage.local.get(["timetable"], (data) => {
            let timetable = data.timetable;

            if (timetable.hasOwnProperty(day)) {
              timetable[day] = timetable[day].filter(function (element) {
                return !(element.time === time && element.title === title);
              });

              chrome.storage.local.set({ timetable: timetable }, function () {
                console.log("Timetable stored in Chrome Storage:", timetable);
                console.log("The matching element has been removed");
                setNotification();
              });
            }
          });

          row.parentNode.removeChild(row);
        });
      });
    });

    let subjects = [];

    chrome.storage.local.get(["timetable"], (data) => {
      let timetable = data.timetable;

      for (let day in timetable) {
        let dayArray = timetable[day];

        for (let i = 0; i < dayArray.length; i++) {
          let subject = dayArray[i].title;

          if (!subjects.includes(subject)) {
            subjects.push(subject);
          }
        }
      }

      subjects.forEach((subject) => {
        let subjectBtn = subject + "Btn";

        Array.from(document.getElementsByClassName(subjectBtn)).forEach(
          (button) => {
            button.addEventListener("click", () => {
              let parent = button.parentNode;
              let inputField = parent.querySelector("." + subject + "Inp");
              let lectureHall = inputField.value;

              chrome.storage.local.get(["timetable"], (data) => {
                let timetable = data.timetable;

                for (let day in timetable) {
                  timetable[day].forEach((element) => {
                    if (element.title === subject) {
                      element.lectureHall = lectureHall;
                    }
                  });
                }

                chrome.storage.local.set({ timetable: timetable }, function () {
                  console.log(
                    "Updated timetable has been stored in Chrome local storage."
                  );
                  Array.from(document.getElementsByClassName(subject)).forEach((element)=>{
                    element.innerHTML=lectureHall;
                  });
                });
              });
            });
          }
        );
      });
    });
  });

document
  .getElementById("upcomingClass")
  .addEventListener("click", async function () {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.runtime.sendMessage({ action: "upcomingClass", tabId: tab.id });
  });
