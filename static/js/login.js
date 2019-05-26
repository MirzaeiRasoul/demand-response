(function ($) {
  // USE STRICT
  "use strict";
  try {

    var message = $("#login-message").html();
    if (message == 100) {
      alert("نام کاربری یا کلمه عبور به درستی وارد نشده است.");
    }

  } catch (error) {
    console.log(error);
  }
  
})(jQuery);