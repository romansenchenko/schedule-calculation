const employees = [
  { id: 1, full_name_of_the_employee: "Alex", shift: "07:00-16:00" },
  { id: 2, full_name_of_the_employee: "Blex", shift: "08:00-17:15" },
  
];
export function findBestScheduleDFS() {
  const breaks = {}; // объект для хранения результатов
  const visited = new Set(); // множество для хранения посещенных состояний
  const start = Date.parse("01/01/2000 07:00"); // начальное время для первого перерыва
  const end = Date.parse("01/01/2000 18:00"); // конечное время для последнего перерыва
  let count = 0;

  function dfsHelper(schedule) {
    console.log(()=>{++count});
    if (visited.has(JSON.stringify(schedule))) {
      return; // уже были в этом состоянии
    }
    visited.add(JSON.stringify(schedule));

    // проверка условий для каждого сотрудника
    for (let i = 0; i < employees.length; i++) {
      const e = employees[i];
      let lastEnd = start;
      // проверка первого перерыва
      if (schedule[e.id].break1Start === null) {
        if (schedule[e.id].start + 60 * 60 * 1000 <= end) { // не раньше чем через час
          for (let j = start; j <= end; j += 15 * 60 * 1000) {
            let startTime = new Date(j);
            let endTime = new Date(j + 15 * 60 * 1000);

            // проверка перекрытия с другими перерывами
            let collision = false;
            for (let k = 0; k < employees.length; k++) {
              if (k === i) continue;
              if (schedule[employees[k].id].break1Start === null) continue;
              if (startTime < schedule[employees[k].id].break1End && endTime > schedule[employees[k].id].break1Start) {
                collision = true;
                break;
              }
            }
            if (!collision) {
              schedule[e.id].break1Start = startTime;
              schedule[e.id].break1End = endTime;
              dfsHelper(schedule);
              schedule[e.id].break1Start = null;
              schedule[e.id].break1End = null;
            }
          }
        }
      }

      if (schedule[e.id].break1Start !== null) {
        lastEnd = schedule[e.id].break1End;
      }

      // проверка второго перерыва
      if (schedule[e.id].break2Start === null) {
        if (lastEnd + 60 * 60 * 1000 <= end) { // не позже чем за час до конца
          for (let j = lastEnd + 60 * 60 * 1000 + 60 * 60 * 1000; j <= end - 60 * 60 * 1000 * 2.5; j += 15 * 60 * 1000) {
            let startTime = new Date(j);
            let endTime = new Date(j + 15 * 60 * 1000);

            // проверка перекрытия с другими перерывами
            let collision = false;
            for (let k = 0; k < employees.length; k++) {
              if (k === i) continue;
              if (schedule[employees[k].id].break1Start === null) continue;
              if (schedule[employees[k].id].break2Start === null) continue;
              if (startTime < schedule[employees[k].id].break2End && endTime > schedule[employees[k].id].break2Start) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break1Start) {
                collision = true;
                break;
              }
            }
            if (!collision) {
              schedule[e.id].break2Start = startTime;
              schedule[e.id].break2End = endTime;
              dfsHelper(schedule);
              schedule[e.id].break2Start = null;
              schedule[e.id].break2End = null;
            }
          }
        }
      }

      if (schedule[e.id].break2Start !== null) {
        lastEnd = schedule[e.id].break2End;
      }

      // проверка третьего перерыва
      if (schedule[e.id].break3Start === null) {
        if (lastEnd + 60 * 60 * 1000 <= end) { // не позже чем за час до конца
          for (let j = lastEnd + 60 * 60 * 1000 + 60 * 60 * 1000; j <= end - 60 * 60 * 1000 * 2.5; j += 15 * 60 * 1000) {
            let startTime = new Date(j);
            let endTime = new Date(j + 15 * 60 * 1000);

            // проверка перекрытия с другими перерывами
            let collision = false;
            for (let k = 0; k < employees.length; k++) {
              if (k === i) continue;
              if (schedule[employees[k].id].break1Start === null) continue;
              if (schedule[employees[k].id].break2Start === null) continue;
              if (schedule[employees[k].id].break3Start === null) continue;
              if (startTime < schedule[employees[k].id].break3End && endTime > schedule[employees[k].id].break3Start) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break1Start) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break2Start) {
                collision = true;
                break;
              }
            }
            if (!collision) {
              schedule[e.id].break3Start = startTime;
              schedule[e.id].break3End = endTime;
              dfsHelper(schedule);
              schedule[e.id].break3Start = null;
              schedule[e.id].break3End = null;
            }
          }
        }
      }

      if (schedule[e.id].break3Start !== null) {
        lastEnd = schedule[e.id].break3End;
      }

      // проверка обеда
      if (schedule[e.id].lunchStart === null) {
        if (lastEnd + 60 * 60 * 1000 <= Date.parse("01/01/2000 13:45")) { // обед не позже чем в 13:45
          for (let j = Date.parse("01/01/2000 11:30"); j <= Date.parse("01/01/2000 15:15"); j += 15 * 60 * 1000) {
            let startTime = new Date(j);
            let endTime = new Date(j + 45 * 60 * 1000);

            // проверка перекрытия с другими перерывами
            let collision = false;
            for (let k = 0; k < employees.length; k++) {
              if (k === i) continue;
              if (schedule[employees[k].id].break1Start === null) continue;
              if (schedule[employees[k].id].break2Start === null) continue;
              if (schedule[employees[k].id].break3Start === null) continue;
              if (schedule[employees[k].id].lunchStart === null) continue;
              if (startTime < schedule[employees[k].id].lunchEnd && endTime > schedule[employees[k].id].lunchStart) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break1Start) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break2Start) {
                collision = true;
                break;
              }
              if (endTime + 60 * 60 * 1000 <= schedule[employees[k].id].break3Start) {
                collision = true;
                break;
              }
            }
            if (!collision) {
              schedule[e.id].lunchStart = startTime;
              schedule[e.id].lunchEnd = endTime;
              dfsHelper(schedule);
              schedule[e.id].lunchStart = null;
              schedule[e.id].lunchEnd = null;
            }
          }
        }
      }

      if (schedule[e.id].lunchStart !== null) {
        lastEnd = schedule[e.id].lunchEnd;
      }
    }

    // если получили полный график для всех сотрудников, добавляем его в результаты
    if (Object.keys(schedule).every(key => {
      const s = schedule[key];
      return s.break1Start !== null && s.break1End !== null &&
        s.break2Start !== null && s.break2End !== null &&
        s.break3Start !== null && s.break3End !== null &&
        s.lunchStart !== null && s.lunchEnd !== null;
    })) {
      breaks[JSON.stringify(schedule)] = schedule;
    }
  }

  // генерируем начальное состояние (все значения - null)
  const initialSchedule = {};
  for (let i = 0; i < employees.length; i++) {
    initialSchedule[employees[i].id] = {
      start: Date.parse(`01/01/2000 ${employees[i].shift.split("-")[0]}`),
      break1Start: null,
      break1End: null,
      break2Start: null,
      break2End: null,
      break3Start: null,
      break3End: null,
      lunchStart: null,
      lunchEnd: null
    };
  }

  // запускаем поиск в глубину
  dfsHelper(initialSchedule);

  // находим график с минимальным временем через перерывы и обед
  let minTime = Number.MAX_VALUE;
  let minSchedule = null;
  for (const key in breaks) {
    console.log(`Нахождение минимального графика`);
    const schedule = breaks[key];
    const workTime = {};
    for (let i = 0; i < employees.length; i++) {
      const e = employees[i];
      const s = schedule[e.id];
      const totalTime = end - s.start;
      const breakTime = (s.break1End - s.break1Start) + (s.break2End - s.break2Start) + (s.break3End - s.break3Start);
      const lunchTime = s.lunchEnd - s.lunchStart;
      workTime[e.id] = totalTime - breakTime - lunchTime;
    }
    const timeValues = Object.values(workTime);
    const totalTime = timeValues.reduce((acc, cur) => acc + cur, 0);
    if (totalTime < minTime) {
      minTime = totalTime;
      minSchedule = schedule;
    }
  }

  return minSchedule;
}