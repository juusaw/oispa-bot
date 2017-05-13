const twit = require('twit');
const AWS = require('aws-sdk');
const config = require('./config.js');

const Twitter = new twit(config);
const DB = new AWS.DynamoDB({ region: 'eu-west-1' });

const tableName = 'oispa-tweet';
const botName = 'oispabot';
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
  // Tweet is not by the bot itself
  if (item.user.screen_name === botName) {
    return false;
  }
  return true;
}

function search() {
  return Twitter.get('search/tweets', { q: keyword, count: amount });
}

function filterData(response) {
  return response.data.statuses.filter(predicate);
}

function getOne(array) {
  return array[Math.floor((Math.random() * array.length))];
}

function post(tweet) {
  return Twitter.post('statuses/update', { status: tweet.text }).then(_ => tweet);
}

function addToDB(tweet) {
  const params = {
    TableName: tableName,
    Item: {
        Id:        { S: tweet.id_str },
        Text:      { S: tweet.text },
        Author:    { S: tweet.user.screen_name },
        TimeAdded: { N: (+new Date).toString() }
    }
  };
  return DB.putItem(params).promise().then(_ => tweet);
}

exports.handler = function() {
  return search().then(filterData)
          .then(getOne)
          .then(post)
          .then(addToDB)
          .then(res => res.text)
          .catch(console.error);
}

exports.handler = lambda;
module.exports  = lambda;