const fs = require('fs');
const XLSX = require('xlsx');

// 1. Extract capacities from the previous Excel file
// 1. Extract capacities from the previous Excel file
const oldFile = fs.readFileSync('Draft Timetable_ Monsoon 2026 .xlsx');
const oldWb = XLSX.read(oldFile, { type: 'buffer', cellDates: true });
const oldWs = oldWb.Sheets[oldWb.SheetNames[0]];
const oldRaw = XLSX.utils.sheet_to_json(oldWs, { header: 1, raw: false, dateNF: 'HH:MM:SS' });

const oldHeaders = oldRaw[0];
const oldColRoom = oldHeaders.indexOf('Room');
const oldColCap = oldHeaders.indexOf('Section Capacity');

const oldMaxCap = {};
for (let i = 1; i < oldRaw.length; i++) {
  const row = oldRaw[i];
  const room = String(row[oldColRoom] ?? '').trim();
  if (!room || room === 'Online') continue;
  const cap = parseInt(String(row[oldColCap] ?? '0')) || 0;
  oldMaxCap[room] = Math.max(oldMaxCap[room] ?? 0, cap);
}

// 2. Parse schedule from the new Excel file
const file = fs.readFileSync('Monsoon 2026 Timetable.xlsx');
const wb = XLSX.read(file, { type: 'buffer', cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'HH:MM:SS' });

const headers = raw[0];
const COL = {
  course: headers.indexOf('Course Code'),
  title: headers.indexOf('Course Title'),
  component: headers.indexOf('Component'),
  day: headers.indexOf('Day'),
  startTime: headers.indexOf('Start Time'),
  endTime: headers.indexOf('End Time'),
  room: headers.indexOf('Room'),
  capacity: headers.indexOf('Section Capacity'),
  term: headers.indexOf('Term'),
  instructor: headers.indexOf('Instructor(s)')
};

const validComponents = new Set(['LEC', 'TUT', 'PRAC']);
const validDays = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
const roomMaxCap = {};
const schedule = [];

function parseTimeString(s) {
  if (!s) return -1;
  s = s.trim().toUpperCase();
  const isPM = s.includes('PM');
  const isAM = s.includes('AM');
  const timePart = s.replace(/(AM|PM)/g, '').trim();
  
  const parts = timePart.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    if (!isNaN(h) && !isNaN(m)) {
      if (isPM && h !== 12) h += 12;
      if (isAM && h === 12) h = 0;
      return h * 60 + m;
    }
  }
  const num = parseFloat(s);
  if (!isNaN(num) && num >= 0 && num < 1) {
    return Math.round(num * 24 * 60);
  }
  return -1;
}

for (let i = 1; i < raw.length; i++) {
  const row = raw[i];
  const room = String(row[COL.room] ?? '').trim();
  
  if (!room || room === 'Online') continue;
  
  const oldCap = oldMaxCap[room] || 0;
  const newCap = parseInt(String(row[COL.capacity] ?? '0')) || 0;
  const cap = Math.max(oldCap, newCap);
  roomMaxCap[room] = Math.max(roomMaxCap[room] || 0, cap);

  const comp = String(row[COL.component] ?? '').trim();
  const day = String(row[COL.day] ?? '').trim();
  const startStr = String(row[COL.startTime] ?? '').trim();
  const endStr = String(row[COL.endTime] ?? '').trim();

  if (!validComponents.has(comp) || !validDays.has(day) || !startStr || !endStr) continue;

  const start = parseTimeString(startStr);
  const end = parseTimeString(endStr);
  if (start === -1 || end === -1 || start >= end) continue;

  schedule.push({
    course: String(row[COL.course] ?? ''),
    title: String(row[COL.title] ?? ''),
    component: comp,
    day,
    start,
    end,
    room,
    capacity: cap,
    term: String(row[COL.term] ?? ''),
    instructor: String(row[COL.instructor] ?? '')
  });
}

const scheduleData = { schedule, roomCapacities: roomMaxCap };
fs.writeFileSync('static/schedule_data.json', JSON.stringify(scheduleData, null, 2));
console.log('Room capacities:', Object.keys(roomMaxCap).length);
