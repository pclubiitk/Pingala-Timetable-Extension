function getPersonalData(){
    let dp=document.getElementsByClassName('pull-left image')[0].getElementsByTagName('img')[0].src;
    let name=document.getElementsByClassName('pull-left info')[0].getElementsByTagName('p')[0].innerHTML.trim();
    let str=document.getElementsByClassName('content-header')[0]
    .getElementsByClassName('breadcrumb')[0]
    .getElementsByTagName('li')[1].innerText;
    
    
    // let d=document.getElementsByClassName('col-lg-12');
    // let roll_no;
    // let programme;
    // let dept;
    // let appliedCredits;
    // for(let i=1;i<d.length;i++){
    //     if(d[i].getElementsByTagName('div')[0].previousElementSibling.innerText==="Applied Credits :"){
    //         appliedCredits=d[i].getElementsByTagName('div')[0].innerText;
    //     }
    //     else if(d[i].getElementsByTagName('div')[0].previousElementSibling.innerText==="Roll No. :"){
    //         roll_no=d[i].getElementsByTagName('div')[0].innerText;
    //     }
    //     else if(d[i].getElementsByTagName('div')[0].previousElementSibling.innerText==="Programme :"){
    //         programme=d[i].getElementsByTagName('div')[0].innerText;
    //     }
    //     else if(d[i].getElementsByTagName('div')[0].previousElementSibling.innerText==="Department :"){
    //         dept=d[i].getElementsByTagName('div')[0].innerText;
    //     }
    // }
        
    let roll_no=document.getElementsByClassName('row col-lg-12 form-group')[0].getElementsByClassName('col-sm-4 col-lg-8 col-xs-4 col-md-4')[0].innerText;
    let programme=document.getElementsByClassName('row col-lg-12 form-group')[1].getElementsByClassName('col-sm-4 col-lg-8 col-xs-4 col-md-4')[0].innerText;
    let dept=document.getElementsByClassName('row col-lg-12 form-group')[1].getElementsByClassName('col-sm-4 col-lg-8 col-xs-4 col-md-4')[1].innerText;
    let appliedCredits=document.getElementsByClassName('row col-lg-12 form-group')[2].getElementsByClassName('col-sm-4 col-lg-8 col-xs-4 col-md-4')[0].innerText;
  
    let sem="";
    for(let i=0;i<str.length;i++){
        if((str[i]>='0'&&str[i]<='9')||str[i]==='/') sem+=str[i];
    }
    sem=sem.slice(0,4) +'-'+sem.slice(4);
    return {dp:dp,name:name,roll_no:roll_no,programme:programme,dept:dept,appliedCredits:appliedCredits,sem:sem};

}    


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === 'GetTT') {
        
        const bodyContent = document.body.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, 'text/html');
        let timetable = {}
        let personal_data = {}
        if(!CheckSite(doc)){
            sendResponse({timetable: timetable, personal_data: personal_data});
            return
        }
        personal_data = getPersonalData();
        const datatable1 = doc.getElementById("datatable1");
      
        if (datatable1) {
          const content = datatable1.getElementsByTagName("tbody");
          const rows = content[0].getElementsByTagName("tr");
          // console.log(rows.length)
          for (let j = 0; j < rows.length; j++) {
            const x = rows[j].getElementsByTagName("td");
            let lectureData = [];
            let tutorialData = [];
            let practicalData = [];
            const inputString = x[8].innerText;
            const parts = inputString.split(',');
            const lhc=parseLHC(inputString)
            for (const part of parts) {
              // console.log(part)
              if (part.includes('Lec')) {
                const data = parseTimeAndDays(part,'Lec');
                if (data) {
                  lectureData.push(data)
                }
              } 
              else if (part.includes('Tut')) {
                const data = parseTimeAndDays(part,'Tut');
                // console.log(data)
                if (data) {
                  tutorialData.push(data);
                }
              } 
              else if (part.includes('Prc')) {
                const data = parseTimeAndDays(part,'Prc');
                if (data) {
                  practicalData.push(data);
                }
              }
            }
            
            if (lectureData.length > 0) {
                for (const day0 of lectureData[0].days) {
                    let day=Day(day0)
                    if (!timetable.hasOwnProperty(day)) {
                        timetable[day] = [];
                    }
                if(!(lectureData[0].start==="00:00"||lectureData[0].end==="00:00")){
                  timetable[day].push({
                  time: lectureData[0].start,
                  time_end: lectureData[0].end,
                  title: "Lec-"+removeExtas(x[1].innerText),
                  lectureHall: lhc
                });
                }
              }
            }
            
            if (tutorialData.length > 0) {
              for (const day0 of tutorialData[0].days) {
                let day=Day(day0)
                    if (!timetable.hasOwnProperty(day)) {
                        timetable[day] = [];
                    }
                    if(!(tutorialData[0].start==="00:00"||tutorialData[0].end==="00:00")){
                            timetable[day].push({
                            time: tutorialData[0].start,
                            time_end: tutorialData[0].end,
                            title: "Tut-"+removeExtas(x[1].innerText),
                            lectureHall: ''
                        });
                    }
              }
            }
            
            if (practicalData.length > 0) {
                for (const day0 of practicalData[0].days) {
                    let day=Day(day0)
                    if (!timetable.hasOwnProperty(day)) {
                        timetable[day] = [];
                    }
                if(!(practicalData[0].start==="00:00"||practicalData[0].end==="00:00")){
                    timetable[day].push({
                    time: practicalData[0].start,
                    time_end: practicalData[0].end,
                    title: "Prc-"+removeExtas(x[1].innerText),
                    lectureHall: ''
                  });
                }
              }
            }
          }
          const days=['Monday','Tuesday','Wednesday','Thursday','Friday']
          for(const day in days){
            timetable[days[day]].sort(compareTime);
          }
        }
        sendResponse({ timetable: timetable, personal_data: personal_data });


    //     const content = doc.getElementsByClassName("fc-event-container")
    //     let d = -1;
    //     for(let i=0; i<content.length; i++){
    //     const x = content[i].getElementsByClassName("fc-content")
    //     if(!(x.length)){
    //         d++;
    //     }
    //     for(let j=0; j<x.length; j++){
    //         const time1 = x[j].getElementsByClassName("fc-time")
    //         const title1 = x[j].getElementsByClassName("fc-title")
    //         let time = null
    //         let time_start = null;
    //         let time_end = null;
    //         let title = null;
    //         Array.from(time1).forEach((element) => {
    //             time = element.getAttribute("data-full")
    //             for(let k=0; k<time.length; k++){
    //                 if(time[k] === '-'){
    //                     time_start = time.slice(0,k-1)
    //                     time_end = time.slice(k+2)
    //                 }
    //             }
    //           });
    //         Array.from(title1).forEach((element) => {
    //             title = element.innerText
    //           });
    //         let day = Day(d);
            // if (!timetable.hasOwnProperty(day)) {
            //     timetable[day] = [];
            // }
            // timetable[day].push({ time: time_start, time_end: time_end, title: title , lectureHall : '' })
    //     }
    //   }
    //   sendResponse({timetable: timetable, personal_data: personal_data});
    }
    // if(request.action === 'LHC'){
    //     const bodyContent = document.body.innerHTML;
    //     const parser = new DOMParser();
    //     const doc = parser.parseFromString(bodyContent, 'text/html');
    //     chrome.runtime.sendMessage({action: 'alert', alert_type: CheckSite_1(doc)});
    //     if(CheckSite_1(doc) !== '3'){
    //         return
    //     }
    //     let data
    //     search(request.courses, 10).then(LHC => {
    //         console.log(LHC)
    //         chrome.runtime.sendMessage({ action: 'LHCData', data: LHC });
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     });
    // }
});

async function search(queries, delay) {
    let LHC = {}
    const parent = document.getElementById('datatable_filter');
    const input = parent.querySelector('.form-control');
  
    for (const query of queries) {
        console.log(query);
        input.value = '(' + query + ')';
        const inputEvent = new Event('input', { bubbles: true });
        input.dispatchEvent(inputEvent);
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        
        await new Promise(resolve => setTimeout(resolve, delay));

        const table = document.getElementById('datatable');
        const tbody = table.tBodies[0]
        const firstRow = tbody.rows[0];
        const firstCell = firstRow.cells[9];
        const innerText = firstCell.innerText;
        LHC[query] = innerText
        console.log(innerText);
    }
    return LHC
}
  

// function CheckSite_1(doc){
//     const header = doc.getElementById('headerText')
//     if(header == null){
//         return '1'
//     }
//     if(header.innerText != ' Check Timetable'){
//         return '1'
//     }
//     const show = doc.getElementById('showTimeTableBtn')
//     if (showTimeTableBtn.getAttribute('disabled') !== null) {
//         return '2'
//     }
//     if(showTimeTableBtn.getAttribute('disabled') == null){
//         const table = document.getElementById('datatable');
//         const tbody = table.tBodies[0]
//         if(tbody.innerText === 'No data available in table'){
//             InvalidSite_1(2)
//             return '2'
//         }
//     }
//     return '3'
// }


function CheckSite(doc){
    const header = doc.getElementById('headerText')
    if(header === null){
        return false
    }
    if(!header.innerText.includes('Status')){
        return false
    }
    return true
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

function parseTimeAndDays(input,classType) {
  let idx=input.indexOf(classType)
  idx+=5;
  let dayString=''
  let startTime=''
  let endTime=''
  let lhc=''
  while(input[idx]>='A'&&input[idx]<='Z'||input[idx]>='a'&&input[idx]<='z'){
    dayString+=input[idx]
    idx++
  }
  idx++
  for(let i=0;i<5;i++){
    startTime+=input[idx];
    idx++
  }
  idx++
  for(let i=0;i<5;i++){
    endTime+=input[idx];
    idx++
  }
  let days=[]
  if(dayString.includes('M')) days.push(0)
  if(dayString.includes('W')) days.push(2)
  if(dayString.includes('F')) days.push(4)
  idx=dayString.indexOf('T');
  let count=0;
  for(let i=0;i<dayString.length;i++){
    if(dayString[i]==='T') count++;
  }
  if(count==2){
    days.push(1);
    days.push(3);
  }
  else if(count==1){
    idx=dayString.indexOf('T')
    if(idx==dayString.length-1) days.push(1)
    else if(dayString[idx+1]=='h'){
      days.push(3)
    }
  }
  return({days:days,start:startTime,end:endTime,})
}

function removeExtas(s){
  let out='';
  for(let i =0;i<s.length;i++){
    if(s[i]>='A'&&s[i]<='Z'||s[i]>='a'&&s[i]<='Z'||s[i]>='0'&&s[i]<='9') out+=s[i]
  }
  return out
}
function parseLHC(input){
  let idx=input.indexOf('(')
  let lhc=''
  if(idx==-1) return lhc;
  idx++;
  while(input[idx]!=')'){
    lhc+=input[idx]
    idx++
  }
  return lhc
}

function compareTime(a, b) {
  const timeA = a.time;
  const timeB = b.time;

  if (timeA < timeB) {
    return -1;
  }
  if (timeA > timeB) {
    return 1;
  }
  return 0;
}
