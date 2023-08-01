document.getElementById('updateBtn').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: 'GetTT', tabId: tab.id });
});


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "true") {
    chrome.storage.local.get(['personal_data'], function(result) {
      console.log(result.personal_data);
      if(Object.keys(result).length){
        Add_DashBoard(result.personal_data)
        window.alert("Your TimeTable has been successfully updated.")
      }
    })
  }
  if(message.action === "Error_Fetch_Timetable"){
    window.alert("Cannot Update your TimeTable. Please login to your Pingala Portal and ensure you are on a page that shows your TimeTable")
  }
  if(message.action === "1"){
    window.alert("Cannot Fetch LHCs. Please Login into your Pingala Portal and go to to Check Timetable Page.")
  }
  if(message.action === "2"){
    window.alert("Please Select your Academic Session, Semester and then Click 'Show' button. Then Click Fetch Lecture Halls.")
  }
  if(message.action === "3"){
    window.alert("Your LHCs have been fetched Succesfully. You can see them in 'Check TimeTable'.")
  }
});


chrome.storage.local.get(['personal_data'], function(result) {
  console.log(result.personal_data);
  if(Object.keys(result).length){
    Add_DashBoard(result.personal_data)
  }
})


document.getElementById('Show_TT').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: 'ShowTT', tabId: tab.id });
});


document.getElementById('upcomingClass').addEventListener('click',async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
  chrome.runtime.sendMessage({ action: 'upcomingClass', tabId: tab.id });
});


document
  .getElementById("timetableBtn")
  .addEventListener("click", async function () {
    document.getElementById("upcomingClass").style.display = "none";
    document.getElementById("timetableBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("LHC").style.display = "none";
    document.getElementsByClassName("personal")[0].style.display = "none";
    const ContainerElement = document.getElementsByClassName("container")[0];
    let closeButton = document.createElement("button");
    ContainerElement.style.width = "798px";
    closeButton.innerHTML = "Back";
    closeButton.id = "closeButton";
    document.getElementById("closeBtn").appendChild(closeButton);

    document.getElementById("closeButton").addEventListener("click", () => {
      const ContainerElement = document.getElementsByClassName("container")[0];
      ContainerElement.style.width = "320px";
      document.getElementById("closeBtn").innerHTML = "";
      document.getElementById("timetableBtns").innerHTML = "";
      document.getElementById("timetableGrid").innerHTML = "";
      document.getElementById("upcomingClass").style.display = "";
      document.getElementById("timetableBtn").style.display = "";
      document.getElementById("updateBtn").style.display = "";
      document.getElementById("LHC").style.display = "";
      document.getElementsByClassName("personal")[0].style.display = "";
      timetableGrid.style.opacity = '0';
    }); 
    addTT();
    LabClashes();
    timetableGrid.style.opacity = '1';

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete Class";
    deleteButton.id = "deleteButton";
    document.getElementById("timetableBtns").appendChild(deleteButton);

    let deleteButtonClicked = false;

    let deleteBtn = document.getElementById("deleteButton");

    deleteBtn.addEventListener("click", () => {
      if (deleteButtonClicked) {
        deleteButtonClicked = false;
        deleteBtn.innerHTML = "Delete Class";
        deleteBtn.style.backgroundColor = "#64ccc5";
        deleteBtn.style.color = "white";
        deleteBtn.style.border = "none";
        let minusSigns = document.getElementsByClassName("minus-btn");

        Array.from(minusSigns).forEach((minusSign) => {
          minusSign.style.display = 'none';
        });
      } else {
        deleteButtonClicked = true;
        deleteBtn.innerHTML = "Stop Deleting";
        deleteBtn.style.backgroundColor = "white";
        deleteBtn.style.color = "#4c7bfa";
        deleteBtn.style.border = "2px solid #4c7bfa";
        let minusSigns = document.getElementsByClassName("minus-btn");

        Array.from(minusSigns).forEach(function (minusSign) {
          minusSign.style.display = 'block';
          minusSign.addEventListener("click", function () {
            const classCell = this.closest(".class-cell");
            const day = classCell.parentElement.querySelector(".day-header").textContent;
            const title = classCell.querySelector(".title").textContent;
            const time = classCell.querySelector(".time").textContent;
            LabClashes();
            classCell.remove();

            chrome.storage.local.get(["timetable"], (data) => {
              let timetable = data.timetable;

              if (timetable.hasOwnProperty(day)) {
                timetable[day] = timetable[day].filter(function (element) {
                  return !(element.time === time && element.title === title);
                });

                chrome.storage.local.set({ timetable: timetable }, function () {
                  console.log("Timetable stored in Chrome Storage:", timetable);
                  console.log("The matching element has been removed");
                });
              }
            });
            setTimeout(() => {
              LabClashes();
            }, 500);
          });
        });
      }
    });

    let subjects = [];

    chrome.storage.local.get(["timetable"], (data) => {
      let timetable = data.timetable;

      for (let day in timetable) {
        let dayArray = timetable[day];

        for (let i = 0; i < dayArray.length; i++) {
          let subject = dayArray[i].title;
          const LHC = dayArray[i].lectureHall;
          if(LHC !== ""){
            Fill_LHC(subject, LHC);
          }
          if (!subjects.includes(subject)) {
            subjects.push(subject);
          }
        }
      }

      subjects.forEach((subject) => {
        let subjectBtn = subject + "Btn" + " add-btn";
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
                    "Updated timetable has been stored in Chrome local storage:", timetable
                  );
                  Fill_LHC(subject, lectureHall);
                });
              });
            });
          }
        );
      });
    });
    LHC();
  });


function Fill_LHC(subject, lectureHall){
  let subjectBtn = subject + "Btn" + " add-btn";
  Array.from(document.getElementsByClassName(subjectBtn)).forEach(
    (elem) => {
      elem.style.visibility = "hidden";
    }
  )
  Array.from(document.getElementsByClassName(subject+"Inp")).forEach(
    (elem) => {
      elem.style.visibility = "hidden";
    }
  )
  Array.from(document.getElementsByClassName(subject + " txt-btn")).forEach(
    (element) => {
      element.innerHTML = lectureHall;
      element.style.visibility = "visible";
    }
  );
}


function addTT() {
  chrome.storage.local.get(["timetable"], function (result) {
    let storedData = result.timetable;
    let gridHTML = '<div class="timetable-grid-container">';
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach((day) => {
      const dataArray = storedData[day];
      gridHTML += `<div class="timetable-day">
                      <div class="day-header">${day}</div>`;
      dataArray.forEach((data) => {
        const time = data.time;
        const title = data.title;
        const classCell = `<div class="class-cell">
                           <div class="minus-btn-container">
                           <button class="minus-btn">-</button>
                           </div>
                           <div class="time">${time}</div>
                           <div class="title">${title}</div>
                           <div class="${title} txt-btn"></div>
                           <div class="add-btn-container">
                           <input type="text" class="${title}Inp" placeholder="Enter Lecture Hall">
                           <button class="${title}Btn add-btn">+</button>
                           </div>
                          </div>`;
        gridHTML += classCell;
      });
      gridHTML += `</div>`;
    });
    gridHTML += "</div>";
    document.getElementById("timetableGrid").innerHTML = gridHTML;
  });
}

function Add_DashBoard(x){
  let personalDataDiv=document.createElement('div');
  personalDataDiv.classList.add("personalData");
  let imgDiv=document.createElement('div');
  let imgDivBox=document.createElement('div');
  imgDiv.classList.add("imgDiv");
  imgDivBox.classList.add("imgDivBox");
  let img=document.createElement('img');
  let nameDiv=document.createElement('div');
  let listDiv=document.createElement('div');
  nameDiv.classList.add('nameDiv');
  listDiv.classList.add('listDiv');
  let n=document.createElement('h1');
  let r=document.createElement('h3');
  let list=document.createElement('ul');
  list.classList.add('list');
  n.innerHTML="<b>"+x.name+"</b>";
  r.innerHTML="<b>"+x.roll_no+"</b>";
  nameDiv.appendChild(n);
  nameDiv.appendChild(r);
  personalDataDiv.appendChild(nameDiv);
  let val=x.dp;
  img.src=val;
  imgDiv.appendChild(imgDivBox);
  imgDiv.appendChild(img);
  document.getElementsByClassName('personal')[0].appendChild(imgDiv);
  let programme=document.createElement('li');
  programme.innerHTML="Programme : "+"<b>"+x.programme+"</b>";
  list.appendChild(programme);
  let dept=document.createElement('li');
  dept.innerHTML="Department : " + "<b>"+x.dept+"</b>";
  list.appendChild(dept);
  let sem=document.createElement('li');
  sem.innerHTML="Semester : " + "<b>"+x.sem+"</b>";
  list.appendChild(sem);
  let appliedCredits=document.createElement('li');
  appliedCredits.innerHTML="Applied Credits: "+"<b>"+x.appliedCredits+"</b>";
  list.appendChild(appliedCredits);
  listDiv.appendChild(list);
  personalDataDiv.appendChild(listDiv);
  document.getElementsByClassName('personal')[0].appendChild(personalDataDiv);
  document.getElementsByTagName('img')[0].style="border-radius:100%;width:110px;height:110px;object-fit:cover;object-position:0% 0%;margin-top:auto;margin-bottom:auto;";
}


function LabClashes(){
  chrome.storage.local.get(['timetable'], function(result) {
    const timetable = result.timetable;
    for(let j=0; j<5; j++){
      const x = timetable[Day(j)]
      for(let i=0; i<x.length-1; i++){
        if(x[i].time == x[i+1].time){
          console.log(x[i]);
          class_cell = Array.from(document.getElementsByClassName("timetable-day"))[j].getElementsByClassName("class-cell")
          Array.from(class_cell).forEach((elem) => {
            if(elem.getElementsByClassName("time")[0].innerText == x[i].time){
              const computedStyle = getComputedStyle(elem);
              const currentBorderColor = computedStyle.borderColor;
              if (currentBorderColor === "rgb(0, 0, 255)") {
                elem.style.border = "4.5px solid red";
              } else {
                elem.style.border = "1.5px solid blue";
              }
            }
          });
        }
      }
    }
  });
}

document.getElementById("LHC").addEventListener("click", async function() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.runtime.sendMessage({ action: "LHC", tabId: tab.id});
});


function LHC(){
  chrome.storage.local.get(['LHC'], function(result) {
    const LHC = result.LHC
    if(LHC == null){
      return
    }
    for(let course in LHC){
      const title = document.getElementsByClassName('Lec-'+course+'Inp');
      const titleArray = Array.from(title);
      titleArray.forEach((element) => {
        element.value = LHC[course]
        const addButton = document.querySelector('.Lec-' + course + 'Btn');
        addButton.click();
      });
    }
  });
}

function Day(d){
  if(d == 0){
      return "Monday"
  }
  if(d == 1){
      return "Tuesday"
  }
  if(d == 2){
      return "Wednesday"
  }
  if(d == 3){
      return "Thursday"
  }
  if(d == 4){
      return "Friday"
  }
}