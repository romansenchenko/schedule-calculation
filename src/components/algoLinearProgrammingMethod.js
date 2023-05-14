export function scheduleBreaksLinear(employees) {
  // Конвертируем время в минуты с начала дня
  function timeToMinutes(time) {
    let [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Конвертируем минуты в строку времени
  function minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  // Функция для проверки, удовлетворяет ли расписание ограничениям
  function isValidSchedule(schedule, shiftStart, shiftEnd) {
    // Проверяем, что время кратно 15 минутам
    for (let time of Object.values(schedule)) {
      if (time.start % 15 !== 0 || time.end % 15 !== 0) return false;
    }

    // Проверяем, что первый перерыв не раньше чем через час с момента начала рабочей смены
    if (schedule.firstBreak.start < shiftStart + 60) return false;

    // Проверяем, что первый перерыв только позже 8:45
    if (schedule.firstBreak.start < timeToMinutes("8:45")) return false;

    // Проверяем, что последний перерыв не позже чем за час до конца рабочей смены
    if (schedule.thirdBreak.end > shiftEnd - 60) return false;

    // Проверяем разрывы между перерывами и перерывом и обедом
    if (
      schedule.secondBreak.start - schedule.firstBreak.end < 60 ||
      schedule.secondBreak.start - schedule.firstBreak.end > 150
    )
      return false;
    if (
      schedule.lunch.start - schedule.secondBreak.end < 60 ||
      schedule.lunch.start - schedule.secondBreak.end > 150
    )
      return false;
    if (
      schedule.thirdBreak.start - schedule.lunch.end < 60 ||
      schedule.thirdBreak.start - schedule.lunch.end > 150
    )
      return false;

    // Проверяем, что обед должен оказаться в диапазоне с 11:30 до 15:15
    if (
      schedule.lunch.start < timeToMinutes("11:30") ||
      schedule.lunch.end > timeToMinutes("15:15")
    )
      return false;

    return true;
  }

  let result = {};

  for (let employee of employees) {
    let [shiftStartStr, shiftEndStr] = employee.shift.split("-");
    let shiftStart = timeToMinutes(shiftStartStr);
    let shiftEnd = timeToMinutes(shiftEndStr);

    // Генерируем все возможные расписания для этого сотрудника
    for (
      let firstBreakStart = shiftStart + 60;
      firstBreakStart <= shiftEnd - 195;
      firstBreakStart += 15
    ) {
      for (
        let secondBreakStart = firstBreakStart + 75;
        secondBreakStart <= shiftEnd - 135;
        secondBreakStart += 15
      ) {
        for (
          let lunchStart = secondBreakStart + 75;
          lunchStart <= shiftEnd - 75;
          lunchStart += 15
        ) {
          for (
            let thirdBreakStart = lunchStart + 75;
            thirdBreakStart <= shiftEnd - 15;
            thirdBreakStart += 15
          ) {
            let schedule = {
              firstBreak: { start: firstBreakStart, end: firstBreakStart + 15 },
              secondBreak: {
                start: secondBreakStart,
                end: secondBreakStart + 15,
              },
              lunch: { start: lunchStart, end: lunchStart + 45 },
              thirdBreak: { start: thirdBreakStart, end: thirdBreakStart + 15 },
            };

            // Проверяем, удовлетворяет ли расписание ограничениям
            if (!isValidSchedule(schedule, shiftStart, shiftEnd)) continue;

            // Если расписание удовлетворяет ограничениям, сохраняем его в результате
            result[employee.id] = {};
            for (let [key, value] of Object.entries(schedule)) {
              result[employee.id][key] = {
                start: minutesToTime(value.start),
                end: minutesToTime(value.end),
              };
            }

            // Прерываем цикл после нахождения первого подходящего расписания
            break;
          }
          if (result[employee.id]) break;
        }
        if (result[employee.id]) break;
      }
      if (result[employee.id]) break;
    }
  }

  return result;
}
