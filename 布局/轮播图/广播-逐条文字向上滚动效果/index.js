$(function(){
  $('#news-container').vTicker({
    speed: 500,
    pause: 2000,
    animation: 'fade',
    mousePause: false,
    showItems: 2,
    className: 'to-scroll'
  });
  $('#news-container1').vTicker({
    speed: 500,
    pause: 2000,
    animation: 'fade',
    mousePause: false,
    showItems: 1,
    className: 'to-scroll'
  });
});