const display = document.getElementById("display");
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let editingRow = null;
let alarmTriggered = false;
let alarm5Enabled = false;
let alarm25Enabled = false;
let alarm5Triggered = false;
let alarm25Triggered = false;
const API_BASE_URL = "https://stopwatch-project1-4.onrender.com/";

function start() {
  if (!isRunning) {
    startTime = Date.now() - elapsedTime;
    timer = setInterval(update, 10);
    isRunning = true;
  }
}

function stop() {
  if (isRunning) {
    clearInterval(timer);
    elapsedTime = Date.now() - startTime;
    isRunning = false;
  }
}

function reset() {
  clearInterval(timer);
  startTime = 0;
  elapsedTime = 0;
  isRunning = false;
  display.textContent = "00:00:00";
  alarm5Triggered = false;
  alarm25Triggered = false;
  alarm5Enabled = false;
  alarm25Enabled = false;
}

let saveIndex = 1;

function completed() {
  if (isRunning) {
    clearInterval(timer);
    elapsedTime = Date.now() - startTime;
    isRunning = false;
  }

  const stopwatchTime = display.textContent;
  const now = new Date();
  const systemTime = now.toLocaleTimeString();
  const noteInput = document.getElementById("noteInput");
  const noteValue = noteInput ? noteInput.value : "";

  const tableBody = document.getElementById("hisBody");
  const newRow = document.createElement("tr");

  // ID
  const idCell = document.createElement("td");
  idCell.textContent = ""; // Tạm thời để rỗng
  newRow.appendChild(idCell);


  // Ghi chú (editable)
  const noteCell = document.createElement("td");
  noteCell.textContent = noteValue;
  noteCell.contentEditable = true;
  noteCell.style.cursor = "text";
  newRow.dataset.id = saveIndex; // Gán ID cho dòng để dùng sau

  
  // Thời điểm
  const timeCell = document.createElement("td");
  timeCell.textContent = systemTime;

  // Thời gian
  const timeValueCell = document.createElement("td");
  timeValueCell.textContent = stopwatchTime;

  // Nút xoá
  
  // Gắn các ô vào dòng
  newRow.appendChild(idCell);
  newRow.appendChild(noteCell);
  newRow.appendChild(timeCell);
  newRow.appendChild(timeValueCell);

  newRow.appendChild(deleteCell);
  saveIndex++;
  display.textContent = "00:00:00";
  startTime = 0;
  elapsedTime = 0;
  if (noteInput) noteInput.value = "";
  // Gửi dữ liệu lên backend
  fetch(API_BASE_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    note: noteValue,
    timePoint: systemTime,
    duration: stopwatchTime,
  }),
})
  .then((res) => res.json())
  .then((data) => {
    newRow.dataset.id = data._id;
    idCell.textContent = data._id.slice(-4); // Gán ID vào ô sau khi có _id từ MongoDB
    noteCell.addEventListener("blur", function () {
    const updatedNote = noteCell.textContent;
    fetch(`${API_BASE_URL}/${data._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: updatedNote }),
    }).then((res) => {
      if (!res.ok) {
        alert("Không thể cập nhật ghi chú!");
      }
    });
  });
    // 👉 Tạo nút xoá sau khi có _id
    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.style.color = "white";
    deleteBtn.style.backgroundColor = "#d9534f";
    deleteBtn.style.border = "none";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.style.cursor = "pointer";

    deleteBtn.onclick = function () {
      fetch(`${API_BASE_URL}/${data._id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            tableBody.removeChild(newRow);
          } else {
            alert("Xoá thất bại!");
          }
        })
        .catch(() => alert("Lỗi kết nối server!"));
    };


    tableBody.appendChild(newRow); // Gắn dòng vào bảng sau khi hoàn tất
    loadHistory(); // Load lại toàn bộ để đồng bộ UI
    console.log("Đã lưu:", data);
  })
  .catch((err) => console.error("Lỗi lưu:", err));
}

function update() {
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;

  let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  let seconds = Math.floor((elapsedTime / 1000) % 60);
  let milliseconds = Math.floor((elapsedTime % 1000) / 10);

  hours = String(hours).padStart(2, "0");
  minutes = String(minutes).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  milliseconds = String(milliseconds).padStart(2, "0");

  const currentFormatted = `${hours}:${minutes}:${seconds}`;
  display.textContent = currentFormatted;

  const alarmHour = String(document.getElementById("alarmHour").value).padStart(
    2,
    "0"
  );
  const alarmMinute = String(
    document.getElementById("alarmMinute").value
  ).padStart(2, "0");
  const alarmSecond = String(
    document.getElementById("alarmSecond").value
  ).padStart(2, "0");

  const alarmTime = `${alarmHour}:${alarmMinute}:${alarmSecond}`;

  if (alarmTime === currentFormatted && !alarmTriggered) {
    document.getElementById("alarmSound").play();
    alarmTriggered = true;
  }

  const totalSeconds = Math.floor(elapsedTime / 1000);

  if (alarm5Enabled && !alarm5Triggered && totalSeconds >= 300) {
    // 5 phút = 300 giây
    document.getElementById("sound5").play();
    alarm5Triggered = true;
  }

  if (alarm25Enabled && !alarm25Triggered && totalSeconds >= 1500) {
    // 25 phút = 1500 giây
    document.getElementById("sound25").play();
    alarm25Triggered = true;
  }
}

document.getElementById("filterInput").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  const rows = document.querySelectorAll("#hisBody tr");

  rows.forEach((row) => {
    const noteText = row.cells[1].textContent.toLowerCase();
    if (noteText.includes(keyword)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});
function stopAlarm() {
  const alarm = document.getElementById("alarmSound");

  alarm.pause();
  alarm.currentTime = 0;
  alarmTriggered = false;
  const sound5 = document.getElementById("sound5");
  const sound25 = document.getElementById("sound25");

  sound5.pause();
  sound5.currentTime = 0;

  sound25.pause();
  sound25.currentTime = 0;
}

function setAlarm5() {
  alarm5Enabled = true;
  alarm5Triggered = false;
  alert("Chuông 5 phút đã được đặt");
}

function setAlarm25() {
  alarm25Enabled = true;
  alarm25Triggered = false;
  alert("Chuông 25 phút đã được đặt");
}
function loadHistory() {
  fetch(API_BASE_URL)
    .then((res) => res.json())
    .then((data) => {
      const tableBody = document.getElementById("hisBody");
      tableBody.innerHTML = ""; // Xoá cũ

      data.forEach((record) => {
        const newRow = document.createElement("tr");
        newRow.dataset.id = record._id; // ⚠️ Gán _id từ MongoDB

        // ID
        const idCell = document.createElement("td");
        idCell.textContent = record._id.slice(-4); // lấy 4 ký tự cuối cho gọn

        // Ghi chú
        const noteCell = document.createElement("td");
        noteCell.textContent = record.note;
        noteCell.contentEditable = true;

        // Thời điểm
        const timeCell = document.createElement("td");
        timeCell.textContent = record.timePoint;

        // Thời gian
        const durationCell = document.createElement("td");
        durationCell.textContent = record.duration;


        const deleteCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        // Xoá
        deleteBtn.textContent = "X";
        deleteBtn.style.backgroundColor = "#d9534f";
        deleteBtn.style.color = "white";
        deleteBtn.style.border = "none";
        deleteBtn.style.padding = "4px 8px";
        deleteBtn.style.cursor = "pointer";

        deleteCell.appendChild(deleteBtn);

        // Gắn vào row
        newRow.appendChild(idCell);
        newRow.appendChild(noteCell);
        newRow.appendChild(timeCell);
        newRow.appendChild(durationCell);
        newRow.appendChild(deleteCell);

        tableBody.appendChild(newRow);
      });
    })
    .catch((err) => console.error("Lỗi load history:", err));
}
window.onload = loadHistory;
