const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1483851',
  key: '33f7d7f44d38ff91c104',
  secret: '55aef9641dfa93e130e5',
  cluster: 'ap1',
  useTLS: true
});

const pushNotification = () =>
  setInterval(() => {
    pusher.trigger('my-channel', 'my-event', {
      message: 'hello world'
    });
  }, 15000);

exports.pushNotification = pushNotification;
