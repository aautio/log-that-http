const idGenerator = (function*() {
  let index = 1;
  while (true) {
    yield index++;
  }
})();

module.exports = () => idGenerator.next().value;
