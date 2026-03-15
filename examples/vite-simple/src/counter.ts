/**
 * Vanilla counter: attaches increment behavior to each .counter button.
 */
document.querySelectorAll<HTMLButtonElement>('.counter button').forEach(button => {
  const span = button.querySelector('span');
  if (!span) return;
  let count = 0;
  button.addEventListener('click', () => {
    count += 1;
    span.textContent = String(count);
  });
});
