const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

const addTopLeft = (text) => {
  try {
    const randomXAXIS = getRandomArbitrary(0, 960);
    const randomYAXIS = getRandomArbitrary(0, 200);
    const instance = generateObject(randomXAXIS, randomYAXIS, text, '#C44D58', 'blue');
    World.add(engine.world, [instance]);
  } catch (e) {
    console.log(`addTopLeft ${e}`);
  }
}

const addTopRight = (text) => {
  try {
    const randomXAXIS = getRandomArbitrary(960, 1920);
    const randomYAXIS = getRandomArbitrary(0, 200);
    const instance = generateObject(randomXAXIS, randomYAXIS, text, '#C44D58', 'blue');
    World.add(engine.world, [instance]);
  } catch (e) {
    console.log(`addTopRight ${e}`);
  }
}

const addBottomLeft = (text) => {
  try {
    const randomXAXIS = getRandomArbitrary(0, 960);
    const randomYAXIS = getRandomArbitrary(540, 700);
    const instance = generateObject(randomXAXIS, randomYAXIS, text, '#C44D58', 'blue');
    World.add(engine.world, [instance]);
  } catch (e) {
    console.log(`addTopRight ${e}`);
  }
}

const addBottomRight = (text) => {
  try {
    const randomXAXIS = getRandomArbitrary(960, 1920);
    const randomYAXIS = getRandomArbitrary(540, 700);
    const instance = generateObject(randomXAXIS, randomYAXIS, text, '#C44D58', 'blue');
    World.add(engine.world, [instance]);
  } catch (e) {
    console.log(`addTopRight ${e}`);
  }
}

/*
const generateObject = (x, y, content, fillStyle, color) => {
  const instance = Bodies.rectangle(x, y, 90, 90, {
    render:{
      fillStyle,
      text:{
        color,
        content,
        size:16,
        family:"Papyrus",
      },
    }
  });
  return instance;
}
*/

const generateObject = (x, y, content, fillStyle, color) => {
  const instance = Bodies.circle(x, y, 46, {
    restitution: 1,
    friction: 0,
    render: {
      //fillStyle,
      fillStyle: 'transparent',
      text: {
        //color: 'transparent',
        content,
        size:100,
        family:"Papyrus"
      }
    }
  });

  return instance;
}

const handleSMS = async (payload) => {
  try {
    const {phoneNumber, guess, emoji} = payload;
    switch(guess) {
      case "1":
      case "A":
        addTopLeft(emoji);
        break;
      case "2":
      case "B":
        addTopRight(emoji);
        break;
      case "3":
      case "C":
        addBottomLeft(emoji);
        break;
      case "4":
      case "D":
        addBottomRight(emoji);
        break;
      default:
        break;
    }
  } catch (e) {
    console.log(`handleSMS ${e}`);
  }
}

const fetchAccessToken = async (handler) => {
  // We use jQuery to make an Ajax request to our server to retrieve our 
  // Access Token
  $.getJSON('/token');
}

const getTwilioAuth = async () => {
  try {
    const tokenResponse = await $.getJSON('https://<<INSERT TWILIO SERVERLESS DOMAIN>>/twilio/sync/sync-token');
    return tokenResponse;
  } catch (e) {
    throw e;
  }
}

const authSync = async (tokenResponse) => {
  try {
    const { token } = tokenResponse;
    //console.log(`token: ${token}`);
    const syncClient = new Twilio.Sync.Client(token);

    syncClient.on('tokenAboutToExpire', async () => {
      const tokenResponse = await getTwilioAuth();
      var { token } = tokenResponse;
      syncClient.updateToken(token);
    });

    return syncClient;
  } catch (e) {
    console.log(e);
  }
}

const setSyncClientSubscribe = async (syncClient) => {
  try {
    syncClient.map('players').then(function (map) {
      map.on('itemAdded', function(response) {
        console.log('itemAdded');
        console.log('response', response);

        const { descriptor } = response.item;
        const { data, key } = descriptor;
        console.log('key', key);
        console.log('JSON data', data);
      });

      /*
      map.on('itemUpdated', function(response) {
        console.log('itemUpdated');
        console.log('item', item);
        console.log('key', item.key);
        console.log('JSON data', item.value);
      });
      */
    });

    syncClient.list('votes').then(function(list) {
      list.on('itemAdded', async (response) => {
        console.log('itemAdded');
        console.log(response);
        const payload = response.item.value;
        const { userId, vote} = payload;
        console.log(`${userId} ${vote}`);

        const players = await syncClient.map('players');
        const aPlayerObject = await players.get(userId);
        const aPlayer = aPlayerObject.value;

        console.log('aPlayer', aPlayer);
        const {emojiStatus} = aPlayer;
        handleSMS({
          phoneNumber: userId,
          guess: vote,
          emoji: emojiStatus
        });
      });

      /*
      list.on('itemUpdated', function(item) {
        console.log('itemUpdated');
        console.log(item);
        const { data } = item.item;
        const { index, value } = data;
        console.log(`index ${index}`);
        console.log(`value`, value);
      });
      */
    });
  } catch (e) {
    console.log(`setSyncClientSubscribe: ${e}`);
  }
}