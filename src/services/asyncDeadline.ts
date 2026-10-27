/** Stops UI waiting, without pretending the underlying operation was cancelled.
 * Writes must retain a stable operation ID because they can finish after timeout.
 */
export function withDeadline<T>(operation: Promise<T>, milliseconds = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('Kết nối quá lâu; chưa xác nhận kết quả.'), { code: 'deadline-exceeded' })), milliseconds);
    operation.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
