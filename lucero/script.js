$(function() {
  FastClick.attach(document.body);
  window.map = {
    $el: $('#map'),
    tiles: [
      [9, 5, 5, 1, 5, 5, 3],
      [10, 9, 5, 0, 5, 3, 10],
      [10, 10, 9, 0, 3, 10, 10],
      [8, 4, 6, 10, 12, 4, 2],
      [10, 9, 5, 0, 5, 3, 10],
      [8, 0, 3, 10, 9, 0, 2],
      [10, 10, 12, 0, 6, 10, 10],
      [10, 12, 1, 4, 1, 6, 10],
      [12, 5, 4, 5, 4, 5, 6]
    ]
  };
  window.score = 0;

  window.lucero = {
    $el: $('#lucero'),
    speed: 4
  };
  window.ladrones = [
    {
      $el: $('#ladron0'),
      speed: 2
    },
    {
      $el: $('#ladron1'),
      speed: 1.5
    },
    {
      $el: $('#ladron2'),
      speed: 1
    }
  ];
  window.candies = [];
  while (candies.length < 8) {
    var candy = parseInt(Math.random() * 63);
    if (candies.indexOf(candy) < 0) candies.push(candy);
  }

  $(map.tiles).each(function(y, row) {
    $(row).each(function(x, tile) {
      var $tile = generateTile(x, y, tile);
      map.$el.append($tile);
    });
  });

  $(candies).each(function(index, candy) {
    $('.tile').eq(candy).addClass('candy');
  });

  start();

  $('.tile').click(function() {
    var x = $(this).data('x');
    var y = $(this).data('y');
    moveSprite(lucero, x, y);
    return false;
  });
});

var tile_width = 40;
var tile_height = 40;

function generateTile(x, y, tile) {
  return $('<div />').attr({ class: 'tile walls-' + tile }).data({
    x: x,
    y: y
  }).css({
    top: y * tile_width,
    left: x * tile_height
  });
};

function start() {
  window.lucero.x = 3;
  window.lucero.y = 7;
  window.lucero.stop = false;

  window.ladrones[0].x = 3;
  window.ladrones[0].y = 4;
  window.ladrones[0].direction = 'up';

  window.ladrones[1].x = 2;
  window.ladrones[1].y = 3;
  window.ladrones[1].direction = 'left';

  window.ladrones[2].x = 4;
  window.ladrones[2].y = 3;
  window.ladrones[2].direction = 'right';

  lucero.$el.css({
    top: lucero.y * tile_width,
    left: lucero.x * tile_height
  });
  clearTimeout(lucero.engine);
  $(ladrones).each(function(index, ladron) {
    ladron.$el.css({
      top: ladron.y * tile_width,
      left: ladron.x * tile_height
    });
    clearInterval(ladron.engine);
    ladron.engine = setInterval(function() { moverLadron(ladron) }, 1000 / ladron.speed);
  });
};

function moveSprite(sprite, x, y) {
  if (sprite.stop) return;
  clearTimeout(sprite.engine);
  var delta_x = x - sprite.x;
  var delta_y = y - sprite.y;
  var time = 1000 / sprite.speed;

  if (Math.abs(delta_x) >= Math.abs(delta_y)) {
    if (delta_x < 0) { // LEFT
      if (wall('left', sprite.x, sprite.y)) return;
      sprite.x -= 1;
    } else if (delta_x > 0) {           // RIGHT
      if (wall('right', sprite.x, sprite.y)) return;
      sprite.x += 1;
    }
  } else {
    if (delta_y < 0) { // UP
      if (wall('up', sprite.x, sprite.y)) return;
      sprite.y -= 1;
    } else {           // DOWN
      if (wall('down', sprite.x, sprite.y)) return;
      sprite.y += 1;
    }
  }

  $tile = $('.tile').eq(sprite.y * 7 + sprite.x);
  if ($tile.hasClass('candy')) {
    $tile.removeClass('candy');
    window.score += 1;
  }

  if (checkmap()) return;
  sprite.$el.animate({
    top: sprite.y * tile_width,
    left: sprite.x * tile_height
  }, time);

  if (window.score == 8 && !window.erik.$el) return cambio();

  if (delta_x == 0 && delta_y == 0) {
    return true;
  } else {
    sprite.engine = setTimeout(function() { moveSprite(sprite, x, y) }, time);
  }
};

function wall(direction, x, y) {
  var tile = map.tiles[y][x];

  switch(direction) {
    case 'up':
      return tile % 2 == 1;
    case 'right':
      return tile % 4 == 2 || tile % 4 == 3;
    case 'down':
      return tile % 8 >= 4;
    case 'left':
      return tile >= 8;
  };
};

function moverLadron(ladron) {
  var delta_x = lucero.x - ladron.x;
  var delta_y = lucero.y - ladron.y;

  newDirection = function(ladron) {
    switch(ladron.direction) {
      case 'up':
        if (delta_x > 0 && !wall('right', ladron.x, ladron.y)) return 'right';
        if (delta_x < 0 && !wall('left', ladron.x, ladron.y)) return 'left';
        if (wall('up', ladron.x, ladron.y)) {
          return wall('right', ladron.x, ladron.y) ? 'left' : 'right';
        }
        break;
      case 'right':
        if (delta_y > 0 && !wall('down', ladron.x, ladron.y)) return 'down';
        if (delta_y < 0 && !wall('up', ladron.x, ladron.y)) return 'up';
        if (wall('right', ladron.x, ladron.y)) {
          return wall('down', ladron.x, ladron.y) ? 'up' : 'down';
        }
        break;
      case 'down':
        if (delta_x < 0 && !wall('left', ladron.x, ladron.y)) return 'left';
        if (delta_x > 0 && !wall('right', ladron.x, ladron.y)) return 'right';
        if (wall('down', ladron.x, ladron.y)) {
          return wall('left', ladron.x, ladron.y) ? 'right' : 'left';
        }
        break;
      case 'left':
        if (delta_y < 0 && !wall('up', ladron.x, ladron.y)) return 'up';
        if (delta_y > 0 && !wall('down', ladron.x, ladron.y)) return 'down';
        if (wall('left', ladron.x, ladron.y)) {
          return wall('up', ladron.x, ladron.y) ? 'down' : 'up';
        }
        break;
    }
    return ladron.direction;
  };

  ladron.direction = newDirection(ladron);

  switch(ladron.direction) {
    case 'up':
      ladron.y -= 1;
      break;
    case 'right':
      ladron.x += 1;
      break;
    case 'down':
      ladron.y += 1;
      break;
    case 'left':
      ladron.x -= 1;
      break;
  }

  if (checkmap()) return;
  ladron.$el.animate({
    top: ladron.y * tile_width,
    left: ladron.x * tile_height
  }, 1000 / ladron.speed);
};

function checkmap() {
  if (window.erik.$el) {
    if (erik.x == lucero.x && erik.y == lucero.y)
      ganar();
  } else {
    var dead = false;
    $(ladrones).each(function(index, ladron) {
      if (ladron.x == lucero.x && ladron.y == lucero.y)
        dead = true;
    });
    if (!dead) return false;

    stop();
    setTimeout(start, 1000);
    return true;
  }
};

function stop() {
  $(ladrones).each(function(index, ladron) {
    clearInterval(ladron.engine);
  });
  clearTimeout(lucero.engine);
  lucero.stop = true;
}

function cambio() {
  $(ladrones).each(function(index, ladron) {
    clearInterval(ladron.engine);
    ladron.$el.hide();
  });
  window.erik = {
    $el: $('#erik'),
    speed: 3,
    x: 3,
    y: 4,
    direction: 'down'
  };
  erik.$el.css({
    top: erik.y * tile_width,
    left: erik.x * tile_height
  });
  erik.$el.show();
  erik.engine = setInterval(function() { moverLadron(erik) }, 1000 / erik.speed);
}

function ganar() {
  clearInterval(erik.engine);
  setTimeout(function() {
    erik.$el.animate({
      top: erik.y * tile_width,
      left: erik.x * tile_height + tile_height / 2
    })
  }, 1000 / erik.speed);
  stop();
  setTimeout(corazon, 1500);
}

function corazon() {
  $('#corazon').show()
  $('#corazon').css({
    top: erik.y * tile_width + tile_height /2,
    left: erik.x * tile_height + tile_height / 2
  });
  $('#corazon').animate({
    width: 421,
    height: 458,
    top: -50,
    left: -75
  }, 4500, function() { $('#mensaje').show() });
}
