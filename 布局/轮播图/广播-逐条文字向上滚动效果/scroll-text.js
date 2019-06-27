
/*
* vertical news ticker
* Tadas Juozapaitis ( kasp3rito@gmail.com )
* http://plugins.jquery.com/project/vTicker
*/

(function($){
  $.fn.vTicker = function(customerParam){ // customerParam:用户重新设置的参数
    var oldParam = {
      speed: 700,
      pause: 4000,
      showItems: 3,
      animation: "",
      mousePause: true,
      isPaused: false,
      direction: "up",
      height: 0
    };

    var newParam = $.extend(oldParam, customerParam); // 新参数的值会覆盖旧参数的值

    moveUp = function(parent, height, param){ // height: li的最大高度
      if(param.isPaused) return;

      var ulLists = parent.children('ul.'+ param.className); // 所有可以滚动的ul元素
      var filrtLiEl = ulLists.children("li:first").clone(true); // 克隆ul的第一个li子元素

      if(param.height > 0){
        height = ulLists.children("li:first").height();
      }

      ulLists.animate({top:"-=" + height + "px"}, param.speed, function(){
        // 移动后的回调
        $(this).children('li:first').remove();
        $(this).css('top','0px')});

      if(param.animation === 'fade'){
        ulLists.children('li:first').fadeOut(param.speed);
        if(param.height == 0){
          ulLists.children("li:eq("+ param.showItems+")").hide().fadeIn(param.speed);
        }
      }

      filrtLiEl.appendTo(ulLists); // 将第一个插入到最后位置
    };

    moveDown = function(parent, height, param){ // document, 第一个li的高度
      if(param.isPaused) return;

      var ulLists = parent.children('ul.' + param.className);
      var lastLiEl = ulLists.children('li:last').clone(true); // clone最后一个

      if(param.height > 0){
        height = ulLists.children('li:first').height(); // 最后一个li的高度
      }
      ulLists.css("top","-"+ height +"px").prepend(lastLiEl); // 将最后一个插入开始位置

      ulLists.animate({ top:0 }, param.speed, function(){
        $(this).children('li:last').remove(); // 移除最后一个
      });

      if(param.animation === 'fade'){
        if(param.height == 0){
          ulLists.children("li:eq("+ param.showItems+")").fadeOut(param.speed);
        }
        lastLiEl.hide().fadeIn(param.speed)
      }
    };

    return this.each(function(){
      var $this = $(this); // document
      var height = 0; // ul中li的高度
      $this.css({ overflow: 'hidden', position: 'relative' });
      $this.children('ul.' + param.className).css({ position: 'absolute', margin:0, padding:0 });
      $this.children('li').css({ margin:0,padding:0 });

      if(newParam.height == 0){
        var allLis = $this.children('ul').children('li');

        // 获取li的最大高度
        allLis.each(function(){
          if($(this).height()> height){
            height = $(this).height();
          }
        });

        // 给每个li设置高度为最大高度
        allLis.each(function(){
          $(this).height(height);
        });

        $this.height(height * newParam.showItems)

      } else {
        $this.height(newParam.height); // 设置总高度
      }

      // 自动滚动
      var setIntervalId = setInterval(function(){
        if(newParam.direction=="up"){
          moveUp($this, height, newParam)
        } else {
          moveDown($this, height, newParam)
        }
      }, newParam.pause);

      if(newParam.mousePause){
        $this.bind("mouseenter",function(){
          newParam.isPaused = true;
        });

        $this.bind("mouseleave",function(){
          newParam.isPaused = false;
        });
      }
    })
  }
})(jQuery);