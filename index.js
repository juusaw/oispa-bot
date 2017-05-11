const twit = require('twit');
const config = require('./config.js');

const Twitter = new twit(config);

const keyword = 'oispa';
const amount = 100;

function predicate(item) {
  // Starts with the keyword
  if (item.text.substring(0, keyword.length).toLowerCase() !== keyword) {
    return false;
  }
  // Has no links
  if (item.text.search('http') >= 0) {
    return false;
  }
  // Has no user mentions
  if (item.text.search('@') >= 0) {
    return false;
  }
  return true;
}

function search() {
  return Twitter.get('search/tweets', { q: keyword, count: amount });
}

function filterData(data) {
  return data.data.statuses.filter(predicate);
}

function getOne(array) {
  return array[Math.floor((Math.random() * array.length))];
}

function post(text) {
  return Twitter.post('statuses/update', { status: text })
}

exports.handler = function() {
  return search().then(filterData)
          .then(getOne)
          .then(r => r.text)
          .then(post)
          .then(res => res.data.text)
          .catch(console.log);
}