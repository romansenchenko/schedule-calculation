// const employees = 
// [
//   { id: 1, full_name_of_the_employee: "Alex", shift: "07:00-16:00" },
//   { id: 2, full_name_of_the_employee: "Blex", shift: "08:00-17:15" },
//   { id: 3, full_name_of_the_employee: "Clex", shift: "06:00-15:15" },
//   { id: 4, full_name_of_the_employee: "Dlex", shift: "09:00-18:00" },
//   { id: 5, full_name_of_the_employee: "Sasha", shift: "09:00-18:00" },
//   { id: 6, full_name_of_the_employee: "Alex", shift: "07:00-16:00" },
//   { id: 7, full_name_of_the_employee: "Blex", shift: "08:00-17:15" },
//   { id: 8, full_name_of_the_employee: "Clex", shift: "06:00-15:15" },
//   { id: 9, full_name_of_the_employee: "Dlex", shift: "09:00-18:00" },
//   { id: 10, full_name_of_the_employee: "Sasha", shift: "09:00-18:00" },
// ];
export function calculateBreaksModeling(employees) {
  let result = {}; // создаем пустой объект для результатов
  let intervals = {}; // создаем объект для хранения временных интервалов каждого сотрудника

  // записываем временные интервалы каждого сотрудника в объект intervals
  employees.forEach(function (emp) {
    intervals[emp.id] = getWorkingIntervals(emp.shift);
  });

  // проходимся по массиву сотрудников
  employees.forEach(function (emp) {
    let empIntervals = intervals[emp.id]; // получаем временные интервалы текущего сотрудника

    // определяем возможные времена для первого и последнего перерыва
    let firstBreakStart = addMinutes(empIntervals[0].start, 60);
    let lastBreakEnd = addMinutes(
      empIntervals[empIntervals.length - 1].end,
      -60
    );

    // проходимся по всем возможным временам для первого перерыва
    for (let i = firstBreakStart; i <= lastBreakEnd; i = addMinutes(i, 15)) {
      // определяем возможные времена для второго и третьего перерывов, а также для обеда
      let secondBreakStart = addMinutes(i, 60 + 60);
      let thirdBreakStart = addMinutes(secondBreakStart, 60 + 15);
      let lunchStart = addMinutes(empIntervals[0].start, 330);
      let lunchEnd = addMinutes(lunchStart, 45);
      // проходимся по всем возможным временам для второго перерыва
      for (let j = secondBreakStart; j <= lastBreakEnd; j = addMinutes(j, 15)) {
        // проверяем, что временные интервалы перерывов не пересекаются между собой
        if (intervalIntersection(i, addMinutes(i, 15), j, addMinutes(j, 15)))
          continue;

        // проходимся по всем возможным временам для третьего перерыва
        for (
          let k = thirdBreakStart;
          k <= lastBreakEnd;
          k = addMinutes(k, 15)
        ) {

          
          // проверяем, что временные интервалы перерывов не пересекаются между собой
          if (
            intervalIntersection(i, addMinutes(i, 15), j, addMinutes(j, 15)) ||
            intervalIntersection(i, addMinutes(i, 15), k, addMinutes(k, 15)) ||
            intervalIntersection(j, addMinutes(j, 15), k, addMinutes(k, 15))
          )
            continue;

          // проверяем, что временной интервал обеда попадает в указанный диапазон времени
          if (
            intervalIntersection(lunchStart, lunchEnd, j, addMinutes(j, 15)) ||
            intervalIntersection(lunchStart, lunchEnd, k, addMinutes(k, 15))
          )
            continue;

          // если все условия выполнены, то записываем информацию о перерывах и обеде в объект result
          result[emp.id] = {
            firstBreak: {
              start: formatDate(i),
              end: formatDate(addMinutes(i, 15)),
            },
            secondBreak: {
              start: formatDate(j),
              end: formatDate(addMinutes(j, 15)),
            },
            thirdBreak: {
              start: formatDate(k),
              end: formatDate(addMinutes(k, 15)),
            },
            lunch: {
              start: formatDate(lunchStart),
              end: formatDate(lunchEnd),
            },
          };
        }
      }
    }
  });

  // возвращаем объект result с информацией о перерывах и обеде для каждого сотрудника
  return result;
}

// функция для получения временных интервалов рабочего времени
function getWorkingIntervals(shift) {
  let arr = shift.split("-");
  let start = new Date("01/01/2000 " + arr[0]);
  let end = new Date("01/01/2000 " + arr[1]);
  let intervals = [];

  intervals.push({
    start: start,
    end: end,
  });

  if (differenceInMinutes(end, start) >= 600) {
    // если рабочая смена больше или равна 10 часам
    let mid = addMinutes(start, 270); // определяем середину рабочей смены

    intervals.push({
      start: start,
      end: mid,
    });

    intervals.push({
      start: mid,
      end: end,
    });
  }

  return intervals;
}

// функция для добавления n минут к дате
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// функция для определения пересечения двух временных интервалов
function intervalIntersection(start1, end1, start2, end2) {
  if (start1 >= end2 || start2 >= end1) {
    return false;
  } else {
    return true;
  }
}

// функция для форматирования даты в указанный формат (DD.MM.YYYY HH:mm)
function formatDate(date) {
  //let day = date.getDate().toString().padStart(2, "0");
  //let month = (date.getMonth() + 1).toString().padStart(2, "0");
  //let year = date.getFullYear().toString();
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");

  //return `${day}.${month}.${year} ${hours}:${minutes}`;
  return `${hours}:${minutes}`;
}

// функция для определения разницы в минутах между двумя датами
function differenceInMinutes(date1, date2) {
  return Math.round(
    Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60))
  );
}
