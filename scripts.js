let nodes = [];
let selectedNode = null;
let arcos = [];

function getNodeAt(x, y, nodes) {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const a = x - node.x;
    const b = y - node.y;

    const c = Math.sqrt(a * a + b * b);

    if (c < 90) {
      return node;
    }
  }
  return null;
}

function drawNodes(ctx, nodes) {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];

    if (node === selectedNode) {
      ctx.strokeStyle = "#FF0000";
    } else {
      ctx.strokeStyle = "#000000";
    }

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.arc(node.x, node.y, 40, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    if (node === selectedNode) {
      ctx.fillStyle = "#FF0000";
    } else {
      ctx.fillStyle = "#000000";
    }

    ctx.font = "30px Arial";
    ctx.fillText(index, node.x - 5, node.y + 5);
  }
}

function drawArcos(ctx, arcos) {
  for (let index = 0; index < arcos.length; index++) {
    const arco = arcos[index];
    ctx.moveTo(arco.node1.x, arco.node1.y);
    ctx.lineTo(arco.node2.x, arco.node2.y);
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  }
}

function deleteNode(node) {
  // Eliminar el nodo del lienzo
  nodes.splice(nodes.indexOf(node), 1);

  // Eliminar los vértices (arcos) conectados al nodo
  for (let i = arcos.length - 1; i >= 0; i--) {
    const arco = arcos[i];
    if (arco.node1 === node || arco.node2 === node) {
      arcos.splice(i, 1);
    }
  }
}

function findPath() {
  if (nodes.length < 2) {
    alert("Debe haber al menos 2 nodos para encontrar un camino");
    return [];
  }

  let startNodeId = parseInt(document.getElementById("startNode").value);
  let endNodeId = parseInt(document.getElementById("endNode").value);

  if (isNaN(startNodeId) || isNaN(endNodeId)) {
    alert("IDs de nodo no válidos");
    return [];
  }

  if (startNodeId < 0 || startNodeId >= nodes.length || endNodeId < 0 || endNodeId >= nodes.length) {
    alert("IDs de nodo fuera de rango");
    return [];
  }

  let startNode = nodes[startNodeId];
  let endNode = nodes[endNodeId];

  let adjacencyMatrix = createAdjacencyMatrix();

  let queue = [];
  let visited = new Set();
  let prev = {};

  queue.push(startNodeId);
  visited.add(startNodeId);

  while (queue.length > 0) {
    let currentNodeId = queue.shift();

    if (currentNodeId === endNodeId) {
      break; // Se encontró el camino
    }

    for (let i = 0; i < nodes.length; i++) {
      if (adjacencyMatrix[currentNodeId][i] === 1 && !visited.has(i)) {
        queue.push(i);
        visited.add(i);
        prev[i] = currentNodeId;
      }
    }
  }

  if (!(endNodeId in prev)) {
    alert("No se encontró un camino entre los nodos");
    return [];
  }

  let path = [];
  let currentNodeId = endNodeId;

  while (currentNodeId !== startNodeId) {
    path.unshift(nodes[currentNodeId]);
    currentNodeId = prev[currentNodeId];
  }

  path.unshift(startNode);

  return path;
}



function createAdjacencyMatrix() {
  let matrix = [];

  for (let i = 0; i < nodes.length; i++) {
    matrix[i] = [];

    for (let j = 0; j < nodes.length; j++) {
      matrix[i][j] = 0;
    }
  }

  for (let i = 0; i < arcos.length; i++) {
    let arco = arcos[i];
    let node1Index = nodes.indexOf(arco.node1);
    let node2Index = nodes.indexOf(arco.node2);
    matrix[node1Index][node2Index] = 1;
    matrix[node2Index][node1Index] = 1;
  }

  return matrix;
}

// ...

function findSecondPath() {
  if (nodes.length < 2) {
    alert("Debe haber al menos 2 nodos para encontrar un camino");
    return;
  }

  let startNodeId = parseInt(document.getElementById("startNode").value);
  let endNodeId = parseInt(document.getElementById("endNode").value);

  if (isNaN(startNodeId) || isNaN(endNodeId)) {
    alert("IDs de nodo no válidos");
    return;
  }

  if (startNodeId < 0 || startNodeId >= nodes.length || endNodeId < 0 || endNodeId >= nodes.length) {
    alert("IDs de nodo fuera de rango");
    return;
  }

  let startNode = nodes[startNodeId];
  let endNode = nodes[endNodeId];

  let adjacencyMatrix = createAdjacencyMatrix();

  let queue = [];
  let visited = new Set();
  let prev = {};

  queue.push(startNodeId);
  visited.add(startNodeId);

  while (queue.length > 0) {
    let currentNodeId = queue.shift();

    for (let i = 0; i < nodes.length; i++) {
      if (adjacencyMatrix[currentNodeId][i] === 1 && !visited.has(i)) {
        queue.push(i);
        visited.add(i);
        prev[i] = currentNodeId;
      }
    }
  }

  if (!(endNodeId in prev)) {
    alert("No se encontró un camino entre los nodos");
    return;
  }

  let optimalPath = [];
  let currentNodeId = endNodeId;

  while (currentNodeId !== startNodeId) {
    optimalPath.unshift(nodes[currentNodeId]);
    currentNodeId = prev[currentNodeId];
  }

  optimalPath.unshift(startNode);

  // Eliminar el primer camino óptimo encontrado
  deleteArcosFromPath(optimalPath);

  // Encontrar el segundo camino óptimo
  let secondPath = findPath();

  // Restaurar el primer camino óptimo encontrado
  restoreArcos();

  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawArcos(context, arcos);
  drawNodes(context, nodes);

  // Dibujar el primer camino óptimo en azul
  context.beginPath();
  context.lineWidth = 6;
  context.strokeStyle = "#0000FF";
  context.moveTo(optimalPath[0].x, optimalPath[0].y);

  for (let i = 1; i < optimalPath.length; i++) {
    context.lineTo(optimalPath[i].x, optimalPath[i].y);
  }

  context.stroke();

  // Dibujar el segundo camino óptimo en verde
  context.beginPath();
  context.lineWidth = 6;
  context.strokeStyle = "#00FF00";
  context.moveTo(secondPath[0].x, secondPath[0].y);

  for (let i = 1; i < secondPath.length; i++) {
    context.lineTo(secondPath[i].x, secondPath[i].y);
  }

  context.stroke();
}

function findThirdPath() {
  if (nodes.length < 2) {
    alert("Debe haber al menos 2 nodos para encontrar un camino");
    return;
  }

  let startNodeId = parseInt(document.getElementById("startNode").value);
  let endNodeId = parseInt(document.getElementById("endNode").value);

  if (isNaN(startNodeId) || isNaN(endNodeId)) {
    alert("IDs de nodo no válidos");
    return;
  }

  if (startNodeId < 0 || startNodeId >= nodes.length || endNodeId < 0 || endNodeId >= nodes.length) {
    alert("IDs de nodo fuera de rango");
    return;
  }

  let startNode = nodes[startNodeId];
  let endNode = nodes[endNodeId];

  let adjacencyMatrix = createAdjacencyMatrix();

  let queue = [];
  let visited = new Set();
  let prev = {};

  queue.push(startNodeId);
  visited.add(startNodeId);

  while (queue.length > 0) {
    let currentNodeId = queue.shift();

    for (let i = 0; i < nodes.length; i++) {
      if (adjacencyMatrix[currentNodeId][i] === 1 && !visited.has(i)) {
        queue.push(i);
        visited.add(i);
        prev[i] = currentNodeId;
      }
    }
  }

  if (!(endNodeId in prev)) {
    alert("No se encontró un camino entre los nodos");
    return;
  }

  let optimalPath = [];
  let currentNodeId = endNodeId;

  while (currentNodeId !== startNodeId) {
    optimalPath.unshift(nodes[currentNodeId]);
    currentNodeId = prev[currentNodeId];
  }

  optimalPath.unshift(startNode);

  // Eliminar el primer y segundo caminos óptimos encontrados
  deleteArcosFromPath(optimalPath);
  let secondPath = findPath();
  deleteArcosFromPath(secondPath);

  // Encontrar el tercer camino óptimo
  let thirdPath = findPath();

  // Restaurar los caminos óptimos eliminados
  restoreArcos();

  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawArcos(context, arcos);
  drawNodes(context, nodes);

  // Dibujar el primer camino óptimo en azul
  context.beginPath();
  context.lineWidth = 6;
  context.strokeStyle = "#0000FF";
  context.moveTo(optimalPath[0].x, optimalPath[0].y);

  for (let i = 1; i < optimalPath.length; i++) {
    context.lineTo(optimalPath[i].x, optimalPath[i].y);
  }

  context.stroke();

  // Dibujar el segundo camino óptimo en verde
  context.beginPath();
  context.lineWidth = 6;
  context.strokeStyle = "#00FF00";
  context.moveTo(secondPath[0].x, secondPath[0].y);

  for (let i = 1; i < secondPath.length; i++) {
    context.lineTo(secondPath[i].x, secondPath[i].y);
  }

  context.stroke();

  // Dibujar el tercer camino óptimo en rojo
  context.beginPath();
  context.lineWidth = 6;
  context.strokeStyle = "#FF0000";
  context.moveTo(thirdPath[0].x, thirdPath[0].y);

  for (let i = 1; i < thirdPath.length; i++) {
    context.lineTo(thirdPath[i].x, thirdPath[i].y);
  }

  context.stroke();
}



function deleteArcosFromPath(path) {
  let arcosToRemove = [];

  for (let i = path.length - 1; i > 0; i--) {
    for (let j = arcos.length - 1; j >= 0; j--) {
      const arco = arcos[j];
      if (
        (arco.node1 === path[i] && arco.node2 === path[i - 1]) ||
        (arco.node1 === path[i - 1] && arco.node2 === path[i])
      ) {
        arcosToRemove.push(j);
      }
    }
  }

  // Eliminar las aristas del array 'arcos'
  for (let i = arcosToRemove.length - 1; i >= 0; i--) {
    arcos.splice(arcosToRemove[i], 1);
  }
}


function restoreArcos() {
  // Restaurar los arcos eliminados
  arcos = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      arcos.push({ node1: nodes[i], node2: nodes[j] });
    }
  }
}



// ...








window.onload = async () => {
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

  canvas.addEventListener("click", (e) => {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;

    let tempNode = getNodeAt(x, y, nodes);

    if (selectedNode !== null && tempNode === null) {
      selectedNode = tempNode;
      tempNode = null;
    }

    if (selectedNode === null) {
      selectedNode = tempNode;
      tempNode = null;
    }

    if (selectedNode === null) {
      nodes.push({ x, y });
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedNode !== null && tempNode !== null) {
      arcos.push({ node1: selectedNode, node2: tempNode });
      selectedNode = null;
      tempNode = null;
    }
    drawArcos(context, arcos);
    drawNodes(context, nodes);
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Evita que aparezca el menú contextual del navegador

    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;

    let tempNode = getNodeAt(x, y, nodes);

    if (tempNode !== null) {
      // Eliminar el nodo y los vértices conectados
      deleteNode(tempNode);
      selectedNode = null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawArcos(context, arcos);
    drawNodes(context, nodes);
  });

};