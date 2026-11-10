export function loadChartData() {
  return new Promise(function (resolve, reject) {
    const delay = 500 + Math.random() * 500;
    setTimeout(function () {
      if (Math.random() < 0.3) {
        reject(new Error('Не удалось загрузить данные графика'));
      } else {
        resolve([5, 8, 3, 10, 6]);
      }
    }, delay);
  });
}