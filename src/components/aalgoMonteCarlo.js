// const employees = [
//   {"id":1,"shift":"07:00-16:00"},
//   {"id":2,"shift":"08:00-17:15"},
//   {"id":3,"shift":"06:00-15:15"}
// ];

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const getTime = (time) => {
  const [hour, minute] = time.split(':');
  return new Date().setHours(hour, minute, 0, 0);
};

const getShift = (shift) => {
  const [start, end] = shift.split('-');
  const startTime = getTime(start);
  const endTime = getTime(end);
  return { startTime, endTime };
};

const getBreaks = (shift) => {
  const { startTime, endTime } = getShift(shift);
  const start = new Date(startTime + 60 * 60 * 1000); // первый перерыв не раньше чем через час с момента начала рабочей смены;
  const end = new Date(endTime - 60 * 60 * 1000);  // последний перерыв не позже чем за час до конца рабочей смены;
  const breaks = [];
  let currentDate = start;
  while (currentDate < end) {
    const breakStartDate = new Date(currentDate.getTime() + 60 * 60 * 1000 + getRandomInt(1.5 * 60 * 60 * 1000)); // разрывы между перерывами и перерывом и обедом может быть в диапазоне от 1 часа до 2,5 часов;
    const breakEndDate = new Date(breakStartDate.getTime() + 15 * 60 * 1000);
    breaks.push({ start: breakStartDate, end: breakEndDate });
    currentDate = new Date(breakEndDate.getTime() + 60 * 60 * 1000 + getRandomInt(2.5 * 60 * 60 * 1000)); // разрывы между перерывами и перерывом и обедом может быть в диапазоне от 1 часа до 2,5 часов;
  }
  return breaks;
};

const getLunch = (shift, breaks) => {
  const { startTime, endTime } = getShift(shift);
  const lunchStartTime = new Date(startTime + 4.5 * 60 * 60 * 1000 + getRandomInt(1 * 60 * 60 * 1000)); // обед должен оказаться в диапазоне с 11:30 до 15:15;
  const lunchEndTime = new Date(lunchStartTime.getTime() + 45 * 60 * 1000);
  if (
    lunchStartTime < getTime('11:30') ||
    lunchEndTime > getTime('15:15') ||
    breaks.some((br) => br.start < lunchStartTime && br.end > lunchStartTime) ||
    breaks.some((br) => br.start < lunchEndTime && br.end > lunchEndTime)
  ) {
    return null;
  }
  const lunch = { start: lunchStartTime, end: lunchEndTime };
  return lunch;
};

const getRandomSolution = (employees) => {
  const solution = {};
  for (const employee of employees) {
    const breaks = getBreaks(employee.shift);
    const lunch = getLunch(employee.shift, breaks);
    if (!lunch) {
      return null;
    }
    solution[employee.id] = { breaks, lunch };
  }
  return solution;
};

const calculateScore = (solution, employees) => {
  let score = 0;
  const usedBreaks = {};
  for (const employee of employees) {
    const { breaks, lunch } = solution[employee.id];
    if (usedBreaks[employee.id]) { // нельзя переносить неиспользуемые перерывы на следующий день.
      return Infinity;
    }
    usedBreaks[employee.id] = true;
    score += lunch.end - lunch.start + breaks.reduce((acc, b) => acc + (b.end - b.start), 0);
  }
  return score;
};

 export const monteCarlo = (employees, iterations) => {
  let bestSolution = 5;
  let bestScore = Infinity;
  for (let i = 0; i < iterations; i++) {
    const solution = getRandomSolution(employees);
    if (solution && calculateScore(solution, employees) < bestScore) {
      bestScore = calculateScore(solution, employees);
      bestSolution = solution;
    }
  }
  return bestSolution;
};

