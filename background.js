chrome.runtime.onInstalled.addListener(() => {
  chrome.windows.create({
    url: 'popup_once/popup_once.html',
    type: 'popup',
    width: 400,
    height: 300
  });
});


chrome.runtime.onStartup.addListener(function() {
  setNotification();
});


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.action === 'GetTT') {
    chrome.tabs.sendMessage(request.tabId, { action: 'GetTT' }, function(response) {
      let timetable = response.timetable;
      let personal_data = response.personal_data;
      if(!(Object.keys(timetable).length)){
        chrome.runtime.sendMessage({action: 'Error_Fetch_Timetable'})
        return
      }
      chrome.storage.local.set({ timetable: timetable}, function() {
        console.log('Timetable stored in Chrome Storage:', timetable)
        console.log("Timetable has been saved")
        setNotification();
      })
      chrome.storage.local.set({ personal_data: personal_data}, function() {
        console.log('Personal Data Fetched:', personal_data)
        chrome.runtime.sendMessage({action: "true"});
      })
    });
  }
  if(request.action === 'ShowTT') {
    showTT();
  }
  if(request.action === 'upcomingClass') {
    upcomingClass();
  }
  if(request.action === 'LHC'){
    chrome.storage.local.get(['timetable'], function(response) {
      const timetable = response.timetable
      courses = new Set()
      for(let day in timetable){
        timetable[day].forEach((element) => {
          let x = element.title
          x = x.slice(x.indexOf('-')+1)
          courses.add(x)
        })
      }
      courses = Array.from(courses)
      chrome.tabs.sendMessage(request.tabId, {action: 'LHC', courses: courses});
    });
  }
  if(request.action === 'LHCData'){
    let LHC = request.data
    console.log('LHC: ',LHC)
    chrome.storage.local.set({ LHC: LHC});
  }
  if(request.action === 'alert'){
    chrome.runtime.sendMessage({action: request.alert_type});
  }
});


function setNotification(){
  chrome.storage.local.get(['timetable'], function(result) {
    let currentDate = new Date()
    if(currentDate.getDay() == 6 || currentDate.getDay() == 0){
      Notify_no_class()
      return
    }
    let storedData = result.timetable
    storedData = Convert(storedData)
    let x = storedData[Day(currentDate.getDay()-1)]
    let p = 1
    for(let i=0; i<x.length; i++){
      const ClassTime = new Date(x[i].time)
      title = x[i].title
      if(calculateTimeDifference(ClassTime, 0)){
        p = 0
        if(calculateTimeDifference(ClassTime,0) < 15*60*1000){
          Notify_urgent(ClassTime, title);
          return
        }
        else{
          Notify_15(ClassTime,title);
          return
        }
      }
    }
    if(p){
      Notify_no_class();
      return
    }
  });
}


function upcomingClassNotif(NxtClass){
  chrome.notifications.create('notificationId', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: NxtClass.title + ' will start from ' + NxtClass.time
  }, function(notificationId_u) {
    console.log('Notification created with ID:', notificationId_u);
  });
}


function upcomingClass(){
  chrome.storage.local.get(['timetable'], function(result) {
    let currentDate = new Date()
    if(currentDate.getDay() == 6 || currentDate.getDay() == 0){
      Notify_no_class()
      return
    }
    let storedData = result.timetable
    stored = Convert(storedData)
    let curDay = Day(currentDate.getDay()-1)
    let x = stored[curDay]
    let p = 1
    for(let i=0; i<x.length; i++){
      const ClassTime = new Date(x[i].time)
      if(calculateTimeDifference(ClassTime,0)){
        p = 0
        upcomingClassNotif(storedData[curDay][i]);
        return
      }
    }
    if(p){
      Notify_no_class();
      return
    }
  });
}

//timetable format changed
function showTT(){
  chrome.storage.local.get(['timetable'], function(result) {
    let storedData = result.timetable
    let n=[0, 0, 0, 0, 0];
    tableHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap" rel="stylesheet">
    <div style=" display: flex; align-items: center; justify-content: space-around; flex-direction: column; font-family: 'Quicksand', sans-serif;">`;
    tableHTML += `
      <div style="font-size: min(7vw,50px); padding: min(.4rem,20px); width: 100%; text-align: center;">
        CLASS SCHEDULE
      </div>`
    tableHTML += `
      <table class="timetable-table" style=" text-align: center; overflow: hidden; width: min(100%,80rem); max-height: 100%; border-spacing: 0; border-collapse: collapse; border-radius: 16px; background-color: rgb(243, 243, 243);">`;
    tableHTML += `
      <tr>
        <th style="height: min(6vh,40x); border: 2px solid white; width: auto; padding: 4px;"></th>
        <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Monday</th>
        <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Tuesday</th>
        <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Wednesday</th>
        <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Thursday</th>
        <th style="height: min(7vh,90px); border: 2px solid white; width: 18%; padding: 4px;">Friday</th></tr>`;

    for (let i = 8; i <= 18; i++) {
      let color;
      let width;
      tableHTML += `<tr>`;
      tableHTML += `
        <td style="font-weight: bold; width: auto; color: gray; height: min(7vh,90px);border: 2px solid white; padding: 8px; white-space: nowrap;">
        ${i == 12 ? 12 : i % 12}:00 ${i < 12 ? 'AM' : 'PM'}
        </td>`;

      for (let j = 0; j < 5; j++) {
        const day = Day(j);
        const classes = storedData[day]
        let Class=[];
        let type;
        let conti_Class;
        let end_slot;
        
        classes.forEach(data => {
          const strat_num = data.time.slice(0,2)
          const end_num = data.time_end.slice(0,2)
          const start_sun = data.time.slice(-2)
          const end_sun = data.time_end.slice(-2)
          type = data.title.slice(0,3)
          let start_hour;
          let end_hour;
          conti_Class = 0;
          n=n;

          //extracting value of time
          if(strat_num>9){
            start_hour = data.time.slice(0,2)
            start_hour = parseInt(start_hour)
              
          }else{
            start_hour = data.time[0]
            start_hour = parseInt(start_hour)
          }

          if(end_num>9){
            end_hour = data.time_end.slice(0,2)
            end_hour = parseInt(end_hour)
            
          }else{
            end_hour = data.time_end[0]
            end_hour = parseInt(end_hour)
          }

          //24-hour clock
          if(start_sun == 'PM' & start_hour != 12){
            start_hour+= 12
          }

          if(end_sun == 'PM' & start_hour != 12){
            end_hour+= 12
          }

          //lec vs Class
          if(start_hour==i && type=="Prc"){
            Class.push(data.title)
            color = "#9f70b8";
          } else if(start_hour==i){
            Class.push(data.title)
            color = "#368fb6";
          }

          if(Class.length>0){
            n[j] = Class.length
          }

          for (let k = 1; k < end_hour - start_hour; k++){
            if(start_hour+k == i && type == "Prc"){
              conti_Class = 1
              color = "#9f70b8";
            }else if(start_hour+k == i){
              conti_Class = 1
              color = "#368fb6";
            }
          }

          if(end_hour-start_hour>1 && i == end_hour-1){ end_slot= true}
        });

        if(Class.length!=0){
          tableHTML += `
            <td style="height: min(7vh,90px);border-top: 2px solid white; border-right: 2px solid white; padding: 4px; align-items: center;">
              <div style="display: flex; flex-direction: row; align-items: center; align-content: center; width: 100%; height:min(6vh,80px); text-align: center; justify-content:space-around">`
          for(let k=0; k<Class.length; k++){
            tableHTML += `
                <div style="z-index: +2;background-color: ${color}; color: white; font-weight: 500; height: 100%; flex-grow:1; padding-top: 8px; padding-bottom:0; border-radius: 7px; text-align: center; display: flex; justify-content: space-around; justify-items: center; margin:2px;">          
                ${Class[k]}
                </div>`
            }
            tableHTML += `
                </div>
              </td>`;
        }else if(conti_Class){
          if(end_slot){
            tableHTML += `
            <td style="height: min(7vh,90px);border-top: 2px solid white; border-right: 2px solid white; padding: 4px; align-items: center;">
              <div style="display: flex; flex-direction: row; align-items: center; align-content: center; width: 100%; height:min(6vh,80px); text-align: center; justify-content:space-around">`
              for(let l=0; l<n[j]; l++){
                tableHTML += `
                    <div style="background-color: ${color}; color: white; font-weight: 500; height: 100%; flex-grow:1; padding-top: 8px; padding-bottom:0; border-radius: 7px; text-align: center; display: flex; justify-content: space-around; justify-items: center; margin:2px;">          
                    </div>`
                }
              tableHTML += `
                  </div>
                </td>`;
            }else{
              tableHTML += `
                <td style="height: min(7vh,90px);border-top: 2px solid white; border-right: 2px solid white; padding: 4px; align-items: center;">
                <div style="display: flex; flex-direction: row; align-items: center; align-content: center; width: 100%; height:min(6vh,80px); text-align: center; justify-content:space-around">`
              for(let m=0; m<n[j]; m++){
                tableHTML += `
                    <div style=" background-color: ${color}; color: white; font-weight: 500; height: 150%; flex-grow:1; padding-top: 8px; padding-bottom:0; text-align: center; display: flex; justify-content: space-around; justify-items: center; margin:2px;">         
                    </div>`
                }
              tableHTML += `
                  </div>
                </td>`;
              }
       }else{
          tableHTML += `<td style="height: min(7vh,90px);border: 2px solid white; padding: 8px;"></td>`;
        }
      }

      tableHTML += `</tr>`;
    }
    tableHTML += `</table>`
    tableHTML += `</div>`;
    
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(tableHTML) });
  });
}

function Convert(storedData){
  let NotifTable = {}
  for(let i=0; i<5; i++){
    let x = storedData[Day(i)]
    let length = x.length
    for(let j=0; j< length; j++){
      if (!NotifTable.hasOwnProperty(Day(i))){
        NotifTable[Day(i)] = []
      }
      let currentDate = new Date()
      let time = x[j].time
      let title = x[j].title
      time = new Date(currentDate.toDateString() + " " + time)
      NotifTable[Day(i)].push({ time: time, title: title })
    }
  }
  return NotifTable
}


function Notify_urgent(ClassTime, title){
  chrome.notifications.create('Upcoming Class soon', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: 'Hurry!! ' + title + ' will start soon.',
  }, function(notificationId) {
    console.log('Notification created with ID:', notificationId);
  });
  setTimeout(function () {
    setNotification();
  }, calculateTimeDifference(ClassTime,-1));
}


function Notify_15(ClassTime, title){
  const timeDifference = calculateTimeDifference(ClassTime,15);
  console.log(ClassTime)
  console.log(timeDifference)
  setTimeout(function() {
    chrome.notifications.create('upcoming Class in 15 min', {
      type: 'basic',
      iconUrl: 'icons/1188045.png',
      title: 'Class Reminder',
      message: title + ' class is going to start in 15 minutes.',
    }, function(notificationId) {
      console.log('Notification created with ID:', notificationId);
    });
  }, timeDifference);
  setTimeout(function () {
    setNotification();
  }, calculateTimeDifference(ClassTime,-1));
}


function Notify_no_class(){
  chrome.notifications.create('No Upcoming Class', {
    type: 'basic',
    iconUrl: 'icons/1188045.png',
    title: 'Class Reminder',
    message: 'You have no upcoming class today.',
  }, function(notificationId) {
    console.log('Notification created with ID:', notificationId);
  });
  setTimeout(function() {
    setNotification();
  },60*60*1000);
}


function calculateTimeDifference(targetTime, x) {
  const currentTime = new Date().getTime();
  const targetTimestamp = new Date(targetTime).getTime() - x*60*1000;
  const timeDifference = targetTimestamp - currentTime;
  return timeDifference > 0 ? timeDifference : 0;
}


function Day(i){
  if(i == 0){
      return "Monday"
  }
  if(i == 1){
      return "Tuesday"
  }
  if(i == 2){
      return "Wednesday"
  }
  if(i == 3){
      return "Thursday"
  }
  if(i == 4){
      return "Friday"
  }
}
