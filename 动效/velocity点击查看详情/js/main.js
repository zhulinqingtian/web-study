jQuery(document).ready(function ($) {
  var sliderFinalWidth = 400, maxQuickWidth = 900;
  $('.cd-trigger').on('click', function (event) {
    var selectedImage = $(this).parent('.cd-item').children('img'), slectedImageUrl = selectedImage.attr('src');
    $('body').addClass('overlay-layer');
    animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');
    updateQuickView(slectedImageUrl);
  });
  $('body').on('click', function (event) {
    if ($(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
      closeQuickView(sliderFinalWidth, maxQuickWidth);
    }
  });
  $(document).keyup(function (event) {
    if (event.which == '27') {
      closeQuickView(sliderFinalWidth, maxQuickWidth);
    }
  });
  $('.cd-quick-view').on('click', '.cd-slider-navigation a', function () {
    updateSlider($(this));
  });
  $(window).on('resize', function () {
    if ($('.cd-quick-view').hasClass('is-visible')) {
      window.requestAnimationFrame(resizeQuickView);
    }
  });

  function updateSlider(navigation) {
    var sliderConatiner = navigation.parents('.cd-slider-wrapper').find('.cd-slider'),
      activeSlider = sliderConatiner.children('.selected').removeClass('selected');
    if (navigation.hasClass('cd-next')) {
      (!activeSlider.is(':last-child')) ? activeSlider.next().addClass('selected') : sliderConatiner.children('li').eq(0).addClass('selected');
    } else {
      (!activeSlider.is(':first-child')) ? activeSlider.prev().addClass('selected') : sliderConatiner.children('li').last().addClass('selected');
    }
  }

  function updateQuickView(url) {
    $('.cd-quick-view .cd-slider li').removeClass('selected').find('img[src="' + url + '"]').parent('li').addClass('selected');
  }

  function resizeQuickView() {
    var quickViewLeft = ($(window).width() - $('.cd-quick-view').width()) / 2,
      quickViewTop = ($(window).height() - $('.cd-quick-view').height()) / 2;
    $('.cd-quick-view').css({"top": quickViewTop, "left": quickViewLeft,});
  }

  function closeQuickView(finalWidth, maxQuickWidth) {
    var close = $('.cd-close'),
      activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),
      selectedImage = $('.empty-box').find('img');
    if (!$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
      selectedImage.attr('src', activeSliderUrl);
      animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
    } else {
      closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
    }
  }

  function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
    var parentListItem = image.parent('.cd-item'), topSelected = image.offset().top - $(window).scrollTop(),
      leftSelected = image.offset().left, widthSelected = image.width(), heightSelected = image.height(),
      windowWidth = $(window).width(), windowHeight = $(window).height(), finalLeft = (windowWidth - finalWidth) / 2,
      finalHeight = finalWidth * heightSelected / widthSelected, finalTop = (windowHeight - finalHeight) / 2,
      quickViewWidth = (windowWidth * .8 < maxQuickWidth) ? windowWidth * .8 : maxQuickWidth,
      quickViewLeft = (windowWidth - quickViewWidth) / 2;
    if (animationType == 'open') {
      parentListItem.addClass('empty-box');
      $('.cd-quick-view').css({
        "top": topSelected,
        "left": leftSelected,
        "width": widthSelected,
      }).velocity({
        'top': finalTop + 'px',
        'left': finalLeft + 'px',
        'width': finalWidth + 'px',
      }, 1000, [400, 20], function () {
        $('.cd-quick-view').addClass('animate-width').velocity({
          'left': quickViewLeft + 'px',
          'width': quickViewWidth + 'px',
        }, 300, 'ease', function () {
          $('.cd-quick-view').addClass('add-content');
        });
      }).addClass('is-visible');
    } else {
      $('.cd-quick-view').removeClass('add-content').velocity({
        'top': finalTop + 'px',
        'left': finalLeft + 'px',
        'width': finalWidth + 'px',
      }, 300, 'ease', function () {
        $('body').removeClass('overlay-layer');
        $('.cd-quick-view').removeClass('animate-width').velocity({
          "top": topSelected,
          "left": leftSelected,
          "width": widthSelected,
        }, 500, 'ease', function () {
          $('.cd-quick-view').removeClass('is-visible');
          parentListItem.removeClass('empty-box');
        });
      });
    }
  }

  function closeNoAnimation(image, finalWidth, maxQuickWidth) {
    var parentListItem = image.parent('.cd-item'), topSelected = image.offset().top - $(window).scrollTop(),
      leftSelected = image.offset().left, widthSelected = image.width();
    $('body').removeClass('overlay-layer');
    parentListItem.removeClass('empty-box');
    $('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
      "top": topSelected,
      "left": leftSelected,
      "width": widthSelected,
    });
  }
});