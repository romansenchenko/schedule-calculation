const employees = [
  { "id": 1, "shift": "07:00-16:00" },
  { "id": 2, "shift": "08:00-17:15" },
  { "id": 3, "shift": "06:00-15:15" },
  { "id": 4, "shift": "09:00-18:00" },
  { "id": 5, "shift": "09:00-18:00" }
];

export function generateSchedule() {
  // приведем график работы к удобному формату и рассчитаем ограничения
  let formattedEmployees = [];

  employees.forEach(employee => {
    let shift = employee.shift.split('-');
    let start = timeToMinutes(shift[0]);
    let end = timeToMinutes(shift[1]);
    let break1Start = start + 60;
    let break1End = break1Start + 15;
    let break2Start = break1End + randomInt(60, 150);
    let break2End = break2Start + 15;
    let break3Start = break2End + randomInt(60, 150);
    let break3End = break3Start + 15;
    let lunchStart = randomInt(timeToMinutes('11:30'), timeToMinutes('13:30'));
    let lunchEnd = lunchStart + 45;

    // проверяем ограничения по времени
    if (break1Start <= start + 15) {
      break1Start = start + 75;
      break1End = break1Start + 15;
    }
    if (break3End >= end - 60) {
      break3End = end - 60;
      break3Start = break3End - 15;
      if (break2End > break3Start - 60) {
        break2End = break3Start - 60;
        break2Start = break2End - 15;
      }
    }
    if (lunchStart < break1Start + 60) {
      lunchStart = break1Start + 60;
      lunchEnd = lunchStart + 45;
    }
    if (lunchStart > break2End - 60 && lunchStart < break3Start - 60) {
      lunchStart = break2End - 60;
      lunchEnd = lunchStart + 45;
    }
    if (lunchStart > break3End - 45) {
      lunchStart = break3End - 45;
    }

    formattedEmployees.push({
      id: employee.id,
      start: start,
      end: end,
      break1Start: break1Start,
      break1End: break1End,
      break2Start: break2Start,
      break2End: break2End,
      break3Start: break3Start,
      break3End: break3End,
      lunchStart: lunchStart,
      lunchEnd: lunchEnd
    });
  });

  let n = formattedEmployees.length;

  // разрешим не более 4 перерывов
  let A = Array.from(Array(4), () => Array(n).fill(0));
  let b = Array.from(Array(4), () => 45);
  let c = Array.from(Array(n), () => 1);

  // ограничения на перерывы
  formattedEmployees.forEach((employee, i) => {
    A[0][i] = employee.break1End - employee.break1Start;
    A[1][i] = employee.break2End - employee.break2Start;
    A[2][i] = employee.break3End - employee.break3Start;
    A[3][i] = employee.lunchEnd - employee.lunchStart;
  });

  // ограничения на перерывы между собой
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let e1 = formattedEmployees[i];
      let e2 = formattedEmployees[j];
      let intervals = [
        [e1.start, e1.break1Start - 15],
        [e1.break1End + 15, e1.break2Start - 15],
        [e1.break2End + 15, e1.break3Start - 15],
        [e1.break3End + 15, e1.lunchStart - 15],
        [e1.lunchEnd + 15, e1.end]
      ];
      for (let k = 0; k < intervals.length; k++) {
        let b1 = intervals[k][0];
        let e1 = intervals[k][1];
        if (b1 > e2.start + 15 && b1 < e2.end - 15) {
          A.push(Array(n).fill(0));
          A[A.length - 1][i] = 1;
          A[A.length - 1][j] = 1;
          b.push(e1 - b1);
        }
      }
    }
  }

  // ограничения на время работы
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let e1 = formattedEmployees[i];
      let e2 = formattedEmployees[j];
      if (e1.start <= e2.start) {
        if (e1.end >= e2.start) {
          A.push(Array(n).fill(0));
          A[A.length - 1][i] = 1;
          A[A.length - 1][j] = 1;
          b.push(Math.min(e1.end, e2.end) - e2.start);
        }
      } else {
        if (e2.end >= e1.start) {
          A.push(Array(n).fill(0));
          A[A.length - 1][i] = 1;
          A[A.length - 1][j] = 1;
          b.push(Math.min(e1.end, e2.end) - e1.start);
        }
      }
    }
  }

  let simplex = new SimplexSolver();
  simplex.solve(c, A, b);

  let result = {
    breaks: [],
    lunch: {
      start: 0,
      end: 0
    }
  };

  for (let i = 0; i < n; i++) {
    let employee = formattedEmployees[i];
    let breaks = [];

    if (simplex.solution[i] > 0) {
      breaks.push({ start: employee.start, end: employee.break1Start - 15 });
    }
    if (simplex.solution[i] > 0.33) {
      breaks.push({ start: employee.break1End + 15, end: employee.break2Start - 15 });
    }
    if (simplex.solution[i] > 0.66) {
      breaks.push({ start: employee.break2End + 15, end: employee.break3Start - 15 });
    }
    if (simplex.solution[i] > 0.99) {
      breaks.push({ start: employee.break3End + 15, end: employee.lunchStart - 15 });
    }

    result.breaks = result.breaks.concat(breaks);
  }

  // найдем обед
  let lunch = formattedEmployees.reduce((acc, employee) => {
    if (employee.lunchStart >= acc.start && employee.lunchEnd <= acc.end) {
      return { start: employee.lunchStart, end: employee.lunchEnd };
    }
    return acc;
  }, { start: timeToMinutes('11:30'), end: timeToMinutes('15:15') });

  result.lunch = {
    start: minutesToTime(lunch.start),
    end: minutesToTime(lunch.end)
  };

  return result;
}

// вспомогательные функции
function timeToMinutes(time) {
  let parts = time.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function minutesToTime(minutes) {
  let hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  let mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

