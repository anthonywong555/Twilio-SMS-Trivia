
const Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Bodies = Matter.Bodies;

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
  element: document.getElementById('selection'),
  engine,
  options: {
    wireframes: false,
    background: 'transparent', // or '#ff0000' or other valid color string,
    height: 1080,
    width: 1920
  }
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

const buildGrid = () => {
  const topBoundry = Bodies.rectangle(960, 0, 1920, 10, { isStatic: true });
  const bottomBoundry = Bodies.rectangle(960, 1080, 1920, 10, { isStatic: true });
  const leftBoundry = Bodies.rectangle(0, 540, 10, 1080, { isStatic: true });
  const rightBoundry = Bodies.rectangle(1920, 540, 10, 1080, { isStatic: true });

  const crossBoundry1 = Bodies.rectangle(960, 540, 1920, 10, { isStatic: true });
  const crossBoundry2 = Bodies.rectangle(960, 540, 10, 1080, { isStatic: true });

  World.add(engine.world, [topBoundry, bottomBoundry, leftBoundry, rightBoundry, crossBoundry1, crossBoundry2]);
}

const resetGrid = () => {
  World.clear(engine.world, false, false);
  buildGrid();
}

const renderQuestion = (questionObject) => {
  console.log(questionObject);
  const {question, selections, backgroundImage} = questionObject;
  $("img#main-background").attr('src', backgroundImage);
  $("div#question").append(`<p>${question}</p>`);

  for(let i = 1; i < selections.length + 1; i++) {
    const aSelection = selections[i-1];
    const {label} = aSelection;
    let cssClass = 'selections';
    if(i % 2 == 0) {
      cssClass += ' selections-right';
    } else {
      cssClass += ' selections-left';
    }

    if(i < 3) {
      cssClass += ' selections-first-row';
    } else {
      cssClass += ' selections-second-row';
    }

    $("div#possible-answer").append(`<strong class="${cssClass}">${label}</strong>`);
  }
}

const questions = 
{
  "questions": [
      {
          "question": "Which Hogwarts House Would You Be In?",
          "backgroundImage": "./img/hogwartshouse.png",
          "answers": ["A","B"],
          "selections": [{
              "label": "1. Gryffindor",
              "values": ["A", "a"]
          }, {
              "label": "2. Slytherin",
              "values": ["B", "b"]
          }, {
              "label": "3. Hufflepuff",
              "values": ["C", "c"]
          }, {
              "label": "4. Ravenclaw",
              "values": ["D", "d"]
          }]
      }
  ]
};

let currentQuestionIndex = -1;

//renderQuestion(questions.questions[currentQuestionIndex]);

const resetHTML = () => {
  $("div#possible-answer").empty();
  $("div#question").empty();
}

let syncClient = null;

const setSyncClient = (targetSyncClient) => {
  syncClient = targetSyncClient;
}

const previousQuestion = async () => {
  currentQuestionIndex--;

  resetGrid();
  resetHTML();
  renderQuestion(questions.questions[currentQuestionIndex]);

  // Back-End
  const doc = await syncClient.document('settings');
  await doc.update({currentQuestionIndex});
}

const nextQuestion = async () => {
  currentQuestionIndex++;

  if(currentQuestionIndex < questions.questions.length) {
    // Front-End
    resetGrid();
    resetHTML();
    renderQuestion(questions.questions[currentQuestionIndex]);

    // Back-End
    const doc = await syncClient.document('settings');
    await doc.update({currentQuestionIndex});
  }
}

const createNewSession = async () => {
  const doc = await syncClient.document('settings');
  await doc.update({currentQuestionIndex});


  for(let i = 0; i < questions.questions.length; i++) {
    const syncListName = `question${i}`;
    await clearSyncList(syncListName);
  }

  await clearSyncList('votes');
  await clearSyncMap('players');
}

const clearSyncList = async (syncListUnqiueName) => {
  const list = await syncClient.list(syncListUnqiueName);
  const listItems = await list.getItems();
  console.log('list', list);
  console.log('listItems', listItems);
  const {items} = listItems;
  
  for(const anItem of items) {
    const { data } = anItem;
    const { index } = data;

    await list.remove(index);
  }
}

const clearSyncMap = async (syncMapUniqueName) => {
  const map = await syncClient.map(syncMapUniqueName);
  const mapItems = await map.getItems();

  console.log(mapItems);

  const items = mapItems.items;

  for(const aPage of items) {
    const {key} = aPage;
    await map.remove(key);
  }
}